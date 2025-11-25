import React, { useState, useEffect } from 'react'

function load(){ try { return JSON.parse(localStorage.getItem('shoppingList')||'[]') } catch(e){ return [] } }
function save(p){ localStorage.setItem('shoppingList', JSON.stringify(p)) }

export default function ShoppingList(){
  const [items, setItems] = useState(load())
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')

  useEffect(()=>save(items), [items])

  const add = ()=>{ if(!name) return; setItems([...items, { id: Date.now(), name, qty, checked:false }]); setName(''); setQty('') }
  const toggle = id => setItems(items.map(i=>i.id===id? {...i, checked:!i.checked} : i))
  const remove = id => setItems(items.filter(i=>i.id!==id))

  const exportText = () => items.map(i=>`- ${i.name} ${i.qty||''}`).join('\n')

  return (
    <div className='mt-20' style={{ maxWidth:720 }}>
      <h2>Shopping List</h2>
      <div style={{ display:'flex', gap:8 }}>
        <input placeholder="Item" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Qty" value={qty} onChange={e=>setQty(e.target.value)} style={{ width:120 }} />
        <button onClick={add}>Add</button>
        <button onClick={()=>navigator.clipboard?.writeText(exportText())}>Copy</button>
      </div>

      <ul style={{ marginTop:12 }}>
        {items.map(it => (
          <li key={it.id} style={{ display:'flex', justifyContent:'space-between', padding:8, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <input type="checkbox" checked={!!it.checked} onChange={()=>toggle(it.id)} /> {' '}
              <span style={{ textDecoration: it.checked ? 'line-through' : 'none' }}>{it.name} <small style={{ color:'var(--muted)' }}>{it.quantity || it.qty}</small></span>
            </div>
            <div><button onClick={()=>remove(it.id)} style={{ background:'transparent', color:'var(--accent)', border:'none' }}>Remove</button></div>
          </li>
        ))}
      </ul>
    </div>
  )
}
