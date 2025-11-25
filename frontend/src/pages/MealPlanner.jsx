import React, { useEffect, useState } from 'react'
import recipesData from '../../data/recipes.json'
import styles from '../styles/App.module.css'
import { useAuth } from '../context/AuthContext'

function startOfMonth(y,m){ return new Date(y,m,1) }
function daysInMonth(y,m){ return new Date(y,m+1,0).getDate() }
function pad(n){ return n<10? '0'+n: ''+n }
function iso(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}` }

function loadPlans(){ try { return JSON.parse(localStorage.getItem('mealPlans')||'{}') } catch(e){ return {} } }
function savePlans(p){ localStorage.setItem('mealPlans', JSON.stringify(p)) }
function loadShopping(){ try { return JSON.parse(localStorage.getItem('shoppingList')||'[]') } catch(e){ return [] } }
function saveShopping(s){ localStorage.setItem('shoppingList', JSON.stringify(s)) }

export default function MealPlanner(){
  const now = new Date()
  const { user } = useAuth()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [plans, setPlans] = useState(loadPlans())
  const [selected, setSelected] = useState(iso(now.getFullYear(), now.getMonth(), now.getDate()))
  const [toast, setToast] = useState(null)

  useEffect(()=> savePlans(plans), [plans])

  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const totalDays = daysInMonth(year, month)

  function addRecipeToDay(dateStr, recipe){
    const list = plans[dateStr] || []
    setPlans({...plans, [dateStr]: [...list, { id: recipe.id }]})
    setToast(`${recipe.name} added to ${dateStr}`)
    setTimeout(()=>setToast(null), 2500)
  }

  function removeRecipeFromDay(dateStr, idx){
    const list = (plans[dateStr]||[]).slice(); list.splice(idx,1)
    setPlans({...plans, [dateStr]: list})
  }

  function getRecipesForDay(dateStr){
    const list = plans[dateStr] || []
    return list.map(item => recipesData.find(r => r.id === item.id)).filter(Boolean)
  }

  function addIngredientsToShopping(recipe){
    const shop = loadShopping()
    // merge by ingredient name
    for(const ing of recipe.ingredients || []){
      const existing = shop.find(s => s.name.toLowerCase() === (ing.name||'').toLowerCase())
      const qty = Number(ing.qty) || 0
      if(existing){
        existing.quantity = (Number(existing.quantity)||0) + qty
      } else {
        shop.push({ id: Date.now()+Math.random()*1000, name: ing.name, quantity: qty || ing.qty || 1, unit: ing.unit||'' , checked:false })
      }
    }
    saveShopping(shop)
    setToast('Ingredients added to grocery bag')
    setTimeout(()=>setToast(null), 2000)
  }

  function totalCaloriesForDay(dateStr){
    return getRecipesForDay(dateStr).reduce((s,r)=> s + (Number(r.calories)||0), 0)
  }

  // month navigation
  const prevMonth = ()=>{ const d = new Date(year, month-1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()) }
  const nextMonth = ()=>{ const d = new Date(year, month+1, 1); setYear(d.getFullYear()); setMonth(d.getMonth()) }

  // build cells (Sun-Sat rows)
  const cells = []
  // pad starting empties (firstDay: 0=Sun -> number of empties = firstDay)
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1; d<=totalDays; d++) cells.push(new Date(year, month, d))
  while(cells.length % 7 !== 0) cells.push(null)

  return (
    <div className={styles.app}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
        <div>
          <h2 style={{ margin:0 }}>Monthly Food Planner</h2>
          <div className="muted">Plan meals for the month, add ingredients directly to your grocery bag.</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={prevMonth}>Prev</button>
          <div style={{ padding:'8px 12px', borderRadius:10, background:'transparent', border:'1px solid rgba(255,255,255,0.04)' }}>{new Date(year,month,1).toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
          <button className="btn btn-ghost" onClick={nextMonth}>Next</button>
        </div>
      </div>

  <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:18, maxWidth:1000, marginLeft:'auto', marginRight:'auto', background:'rgba(255,255,255,0.7)', borderRadius:18, boxShadow:'0 2px 16px rgba(0,0,0,0.06)', padding:'24px' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h=> <div key={h} className="muted" style={{ textAlign:'center' }}>{h}</div> )}
        {cells.map((c, idx) => {
          if(!c) return <div key={idx} />
          const d = c.getDate()
          const dateStr = iso(c.getFullYear(), c.getMonth(), d)
          const dayRecipes = getRecipesForDay(dateStr)
          // Color logic
          const today = new Date()
          const isToday = c.getFullYear() === today.getFullYear() && c.getMonth() === today.getMonth() && c.getDate() === today.getDate()
          const isPast = c < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          let bg = 'rgba(255,255,255,0.85)'
          let border = '1px solid rgba(0,0,0,0.06)'
          let extraBox = '0 2px 8px rgba(0,0,0,0.04)'
          if(isPast) bg = 'rgba(255,80,80,0.13)'
          if(isToday) bg = 'rgba(80,220,120,0.18)'
            // Calorie alert (per-user)
            const HIGH_CAL_THRESHOLD = (user && Number(user.daily_calorie_goal)) ? Number(user.daily_calorie_goal) : 2000
          const totalCal = totalCaloriesForDay(dateStr)
          const isHigh = totalCal > HIGH_CAL_THRESHOLD
          if(isHigh){
            border = '2px solid rgba(220,60,60,0.9)'
            extraBox = '0 8px 28px rgba(220,60,60,0.14)'
          }
          return (
            <div key={idx} className={styles.card + ' fadeIn'} style={{ minHeight:110, position:'relative', padding:10, background:bg, border:border, borderRadius:14, boxShadow: extraBox }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:700 }}>{d}</div>
                <div style={{ fontSize:12 }} className="muted">{dayRecipes.length} meals</div>
              </div>
              <div style={{ marginTop:8 }}>
                {/* {dayRecipes.slice(0,3).map((r,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ fontSize:12 }} className="muted">{r.calories} kcal</div>
                  </div>
                ))} */}
              </div>
              {isHigh && (
                <div style={{ position:'absolute', right:8, top:8, background:'rgba(220,60,60,0.95)', color:'#fff', padding:'4px 8px', borderRadius:8, fontSize:12, fontWeight:700, boxShadow:'0 4px 10px rgba(220,60,60,0.12)' }}>High</div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" onClick={()=>setSelected(dateStr)}>Open</button>
              </div>
              <div style={{ position:'absolute', left:8, bottom:8, fontSize:12, color: isHigh ? 'rgba(220,60,60,0.95)' : 'inherit' }} className="muted">Total: {totalCal} kcal</div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop:18, display:'grid', gridTemplateColumns:'1fr 360px', gap:16 }}>
        <div>
          <h3>All Recipes</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:12 }}>
            {recipesData.filter(r => r.image_url && r.image_url.startsWith('http')).map(r => (
              <div key={r.id} className={styles.card}>
                <img src={r.image_url} alt="" style={{ width:'100%', height:120, objectFit:'cover', borderRadius:8 }} />
                <h4 style={{ marginTop:8 }}>{r.name}</h4>
                <div className="muted">{r.description}</div>
                <div style={{ marginTop:8 }}>
                  <strong>{r.calories} kcal</strong>
                </div>
                <details style={{ marginTop:8 }}>
                  <summary style={{ cursor:'pointer' }} className="muted">Ingredients</summary>
                  <ul>
                    {r.ingredients.map((ing,i) => <li key={i}>{ing.name} — {ing.qty} {ing.unit}</li>)}
                  </ul>
                </details>
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button className="btn btn-primary" onClick={() => addRecipeToDay(selected, r)}>Add to {selected}</button>
                  <button className="btn btn-ghost" onClick={() => addIngredientsToShopping(r)}>Add ingredients</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.card}>
          <h3>Plan for {selected}</h3>
          <div>
            {getRecipesForDay(selected).length === 0 && <div className="muted">No recipes planned for this day</div>}
            <ul>
              {getRecipesForDay(selected).map((r,i) => (
                <li key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0' }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{r.name}</div>
                    <div className="muted">{r.calories} kcal</div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-ghost" onClick={() => addIngredientsToShopping(r)}>Add items</button>
                    <button className="btn btn-ghost" onClick={() => removeRecipeFromDay(selected, i)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
