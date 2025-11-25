import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './chefBuddyTheme.css';

const dietaryPreferenceOptions = ['Vegetarian','Vegan','Pescatarian','Keto','Paleo','Mediterranean','Balanced'];
const dietaryRestrictionOptions = ['Nuts','Dairy','Gluten','Shellfish','Eggs','Soy','Halal','Kosher'];
const healthGoalOptions = ['Weight loss','Muscle gain','Maintenance','Heart health','Better energy'];
const cuisineOptions = ['Italian','Mexican','Asian','Indian','Mediterranean','American','Middle Eastern'];

export default function Preferences() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const initialProfile = (state && state.profile) || {};

  const [dietaryPreferences, setDietaryPreferences] = useState(initialProfile.dietaryPreferences || []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(initialProfile.dietaryRestrictions || []);
  const [healthGoals, setHealthGoals] = useState(initialProfile.healthGoals || []);
  const [cuisines, setCuisines] = useState(initialProfile.cuisines || []);

  const toggleChip = (value, list, setter) => {
    if (list.includes(value)) setter(list.filter(x => x !== value));
    else setter([...list, value]);
  };

  const handleSave = () => {
    const profile = { ...initialProfile, dietaryPreferences, dietaryRestrictions, healthGoals, cuisines };
    localStorage.setItem('cb_profile', JSON.stringify(profile));
    navigate('/', { state: { registeredEmail: state?.registerEmail || initialProfile.registerEmail } });
  };

  return (
    <div style={{ padding: 24, maxWidth: 920, margin: '32px auto' }}>
      <h2 style={{ marginBottom: 6 }}>Choose your preferences</h2>
      <p style={{ marginTop: 0, color: 'var(--color-muted)' }}>Select the diet, restrictions and cuisines you prefer. You can change these later.</p>

      <section style={{ marginTop: 18 }}>
        <h3>Dietary preferences</h3>
        <div className="chip-group" style={{ marginTop: 8 }}>
          {dietaryPreferenceOptions.map(opt => (
            <button key={opt} className={`chip ${dietaryPreferences.includes(opt) ? 'active' : ''}`} type="button" onClick={() => toggleChip(opt, dietaryPreferences, setDietaryPreferences)} aria-pressed={dietaryPreferences.includes(opt)}>
              <span className="chip-dot" />{opt}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Dietary restrictions</h3>
        <div className="chip-group" style={{ marginTop: 8 }}>
          {dietaryRestrictionOptions.map(opt => (
            <button key={opt} className={`chip ${dietaryRestrictions.includes(opt) ? 'active' : ''}`} type="button" onClick={() => toggleChip(opt, dietaryRestrictions, setDietaryRestrictions)} aria-pressed={dietaryRestrictions.includes(opt)}>
              {['Halal','Kosher'].includes(opt) ? <span className="chip-badge">Religious</span> : <span className="chip-dot" />}{opt}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Health goals</h3>
        <div className="chip-group" style={{ marginTop: 8 }}>
          {healthGoalOptions.map(opt => (
            <button key={opt} className={`chip ${healthGoals.includes(opt) ? 'active' : ''}`} type="button" onClick={() => toggleChip(opt, healthGoals, setHealthGoals)}>
              <span className="chip-dot" />{opt}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3>Favorite cuisines</h3>
        <div className="chip-group" style={{ marginTop: 8 }}>
          {cuisineOptions.map(opt => (
            <button key={opt} className={`chip ${cuisines.includes(opt) ? 'active' : ''}`} type="button" onClick={() => toggleChip(opt, cuisines, setCuisines)}>
              <span className="chip-dot" />{opt}
            </button>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        <button className="btn btn-gradient" onClick={handleSave}>Save preferences</button>
        <button className="link-button" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
}
