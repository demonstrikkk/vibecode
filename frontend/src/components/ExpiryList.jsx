import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Trash2, Lightbulb, Loader2 } from 'lucide-react';
import api from '../config/api';

// Component to format AI response with markdown-like styling
const FormattedAIResponse = ({ text }) => {
  const formatInlineText = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    while (currentText) {
      // Bold text **text**
      const boldMatch = currentText.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = currentText.substring(0, boldMatch.index);
        if (beforeBold) parts.push(<span key={key++}>{beforeBold}</span>);
        parts.push(
          <strong key={key++} className="font-bold text-amber-900">
            {boldMatch[1]}
          </strong>
        );
        currentText = currentText.substring((boldMatch.index || 0) + boldMatch[0].length);
      }
      // Italic text *text* (single asterisk)
      else if (currentText.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)) {
        const italicMatch = currentText.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
        if (italicMatch) {
          const beforeItalic = currentText.substring(0, italicMatch.index);
          if (beforeItalic) parts.push(<span key={key++}>{beforeItalic}</span>);
          parts.push(
            <em key={key++} className="italic text-amber-800">
              {italicMatch[1]}
            </em>
          );
          currentText = currentText.substring((italicMatch.index || 0) + italicMatch[0].length);
        } else {
          break;
        }
      } else {
        parts.push(<span key={key++}>{currentText}</span>);
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  const formatText = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-2 my-4 ml-6">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-800 leading-relaxed flex items-start">
                <span className="text-amber-600 mr-2 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        elements.push(<div key={`space-${index}`} className="h-3" />);
        return;
      }

      // Headers with multiple asterisks or hash symbols
      if (/^#{1,3}\s+(.+)$/.test(trimmedLine) || /^\*{2,}\s*(.+?)\s*\*{2,}$/.test(trimmedLine)) {
        flushList();
        const headerText = trimmedLine.replace(/^#+\s+/, '').replace(/^\*+\s*/, '').replace(/\s*\*+$/, '');
        const level = (trimmedLine.match(/^#+/) || [''])[0].length || 2;
        
        if (level === 1 || trimmedLine.includes('***')) {
          elements.push(
            <h2 key={index} className="text-2xl font-bold text-amber-900 mt-6 mb-3 flex items-center gap-2">
              <span className="text-amber-600">✨</span>
              {headerText}
            </h2>
          );
        } else {
          elements.push(
            <h3 key={index} className="text-xl font-bold text-amber-800 mt-5 mb-3">
              {headerText}
            </h3>
          );
        }
      }
      // Numbered lists (1. 2. 3.)
      else if (/^\d+\.\s+(.+)$/.test(trimmedLine)) {
        flushList();
        const match = trimmedLine.match(/^\d+\.\s+(.+)$/);
        if (match) {
          const number = trimmedLine.match(/^(\d+)\./)?.[1];
          const text = match[1];
          elements.push(
            <div key={index} className="flex items-start gap-3 my-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                {number}
              </span>
              <p className="text-gray-800 leading-relaxed flex-1 pt-0.5">{formatInlineText(text)}</p>
            </div>
          );
        }
      }
      // Bullet points (-, *, •)
      else if (/^[-*•]\s+(.+)$/.test(trimmedLine)) {
        const text = trimmedLine.replace(/^[-*•]\s+/, '');
        listItems.push(text);
      }
      // Bold text with **text**
      else if (trimmedLine.includes('**')) {
        flushList();
        elements.push(
          <p key={index} className="text-gray-800 leading-relaxed my-2">
            {formatInlineText(trimmedLine)}
          </p>
        );
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p key={index} className="text-gray-800 leading-relaxed my-2">
            {formatInlineText(trimmedLine)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return <div className="space-y-1">{formatText(text)}</div>;
};

const ExpiryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adviceLoading, setAdviceLoading] = useState(null);
  const [selectedAdvice, setSelectedAdvice] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/expiry/items');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const deleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!itemId || itemId === 'undefined') {
      alert('Invalid item ID');
      return;
    }

    try {
      await fetch(api.expiryItemById(itemId), { method: 'DELETE' });
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const getAdvice = async (itemId, itemName) => {
    if (!itemId || itemId === 'undefined') {
      alert('Invalid item ID');
      return;
    }
    setAdviceLoading(itemId);
    try {
      const response = await fetch(api.expiryItemAdvice(itemId), {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Failed to get advice: ${response.status}`);
      }
      const data = await response.json();
      setSelectedAdvice({
        itemName,
        advice: data.advice,
        daysLeft: data.daysLeft,
      });
    } catch (error) {
      console.error('Error generating advice:', error);
      alert('Failed to generate advice');
    } finally {
      setAdviceLoading(null);
    }
  };

  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 1) return 'bg-red-100 border-red-500 text-red-900';
    if (daysLeft <= 3) return 'bg-orange-100 border-orange-500 text-orange-900';
    if (daysLeft <= 7) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    return 'bg-green-100 border-green-500 text-green-900';
  };

  const getUrgencyIcon = (daysLeft) => {
    if (daysLeft <= 3)
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    return <CheckCircle className="w-5 h-5 text-green-600" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-amber-900">Your Pantry</h2>
        <span className="text-sm text-amber-700">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-amber-50 rounded-lg border-2 border-dashed border-amber-300">
          <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <p className="text-amber-800 font-semibold">No items yet</p>
          <p className="text-amber-600 text-sm mt-2">
            Add your first grocery item to start tracking expiry dates
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id || item._id}
              className={`rounded-lg border-2 p-4 transition-all ${getUrgencyColor(
                item.daysLeft
              )}`}
            >
              <div className="flex items-start justify-between">
                {/* Item Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getUrgencyIcon(item.daysLeft)}
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                      {item.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="font-semibold">Purchased:</span>{' '}
                      {formatDate(item.purchaseDate)}
                    </div>
                    <div>
                      <span className="font-semibold">Safe by:</span>{' '}
                      {formatDate(item.prediction.safeExpiry)}
                    </div>
                    <div>
                      <span className="font-semibold">Quantity:</span>{' '}
                      {item.quantity}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">
                        {item.daysLeft} day{item.daysLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-sm italic opacity-75 mb-3">
                      Note: {item.notes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => getAdvice(item.id || item._id, item.name)}
                      disabled={adviceLoading === (item.id || item._id)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 bg-white/80 hover:bg-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {adviceLoading === (item.id || item._id) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4" />
                          Get Recipes & Tips
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteItem(item.id || item._id)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-800 rounded-lg font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advice Modal - AI Chatbot Style */}
      {selectedAdvice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedAdvice(null)}
        >
          <div
            className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto border-2 border-amber-200 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-900">
                    AI Recommendations
                  </h3>
                  <p className="text-sm text-amber-700">for {selectedAdvice.itemName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdvice(null)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors hover:rotate-90 transform duration-200"
              >
                ×
              </button>
            </div>

            {/* Days Left Alert */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 p-4 mb-6 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <p className="font-bold text-amber-900">
                  ⏰ {selectedAdvice.daysLeft} day
                  {selectedAdvice.daysLeft !== 1 ? 's' : ''} remaining until expiry
                </p>
              </div>
            </div>

            {/* AI Response with Formatted Text */}
            <div className="bg-white rounded-xl p-6 shadow-inner border border-amber-100 mb-6">
              <div className="prose prose-amber max-w-none">
                <FormattedAIResponse text={selectedAdvice.advice} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAdvice(null)}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryList;
