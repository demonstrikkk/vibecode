import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/App.module.css'

const PREF_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Low-carb', 'Halal', 'Kosher']

export default function Profile() {
  const { user, updatePreferences } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    household_size: 1,
    dietary_preferences: []
  })
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        household_size: user.preferences?.household_size || 1,
        dietary_preferences: user.preferences?.dietary_preferences || []
      })
    }
  }, [user])

  const togglePref = (opt) => {
    const p = form.dietary_preferences || []
    if (p.includes(opt)) setForm({ ...form, dietary_preferences: p.filter(x => x !== opt) })
    else setForm({ ...form, dietary_preferences: [...p, opt] })
  }

  const save = async () => {
    try {
      await updatePreferences({
        dietary_preferences: form.dietary_preferences,
        household_size: form.household_size,
        // preserve other preferences
        dietary_restrictions: user.preferences?.dietary_restrictions || [],
        health_goals: user.preferences?.health_goals || [],
        skill_level: user.preferences?.skill_level,
        budget: user.preferences?.budget,
        cuisines: user.preferences?.cuisines || []
      })
      setMsg('Saved')
      setTimeout(() => setMsg(null), 2000)
    } catch (err) {
      setMsg('Save failed: ' + err.message)
    }
  }

  if (!user) return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h2>Profile</h2>
      <p>Please log in to edit your profile.</p>
    </div>
  )

  return (
    <div className="container mt-10" style={{ maxWidth: 980 }}>
      <h1 style={{ marginBottom: 12 }}><b>Profile</b></h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        <div className={styles.card} style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>
              {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text)' }}>{user.full_name || user.email}</div>
              <div className="muted" style={{ fontSize: 13 }}>{user.email}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              disabled // Name update not supported in backend yet easily
            />
            <small className="muted">Name cannot be changed currently.</small>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Household size</label>
            <input
              type="number"
              min={1}
              value={form.household_size}
              onChange={(e) => setForm({ ...form, household_size: Number(e.target.value) })}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Dietary preferences</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PREF_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => togglePref(opt)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: '1px solid var(--primary)',
                    background: form.dietary_preferences.includes(opt) ? 'var(--primary)' : 'transparent',
                    color: form.dietary_preferences.includes(opt) ? 'white' : 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button onClick={save} className={styles.btnPrimary} style={{ padding: '12px 24px' }}>Save profile</button>
            {msg && <span style={{ marginLeft: 12, color: 'green' }}>{msg}</span>}
          </div>
        </div>

        <div>
          <div className={styles.card} style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Preview</h3>
            <p className="muted">How others will see your profile and what we use to personalize recommendations.</p>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>{form.full_name || user.email}</div>
              <div className="muted" style={{ marginBottom: 8 }}>{user.email}</div>
              <div><strong>Household:</strong> {form.household_size}</div>
              <div style={{ marginTop: 8 }}><strong>Preferences:</strong></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {(form.dietary_preferences.length ? form.dietary_preferences : ['No preferences set']).map(p => (
                  <div key={p} style={{ padding: '4px 10px', borderRadius: 999, background: '#eee', fontSize: 12 }}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
