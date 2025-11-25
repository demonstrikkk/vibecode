import React, { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'

export default function RecipeModal({ recipe, onClose }) {
  const [checked, setChecked] = useState({})

  useEffect(() => {
    // prevent background scroll while modal open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  if (!recipe) return null

  const toggle = (i) => setChecked(s => ({ ...s, [i]: !s[i] }))

  const addToPantry = () => {
    try {
      const raw = localStorage.getItem('pantry')
      const pantry = raw ? JSON.parse(raw) : []
      (recipe.ingredients || []).forEach(ing => {
        const idx = pantry.findIndex(p => p.name === ing.name && p.unit === ing.unit)
        if (idx >= 0) pantry[idx].qty = (Number(pantry[idx].qty) || 0) + (Number(ing.qty) || 0)
        else pantry.push({ name: ing.name, qty: ing.qty || 1, unit: ing.unit || '' })
      })
      localStorage.setItem('pantry', JSON.stringify(pantry))
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Ingredients added to pantry' } }))
      onClose()
    } catch (e) { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Add to pantry failed' } })) }
  }

  const addToMealPlan = () => {
    try {
      const today = new Date().toISOString().slice(0,10)
      const raw = localStorage.getItem('mealPlans')
      const plans = raw ? JSON.parse(raw) : {}
      plans[today] = plans[today] || []
      plans[today].push({ recipeId: recipe.id, addedAt: Date.now() })
      localStorage.setItem('mealPlans', JSON.stringify(plans))
      window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Recipe added to today\'s plan' } }))
      onClose()
    } catch (e) { window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Add to plan failed' } })) }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.recipeModal} onClick={(e)=>e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{recipe.name}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.modalLeft}>
          <div style={{ borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            <img src={recipe.image_url} alt={recipe.name} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} onError={(e)=>{ e.target.onerror=null; e.target.src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f3f3f3"/></svg>' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="muted">{recipe.cuisine_type} · {recipe.difficulty}</div>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <div className={styles.badge}>{recipe.prep_time ?? '-'}m</div>
              <div className={styles.badge}>{recipe.calories ?? '-'} kcal</div>
              <div className={styles.badge}>Serves: {recipe.servings ?? '-'}</div>
            </div>
          </div>
        </div>

        <div className={styles.modalRight}>
          <div className={styles.nutriCards}>
            <div className={styles.nutriCard}><div className="muted">Calories</div><div style={{ fontWeight:800 }}>{recipe.calories ?? '-'}</div></div>
            <div className={styles.nutriCard}><div className="muted">Protein</div><div style={{ fontWeight:800 }}>—</div></div>
            <div className={styles.nutriCard}><div className="muted">Carbs</div><div style={{ fontWeight:800 }}>—</div></div>
            <div className={styles.nutriCard}><div className="muted">Fat</div><div style={{ fontWeight:800 }}>—</div></div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Ingredients</h4>
            <div className="ingredientsList">
              {(recipe.ingredients || []).map((ing, i) => (
                <label key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <input type="checkbox" checked={!!checked[i]} onChange={()=>toggle(i)} />
                  <span>{(ing.qty ? ing.qty + ' ' : '') + (ing.unit ? ing.unit + ' ' : '') + ing.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="instructionsList">
            <h4>Instructions</h4>
            <ol style={{ marginTop: 8 }}>
              {(recipe.instructions || []).map((s, i) => <li key={i} style={{ marginBottom: 8 }}>{s}</li>)}
            </ol>
          </div>

          <div className={styles.modalActions} style={{ marginTop: 16 }}>
            <button className={styles.btnPrimary} onClick={addToMealPlan}>Add to Meal Plan</button>
            <button className={styles.btn} onClick={addToPantry} style={{ background: 'linear-gradient(180deg,#fff,#fff)', color:'var(--primary)', border: '1px solid rgba(59,47,42,0.06)' }}>Add to Pantry</button>
          </div>
        </div>
      </div>
    </div>
  )
}
