import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import recipesData from '../../data/recipes.json'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Clock, Sun, Sunset, Moon, ChefHat, Sparkles, Filter, X, AlertTriangle } from 'lucide-react'
import RecipeModal from '../components/RecipeModal'

// Time-based meal detection
function getMealTime() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 10) return { meal: 'breakfast', icon: Sun, label: 'Good Morning!', greeting: "Time for a healthy breakfast" }
  if (hour >= 10 && hour < 14) return { meal: 'lunch', icon: Clock, label: 'Lunch Time!', greeting: "Let's find something tasty for lunch" }
  if (hour >= 14 && hour < 17) return { meal: 'snack', icon: Sun, label: 'Afternoon Snack?', greeting: "Need a quick energy boost?" }
  if (hour >= 17 && hour < 21) return { meal: 'dinner', icon: Sunset, label: 'Dinner Time!', greeting: "What's cooking for dinner?" }
  return { meal: 'late-night', icon: Moon, label: 'Late Night Bite', greeting: "Looking for a light snack?" }
}

// Meal type keywords for filtering
const MEAL_KEYWORDS = {
  breakfast: ['pancake', 'waffle', 'egg', 'omelette', 'toast', 'smoothie', 'cereal', 'oatmeal', 'muffin', 'breakfast', 'brunch', 'scramble', 'bacon'],
  lunch: ['salad', 'sandwich', 'wrap', 'soup', 'lunch', 'bowl', 'light', 'quick', 'burger'],
  snack: ['snack', 'bite', 'small', 'appetizer', 'dip', 'chips', 'fruit', 'nuts', 'energy'],
  dinner: ['steak', 'pasta', 'chicken', 'fish', 'roast', 'dinner', 'casserole', 'curry', 'stir-fry', 'grilled', 'baked'],
  'late-night': ['light', 'simple', 'quick', 'easy', 'snack', 'small']
}

