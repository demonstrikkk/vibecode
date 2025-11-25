import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Leaf, AlertCircle, Target, ChefHat, Globe } from 'lucide-react';

const dietaryPreferenceOptions = ['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'Balanced'];
const dietaryRestrictionOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Halal', 'Kosher'];
const healthGoalOptions = ['Weight loss', 'Muscle gain', 'Maintenance', 'Heart health', 'Better energy'];
const skillLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
const cuisineOptions = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'Middle Eastern', 'French', 'Japanese', 'Thai'];
const budgetOptions = ['Low', 'Medium', 'High'];

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { user, updatePreferences } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Preferences state
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [householdSize, setHouseholdSize] = useState(1);
  const [budget, setBudget] = useState('');

  // Load existing preferences
  useEffect(() => {
    if (user?.preferences) {
      const prefs = user.preferences;
      setDietaryPreferences(prefs.dietary_preferences || []);
      setDietaryRestrictions(prefs.dietary_restrictions || []);
      setHealthGoals(prefs.health_goals || []);
      setSkillLevel(prefs.skill_level || '');
      setCuisines(prefs.cuisines || []);
      setHouseholdSize(prefs.household_size || 1);
      setBudget(prefs.budget || '');
    }
  }, [user]);

  const toggleChip = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter(x => x !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await updatePreferences({
        dietary_preferences: dietaryPreferences,
        dietary_restrictions: dietaryRestrictions,
        health_goals: healthGoals,
        skill_level: skillLevel,
        cuisines: cuisines,
        household_size: householdSize,
        budget: budget
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="preferences-page">
      <div className="preferences-container">
        <div className="preferences-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <h1>Your Preferences</h1>
            <p>Personalize your cooking experience. These settings help us recommend the perfect recipes for you.</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="success-banner">
            <Save size={18} />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <div className="preferences-grid">
          {/* Dietary Preferences */}
          <section className="preference-section">
            <div className="section-header">
              <Leaf size={22} className="section-icon" />
              <h2>Dietary Preferences</h2>
            </div>
            <p className="section-desc">What type of diet do you follow?</p>
            <div className="chip-group">
              {dietaryPreferenceOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${dietaryPreferences.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleChip(opt, dietaryPreferences, setDietaryPreferences)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Dietary Restrictions */}
          <section className="preference-section">
            <div className="section-header">
              <AlertCircle size={22} className="section-icon" />
              <h2>Allergies & Restrictions</h2>
            </div>
            <p className="section-desc">What foods should we avoid in recipes?</p>
            <div className="chip-group">
              {dietaryRestrictionOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${dietaryRestrictions.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleChip(opt, dietaryRestrictions, setDietaryRestrictions)}
                >
                  {['Halal', 'Kosher'].includes(opt) && <span className="religious-badge">Religious</span>}
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Health Goals */}
          <section className="preference-section">
            <div className="section-header">
              <Target size={22} className="section-icon" />
              <h2>Health Goals</h2>
            </div>
            <p className="section-desc">What are you trying to achieve?</p>
            <div className="chip-group">
              {healthGoalOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${healthGoals.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleChip(opt, healthGoals, setHealthGoals)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Skill Level */}
          <section className="preference-section">
            <div className="section-header">
              <ChefHat size={22} className="section-icon" />
              <h2>Cooking Skill Level</h2>
            </div>
            <p className="section-desc">How experienced are you in the kitchen?</p>
            <div className="chip-group">
              {skillLevelOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${skillLevel === opt ? 'active' : ''}`}
                  onClick={() => setSkillLevel(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Favorite Cuisines */}
          <section className="preference-section full-width">
            <div className="section-header">
              <Globe size={22} className="section-icon" />
              <h2>Favorite Cuisines</h2>
            </div>
            <p className="section-desc">What types of food do you enjoy most?</p>
            <div className="chip-group">
              {cuisineOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${cuisines.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleChip(opt, cuisines, setCuisines)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          {/* Household & Budget */}
          <section className="preference-section">
            <div className="section-header">
              <h2>Household Size</h2>
            </div>
            <p className="section-desc">How many people do you typically cook for?</p>
            <div className="number-input-group">
              <button
                className="number-btn"
                onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))}
              >
                −
              </button>
              <span className="number-value">{householdSize}</span>
              <button
                className="number-btn"
                onClick={() => setHouseholdSize(householdSize + 1)}
              >
                +
              </button>
            </div>
          </section>

          <section className="preference-section">
            <div className="section-header">
              <h2>Budget</h2>
            </div>
            <p className="section-desc">What's your typical grocery budget?</p>
            <div className="chip-group">
              {budgetOptions.map(opt => (
                <button
                  key={opt}
                  className={`pref-chip ${budget === opt ? 'active' : ''}`}
                  onClick={() => setBudget(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="preferences-actions">
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
