import React, { useEffect, useState } from 'react'
import recipesData from '../../data/recipes.json'
import styles from '../styles/App.module.css'
import { Heart } from '../components/Icon'
import { Link } from 'react-router-dom'
import RecipeModal from '../components/RecipeModal'
import { addIngredients } from '../utils/shopping'
import { useAuth } from '../context/AuthContext'
import api from '../config/api'

function RecipeCard({ r }) {
  const img = r.image_url || 'https://source.unsplash.com/800x600/?food'
  return (
    <div className={styles.card} style={{ width: 320 }}>
      <div className={styles.cardImageWrap}>
        <img src={img} alt={r.name} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23222222"/><text x="50%" y="50%" fill="%23ffffff" font-size="24" font-family="Arial" text-anchor="middle">Image unavailable</text></svg>' }} />
        <div className={styles.titleOverlay}>
          <div>
            <h3 style={{ margin: 0 }}>{r.name}</h3>
            <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>{r.description}</p>
          </div>
          <div className={styles.badge}>{r.calories ?? '-'} kcal</div>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '0 12px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <small className="muted">Prep: {r.prep_time ?? '-'}m</small>
          <small className="muted">{r.difficulty}</small>
          <small className="muted">Serves: {r.servings ?? '-'}</small>
        </div>

        <div style={{ marginTop: 10 }}>
          <strong style={{ fontSize: 14 }}>Ingredients</strong>
          <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {r.ingredients.slice(0, 3).map(it => `${it.qty || it.amount || ''} ${it.unit || ''} ${it.name}`).join(' · ')}{r.ingredients.length > 3 ? ' · …' : ''}
          </p>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button onClick={() => window.dispatchEvent(new CustomEvent('openRecipe', { detail: { id: r.id } }))} className={styles.btn + ' ' + styles.btnGhost}>View</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className={styles.btn + ' ' + styles.btnPrimary} title="Add ingredients" onClick={() => {
            const added = addIngredients(r.ingredients || [])
            try { window.dispatchEvent(new CustomEvent('toast', { detail: { message: `Ingredients added to shopping list` } })) } catch (e) { }
          }}>Add</button>
          <button aria-label="save" title="Save" className={styles.iconBtn}><Heart /></button>
        </div>
      </div>
    </div>
  )
}

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([])
  const [open, setOpen] = useState(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Only show recipes with valid images
    setRecipes((recipesData || []).filter(r => r.image_url && r.image_url.startsWith('http')))
  }, [])

  useEffect(() => {
    const h = (e) => {
      const id = e?.detail?.id
      if (!id) return
      // Check if it's an AI recipe in current state
      const r = recipes.find(x => String(x.id) === String(id)) || recipesData.find(x => String(x.id) === String(id))
      if (r) setOpen(r)
    }
    window.addEventListener('openRecipe', h)
    return () => window.removeEventListener('openRecipe', h)
  }, [recipes])

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const response = await fetch(api.generateRecipe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dietary_type: user?.preferences?.dietary_preferences?.[0] || "Balanced",
          cuisine_type: user?.preferences?.cuisines?.[0] || "Any",
          food_category: "Main Course",
          food_available: "Any",
          like_eating: "Healthy",
          difficulty: user?.preferences?.skill_level || "Intermediate"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Generation failed');
      }

      const data = await response.json();
      const aiRecipe = {
        id: 'ai-' + Date.now(),
        name: data.recipe.title,
        description: data.recipe.description,
        image_url: 'https://source.unsplash.com/800x600/?' + encodeURIComponent(data.recipe.title),
        ingredients: data.recipe.ingredients.map(i => ({ name: i.name, qty: i.amount, unit: '' })),
        instructions: data.recipe.steps,
        prep_time: data.recipe.time,
        servings: data.recipe.servings,
        difficulty: 'Medium',
        calories: 'Unknown',
        cuisine_type: 'AI Generated'
      };

      setRecipes(prev => [aiRecipe, ...prev]);
      setOpen(aiRecipe);
    } catch (e) {
      alert("Failed to generate recipe: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className={styles.hero} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Recipes</h2>
          <p className="muted">Quick ideas and tasty meals tailored for you.</p>
        </div>
        <button className={styles.btn + ' ' + styles.btnPrimary} onClick={handleGenerateAI} disabled={generating}>
          {generating ? 'Dreaming up recipe...' : '✨ Generate with AI'}
        </button>
      </div>

      <div style={{ marginTop: 18 }} className={styles.grid}>
        {recipes.map(r => (
          <RecipeCard key={r.id} r={r} />
        ))}
      </div>
      {open && <RecipeModal recipe={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
