import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { 
  ChefHat, 
  Sparkles, 
  Loader2, 
  Filter, 
  Clock, 
  Users, 
  Star,
  RefreshCw,
  Heart,
  UtensilsCrossed
} from 'lucide-react';
import VintageRecipeCard from '../components/VintageRecipeCard';

const FoodRecommendations = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [filters, setFilters] = useState({
    mealType: '',
    cuisine: '',
    cookingTime: '',
    difficulty: ''
  });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const cuisines = ['indian', 'italian', 'chinese', 'mexican', 'thai', 'mediterranean', 'american', 'japanese'];
  const cookingTimes = ['quick (under 30 min)', 'medium (30-60 min)', 'long (over 1 hour)'];
  const difficulties = ['easy', 'medium', 'challenging'];

  const generateRecipe = async () => {
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      // Build the prompt based on filters and user preferences
      let prompt = customPrompt || 'Give me a delicious recipe';
      
      if (filters.mealType) {
        prompt += ` for ${filters.mealType}`;
      }
      if (filters.cuisine) {
        prompt += ` with ${filters.cuisine} cuisine style`;
      }
      if (filters.cookingTime) {
        prompt += `, ${filters.cookingTime} cooking time`;
      }
      if (filters.difficulty) {
        prompt += `, ${filters.difficulty} difficulty level`;
      }

      // Include user preferences if available
      if (user?.preferences) {
        const prefs = user.preferences;
        if (prefs.dietaryRestrictions?.length > 0) {
          prompt += `. Dietary restrictions: ${prefs.dietaryRestrictions.join(', ')}`;
        }
        if (prefs.allergies?.length > 0) {
          prompt += `. Avoid allergens: ${prefs.allergies.join(', ')}`;
        }
        if (prefs.cuisinePreferences?.length > 0 && !filters.cuisine) {
          prompt += `. Preferred cuisines: ${prefs.cuisinePreferences.join(', ')}`;
        }
      }

      const response = await fetch(api.generateRecipe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);  // Extract recipe from response
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError(err.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    { label: '🥗 Healthy Salad', prompt: 'Give me a healthy, nutritious salad recipe' },
    { label: '🍝 Quick Pasta', prompt: 'Give me a quick and easy pasta recipe under 30 minutes' },
    { label: '🍛 Comfort Food', prompt: 'Give me a hearty comfort food recipe' },
    { label: '🥘 One-Pot Meal', prompt: 'Give me a one-pot meal that\'s easy to clean up' },
    { label: '🍰 Sweet Treat', prompt: 'Give me a delicious dessert recipe' },
    { label: '🌱 Vegetarian', prompt: 'Give me a tasty vegetarian main course' },
  ];

  const handleQuickSuggestion = (prompt) => {
    setCustomPrompt(prompt);
    setRecipe(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ChefHat className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-serif">Food Recommendations</h1>
              <p className="text-amber-200 mt-1">AI-powered recipe suggestions tailored just for you</p>
            </div>
          </div>
          
          {user?.preferences && (
            <div className="mt-6 flex flex-wrap gap-2">
              {user.preferences.dietaryRestrictions?.map((diet, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                  {diet}
                </span>
              ))}
              {user.preferences.cuisinePreferences?.map((cuisine, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-600/50 rounded-full text-sm backdrop-blur-sm">
                  ❤️ {cuisine}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Suggestions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Quick Suggestions
          </h2>
          <div className="flex flex-wrap gap-3">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickSuggestion(suggestion.prompt)}
                className={`px-4 py-2 rounded-full border-2 transition-all hover:scale-105 ${
                  customPrompt === suggestion.prompt
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500'
                }`}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
          <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-600" />
            Customize Your Recipe
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                <UtensilsCrossed className="w-4 h-4 inline mr-1" />
                Meal Type
              </label>
              <select
                value={filters.mealType}
                onChange={(e) => setFilters({...filters, mealType: e.target.value})}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50"
              >
                <option value="">Any meal</option>
                {mealTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                <Heart className="w-4 h-4 inline mr-1" />
                Cuisine
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50"
              >
                <option value="">Any cuisine</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Cooking Time
              </label>
              <select
                value={filters.cookingTime}
                onChange={(e) => setFilters({...filters, cookingTime: e.target.value})}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50"
              >
                <option value="">Any duration</option>
                {cookingTimes.map(time => (
                  <option key={time} value={time}>{time.charAt(0).toUpperCase() + time.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                <Star className="w-4 h-4 inline mr-1" />
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50"
              >
                <option value="">Any level</option>
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-amber-800 mb-2">
              Or describe what you're craving...
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g., 'I want something spicy with chicken' or 'A healthy meal prep option for the week'"
              rows={3}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-amber-50 resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateRecipe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating your recipe...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Recipe
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-800 font-semibold">{error}</p>
            <button
              onClick={generateRecipe}
              className="mt-4 flex items-center gap-2 text-red-700 hover:text-red-900 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Recipe Display */}
        {recipe && (
          <div className="mt-8">
            <VintageRecipeCard recipe={recipe} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !recipe && !error && (
          <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300">
            <ChefHat className="w-20 h-20 text-amber-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-amber-900 mb-3">Ready to cook something amazing?</h3>
            <p className="text-amber-700 max-w-md mx-auto">
              Select your preferences above or describe what you're in the mood for, 
              and we'll generate a personalized recipe just for you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodRecommendations;