export default function Dashboard() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [mealTime, setMealTime] = useState(getMealTime())

  // Update meal time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMealTime(getMealTime())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const preferences = user?.preferences?.dietary_preferences || []
  const restrictions = user?.preferences?.dietary_restrictions || []
  const household = user?.preferences?.household_size || 1

  // Dietary filter keywords
  const KW = {
    meat: ['chicken', 'beef', 'pork', 'lamb', 'steak', 'bacon', 'ham', 'turkey', 'sausage', 'ribeye', 'ground beef', 'meat'],
    fish: ['salmon', 'tuna', 'trout', 'tilapia', 'cod', 'shrimp', 'prawn', 'prawns', 'crab', 'lobster', 'anchovy', 'sardine'],
    dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'feta', 'parmesan', 'mozzarella', 'egg', 'eggs', 'honey'],
    gluten: ['wheat', 'flour', 'pasta', 'bread', 'breadcrumbs', 'semolina', 'spaghetti', 'noodle'],
    nuts: ['peanut', 'peanuts', 'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'pistachio', 'hazelnut', 'nut', 'pecan'],
    shellfish: ['shrimp', 'prawn', 'prawns', 'crab', 'lobster', 'mussel', 'oyster']
  }

  const recipeText = (r) => {
    const name = String(r.name || '').toLowerCase()
    const cuisine = String(r.cuisine_type || '').toLowerCase()
    const desc = String(r.description || '').toLowerCase()
    const ings = (r.ingredients || []).map(i => String(i.name || '').toLowerCase()).join(' ')
    return `${name} ${cuisine} ${desc} ${ings}`
  }

  const violates = (r, pref) => {
    const text = recipeText(r)
    switch (pref.toLowerCase()) {
      case 'vegan':
        return KW.meat.concat(KW.fish, KW.dairy).some(k => text.includes(k))
      case 'vegetarian':
        return KW.meat.concat(KW.fish).some(k => text.includes(k))
      case 'pescatarian':
        return KW.meat.some(k => text.includes(k))
      case 'gluten-free':
      case 'gluten free':
      case 'gluten':
        return KW.gluten.some(k => text.includes(k))
      case 'dairy-free':
      case 'dairy free':
      case 'dairy':
        return KW.dairy.some(k => text.includes(k))
      case 'nut-free':
      case 'nut free':
      case 'nuts':
        return KW.nuts.some(k => text.includes(k))
      case 'halal':
        return ['pork', 'ham', 'bacon'].some(k => text.includes(k))
      case 'kosher':
        return ['pork', 'ham', 'bacon'].some(k => text.includes(k)) || KW.shellfish.some(k => text.includes(k))
      default:
        return false
    }
  }

  // Time-based recommendations
  const timeBasedRecipes = useMemo(() => {
    const mealKeywords = MEAL_KEYWORDS[mealTime.meal] || []
    return recipesData.filter(r => {
      const text = recipeText(r)
      // Check if recipe matches meal time
      const matchesMeal = mealKeywords.some(k => text.includes(k))
      // Check dietary restrictions
      const passesRestrictions = !restrictions.some(pref => violates(r, pref))
      const passesPreferences = preferences.length === 0 || !preferences.some(pref => violates(r, pref))
      return matchesMeal && passesRestrictions && passesPreferences
    }).slice(0, 4)
  }, [mealTime.meal, preferences, restrictions])

  // Search and filter results
  const filteredRecipes = useMemo(() => {
    let results = recipesData

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(r => {
        const text = recipeText(r)
        return text.includes(query)
      })
    }

    // Apply active filters
    if (activeFilters.length > 0) {
      results = results.filter(r => {
        return !activeFilters.some(filter => violates(r, filter))
      })
    }

    // Apply dietary preferences and restrictions
    results = results.filter(r => {
      const passesRestrictions = !restrictions.some(pref => violates(r, pref))
      const passesPreferences = preferences.length === 0 || !preferences.some(pref => violates(r, pref))
      return passesRestrictions && passesPreferences
    })

    return results.slice(0, 12)
  }, [searchQuery, activeFilters, preferences, restrictions])

  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const allFilters = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Quick', 'Easy']

  const MealIcon = mealTime.icon

  if (!user) return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="welcome-card">
          <ChefHat size={48} className="welcome-icon" />
          <h2>Welcome to ChefBuddy</h2>
          <p>Please <Link to="/login" className="text-link">log in</Link> to see your personalized dashboard and recommendations.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header with greeting and search */}
        <header className="dashboard-header">
          <div className="greeting-section">
            <div className="meal-badge">
              <MealIcon size={18} />
              <span>{mealTime.label}</span>
            </div>
            <h1>Welcome back, {user.full_name || user.email?.split('@')[0]}</h1>
            <p>{mealTime.greeting}</p>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search recipes, ingredients, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={20} />
              {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
            </button>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-chips">
                {allFilters.map(filter => (
                  <button
                    key={filter}
                    className={`filter-chip ${activeFilters.includes(filter) ? 'active' : ''}`}
                    onClick={() => toggleFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              {activeFilters.length > 0 && (
                <button className="clear-filters" onClick={() => setActiveFilters([])}>
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </header>

        <div className="dashboard-content">
          {/* Sidebar with preferences */}
          <aside className="dashboard-sidebar">
            <div className="prefs-card">
              <h3>Your Profile</h3>
              <div className="pref-item">
                <span className="pref-label">Household</span>
                <span className="pref-value">{household} {household === 1 ? 'person' : 'people'}</span>
              </div>
              <div className="pref-item">
                <span className="pref-label">Dietary</span>
                <span className="pref-value">{preferences.length ? preferences.join(', ') : 'None set'}</span>
              </div>
              {restrictions.length > 0 && (
                <div className="pref-item">
                  <span className="pref-label">Restrictions</span>
                  <span className="pref-value">{restrictions.join(', ')}</span>
                </div>
              )}
              <Link to="/preferences" className="edit-prefs-btn">
                Edit Preferences
              </Link>
            </div>

            <div className="quick-links">
              <h3>Quick Actions</h3>
              <Link to="/food-recommendations" className="quick-link">✨ AI Recipes</Link>
              <Link to="/expiry-recommendations" className="quick-link">⏰ Expiring Soon</Link>
              <Link to="/planner" className="quick-link">📅 Meal Planner</Link>
              <Link to="/pantry" className="quick-link">🥫 Track Pantry</Link>
              <Link to="/shopping" className="quick-link">🛒 Shopping List</Link>
              <Link to="/recipes" className="quick-link">📖 All Recipes</Link>
            </div>
          </aside>

          {/* Main content area */}
          <main className="dashboard-main">
            {/* Time-based suggestions */}
            {!searchQuery && timeBasedRecipes.length > 0 && (
              <section className="recipe-section time-based">
                <div className="section-header">
                  <div className="section-title">
                    <Sparkles size={22} className="sparkle-icon" />
                    <h2>Perfect for {mealTime.meal}</h2>
                  </div>
                  <Link to="/recipes" className="view-all">View all recipes →</Link>
                </div>
                <div className="recipe-grid time-grid">
                  {timeBasedRecipes.map(r => (
                    <div key={r.id} className="recipe-card" onClick={() => setSelectedRecipe(r)}>
                      <div className="recipe-image">
                        <img src={r.image_url} alt={r.name} />
                        <div className="recipe-badge">{r.prep_time} min</div>
                      </div>
                      <div className="recipe-info">
                        <h4>{r.name}</h4>
                        <p className="recipe-meta">{r.cuisine_type} • {r.calories} kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Search/filter results or recommended recipes */}
            <section className="recipe-section">
              <div className="section-header">
                <h2>{searchQuery ? `Results for "${searchQuery}"` : 'Recommended for You'}</h2>
                {!searchQuery && <span className="result-count">{filteredRecipes.length} recipes</span>}
              </div>
              
              {filteredRecipes.length === 0 ? (
                <div className="no-results">
                  <ChefHat size={48} />
                  <h3>No recipes found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button onClick={() => { setSearchQuery(''); setActiveFilters([]); }}>
                    Clear all
                  </button>
                </div>
              ) : (
                <div className="recipe-grid">
                  {filteredRecipes.map(r => (
                    <div key={r.id} className="recipe-card" onClick={() => setSelectedRecipe(r)}>
                      <div className="recipe-image">
                        <img src={r.image_url} alt={r.name} />
                        <div className="recipe-badge">{r.prep_time} min</div>
                      </div>
                      <div className="recipe-info">
                        <h4>{r.name}</h4>
                        <p className="recipe-meta">{r.cuisine_type} • {r.calories} kcal</p>
                        <p className="recipe-desc">{r.description?.slice(0, 80)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  )
}
