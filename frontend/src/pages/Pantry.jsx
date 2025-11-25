import React, { useState, useEffect } from 'react'
import styles from '../styles/App.module.css'
import api from '../config/api'

export default function Pantry() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('produce')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch(api.expiryItems)
      const data = await res.json()
      setItems(data)
    } catch (e) { console.error(e) }
  }

  const add = async () => {
    if (!name) return
    try {
      await fetch(api.expiryItems, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          purchaseDate,
          quantity: 1,
          unit: 'unit'
        })
      })
      fetchItems()
      setName('')
    } catch (e) { console.error(e) }
  }

  const remove = async (id) => {
    try {
      await fetch(api.expiryItemById(id), { method: 'DELETE' })
      fetchItems()
    } catch (e) { console.error(e) }
  }

  const getAdvice = async (id) => {
    try {
      const res = await fetch(api.expiryItemAdvice(id), { method: 'POST' })
      const data = await res.json()
      alert(data.advice)
    } catch (e) { console.error(e) }
  }

  return (
    <div className='mt-20' style={{ maxWidth: 800 }}>
      <h2>Smart Pantry</h2>
      <div className={styles.card} style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12 }}>Item Name</label>
            <input style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12 }}>Category</label>
            <select style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="produce">Produce</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="pantry">Pantry</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12 }}>Purchase Date</label>
            <input type="date" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }} value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
          </div>
          <button className={styles.btnPrimary} onClick={add}>Add Item</button>
        </div>
      </div>

      <div className={styles.grid}>
        {items.map(it => (
          <div key={it._id} className={styles.card} style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{it.name}</h3>
                <div className="muted" style={{ fontSize: 13 }}>{it.category}</div>
              </div>
              <div className={styles.badge} style={{
                background: it.daysLeft <= 3 ? '#fee2e2' : '#dcfce7',
                color: it.daysLeft <= 3 ? '#991b1b' : '#166534'
              }}>
                {it.daysLeft} days left
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13 }}>
              Expires: {new Date(it.prediction.safeExpiry).toLocaleDateString()}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className={styles.btnGhost} onClick={() => getAdvice(it._id)} style={{ fontSize: 12 }}>Get Advice</button>
              <button className={styles.btnGhost} onClick={() => remove(it._id)} style={{ color: 'red', fontSize: 12 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
