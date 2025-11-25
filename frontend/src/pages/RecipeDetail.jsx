import React from 'react'
import { useParams } from 'react-router-dom'
import recipesData from '../../data/recipes.json'

export default function RecipeDetail() {
  const { id } = useParams()
  const recipe = recipesData.find(r => String(r.id) === String(id))

  if (!recipe) return <div style={{ color: 'var(--muted)' }}>Recipe not found</div>

  const ingredients = recipe.ingredients || []
  const instructions = recipe.instructions || []

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>{recipe.name}</h2>
      <img src={recipe.image_url || 'https://source.unsplash.com/800x400/?food'} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'cover' }} />
      <p className="muted">{recipe.description}</p>
      <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <h3>Ingredients</h3>
          <ul>
            {ingredients.map((ing, i) => <li key={i}>{ing.name || ing}</li>)}
          </ul>
        </div>
        <div style={{ flex: 2 }}>
          <h3>Instructions</h3>
          <ol>
            {instructions.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      </div>
    </div>
  )
}
