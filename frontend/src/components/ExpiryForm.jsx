import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';

const ExpiryForm = ({ onAdded }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('dairy');
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'meat', label: 'Meat & Poultry' },
    { value: 'packaged', label: 'Packaged Foods' },
    { value: 'spices', label: 'Spices & Condiments' },
    { value: 'bakery', label: 'Bakery Items' },
    { value: 'frozen', label: 'Frozen Foods' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/expiry/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          purchaseDate,
          quantity,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      // Reset form
      setName('');
      setQuantity(1);
      setNotes('');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setCategory('dairy');

      if (onAdded) onAdded();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-lg p-6 border-2 border-amber-200">
      <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        Add Grocery Item
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Milk, Tomatoes, Chicken Breast"
            className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
          />
        </div>

        {/* Category & Purchase Date Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-800 mb-1">
              Purchase Date *
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
            />
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
          />
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-semibold text-amber-800 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
            className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-600 bg-white resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Pantry
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpiryForm;
