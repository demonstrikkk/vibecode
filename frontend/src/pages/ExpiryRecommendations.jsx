import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import {
  Clock,
  AlertTriangle,
  ChefHat,
  Sparkles,
  Loader2,
  RefreshCw,
  Calendar,
  Package,
  Lightbulb,
  CheckCircle,
  Trash2
} from 'lucide-react';
import VintageRecipeCard from '../components/VintageRecipeCard';

const ExpiryRecommendations = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(null);
  const [selectedAdvice, setSelectedAdvice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const response = await fetch(api.expiryItems, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      // Sort by days left (most urgent first)
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => a.daysLeft - b.daysLeft);
      setItems(sorted);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load expiring items');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyLevel = (daysLeft) => {
    if (daysLeft <= 1) return { level: 'critical', color: 'red', label: 'Use Today!' };
    if (daysLeft <= 3) return { level: 'urgent', color: 'orange', label: 'Use Soon' };
    if (daysLeft <= 7) return { level: 'warning', color: 'yellow', label: 'This Week' };
    return { level: 'good', color: 'green', label: 'Fresh' };
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateMultiItemRecipe = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to generate a recipe');
      return;
    }

    setGeneratingRecipe(true);
    setRecipe(null);
    setError(null);

    try {
      const response = await fetch(api.multiRecipe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item_ids: selectedItems })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);  // Extract recipe from response
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError(err.message || 'Failed to generate recipe');
    } finally {
      setGeneratingRecipe(false);
    }
  };

  const getAdvice = async (itemId, itemName) => {
    setAdviceLoading(itemId);
    try {
      const response = await fetch(api.expiryItemAdvice(itemId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Group items by urgency
  const criticalItems = items.filter(item => item.daysLeft <= 1);
  const urgentItems = items.filter(item => item.daysLeft > 1 && item.daysLeft <= 3);
  const warningItems = items.filter(item => item.daysLeft > 3 && item.daysLeft <= 7);
  const goodItems = items.filter(item => item.daysLeft > 7);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-700 mx-auto mb-4" />
          <p className="text-amber-800 font-semibold">Loading your pantry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-amber-700 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Clock className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif">Expiry Recommendations</h1>
              <p className="text-orange-200 mt-1">Use expiring ingredients before they go to waste</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{criticalItems.length}</div>
              <div className="text-sm text-red-100">Critical (Today)</div>
            </div>
            <div className="bg-orange-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{urgentItems.length}</div>
              <div className="text-sm text-orange-100">Urgent (2-3 days)</div>
            </div>
            <div className="bg-yellow-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{warningItems.length}</div>
              <div className="text-sm text-yellow-100">This Week</div>
            </div>
            <div className="bg-green-500/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{goodItems.length}</div>
              <div className="text-sm text-green-100">Fresh</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300">
            <Package className="w-20 h-20 text-amber-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Your pantry is empty!</h3>
            <p className="text-amber-700 max-w-md mx-auto mb-6">
              Add items to your pantry to get expiry recommendations and recipe suggestions.
            </p>
            <a
              href="/pantry"
              className="inline-flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-800 transition-colors"
            >
              <Package className="w-5 h-5" />
              Go to Pantry
            </a>
          </div>
        ) : (
          <>
            {/* Selection Panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  Generate Recipe from Expiring Items
                </h2>
                <span className="text-sm text-amber-600 font-medium">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <p className="text-amber-700 mb-4">
                Select multiple items below to generate a recipe that uses them all!
              </p>

              <button
                onClick={generateMultiItemRecipe}
                disabled={selectedItems.length === 0 || generatingRecipe}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {generatingRecipe ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating recipe...
                  </>
                ) : (
                  <>
                    <ChefHat className="w-6 h-6" />
                    Generate Recipe with {selectedItems.length} Item{selectedItems.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                <p className="text-red-800 font-semibold">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 flex items-center gap-2 text-red-700 hover:text-red-900 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            )}

            {/* Recipe Display */}
            {recipe && (
              <div className="mb-8">
                <VintageRecipeCard recipe={recipe} />
              </div>
            )}

            {/* Items Grid by Urgency */}
            {criticalItems.length > 0 && (
              <ItemSection
                title="🚨 Critical - Use Today!"
                items={criticalItems}
                bgColor="bg-red-50"
                borderColor="border-red-200"
                textColor="text-red-900"
                selectedItems={selectedItems}
                onToggle={toggleItemSelection}
                onGetAdvice={getAdvice}
                adviceLoading={adviceLoading}
                formatDate={formatDate}
              />
            )}

            {urgentItems.length > 0 && (
              <ItemSection
                title="⚠️ Urgent - Use in 2-3 Days"
                items={urgentItems}
                bgColor="bg-orange-50"
                borderColor="border-orange-200"
                textColor="text-orange-900"
                selectedItems={selectedItems}
                onToggle={toggleItemSelection}
                onGetAdvice={getAdvice}
                adviceLoading={adviceLoading}
                formatDate={formatDate}
              />
            )}

            {warningItems.length > 0 && (
              <ItemSection
                title="📅 This Week"
                items={warningItems}
                bgColor="bg-yellow-50"
                borderColor="border-yellow-200"
                textColor="text-yellow-900"
                selectedItems={selectedItems}
                onToggle={toggleItemSelection}
                onGetAdvice={getAdvice}
                adviceLoading={adviceLoading}
                formatDate={formatDate}
              />
            )}

            {goodItems.length > 0 && (
              <ItemSection
                title="✅ Fresh Items"
                items={goodItems}
                bgColor="bg-green-50"
                borderColor="border-green-200"
                textColor="text-green-900"
                selectedItems={selectedItems}
                onToggle={toggleItemSelection}
                onGetAdvice={getAdvice}
                adviceLoading={adviceLoading}
                formatDate={formatDate}
              />
            )}
          </>
        )}
      </div>

      {/* Advice Modal */}
      {selectedAdvice && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAdvice(null)}
        >
          <div
            className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto border-2 border-amber-200"
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
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            {/* Days Left Alert */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-500 p-4 mb-6 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <p className="font-bold text-amber-900">
                  ⏰ {selectedAdvice.daysLeft} day{selectedAdvice.daysLeft !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>

            {/* AI Response */}
            <div className="bg-white rounded-xl p-6 shadow-inner border border-amber-100 mb-6 prose prose-amber max-w-none">
              <div className="whitespace-pre-wrap text-gray-800">
                {selectedAdvice.advice}
              </div>
            </div>

            <button
              onClick={() => setSelectedAdvice(null)}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold py-3 px-6 rounded-xl"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Item Section Component
const ItemSection = ({ 
  title, 
  items, 
  bgColor, 
  borderColor, 
  textColor,
  selectedItems,
  onToggle,
  onGetAdvice,
  adviceLoading,
  formatDate
}) => {
  return (
    <div className={`${bgColor} rounded-2xl p-6 mb-6 border-2 ${borderColor}`}>
      <h3 className={`text-xl font-bold ${textColor} mb-4`}>{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div
            key={item._id}
            className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
              selectedItems.includes(item._id)
                ? 'border-amber-500 ring-2 ring-amber-200 shadow-lg'
                : 'border-gray-200 hover:border-amber-300'
            }`}
            onClick={() => onToggle(item._id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                </div>
                <span className="text-xs text-gray-500 ml-7">{item.category}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                item.daysLeft <= 1 ? 'bg-red-100 text-red-800' :
                item.daysLeft <= 3 ? 'bg-orange-100 text-orange-800' :
                item.daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {item.daysLeft}d left
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3 ml-7">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Expires: {formatDate(item.prediction?.safeExpiry || item.expiryDate)}</span>
              </div>
              <div>Qty: {item.quantity}</div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onGetAdvice(item._id, item.name);
              }}
              disabled={adviceLoading === item._id}
              className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {adviceLoading === item._id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4" />
                  Get Tips
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpiryRecommendations;
