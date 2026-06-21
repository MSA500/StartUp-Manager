'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, X, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const pageVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const rowVariants = { hidden: { opacity: 0, x: -10 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04 } }) }

export default function SalesPage() {
  const { company } = useAuth()
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ productid: '', quantity: 1, unit_price: 0 }])

  useEffect(() => { if (company) { load(); loadDropdowns() } }, [company])

  async function load() {
    const { data } = await supabase.from('buy').select('*, customer(name), buy_items(*, product(name))').eq('companyid', company.companyid).order('date', { ascending: false })
    setSales(data || [])
  }

  async function loadDropdowns() {
    const [c, p] = await Promise.all([
      supabase.from('customer').select('customerid, name').eq('companyid', company.companyid),
      supabase.from('product').select('productid, name, price').eq('companyid', company.companyid)
    ])
    setCustomers(c.data || []); setProducts(p.data || [])
  }

  function updateItem(i, key, val) {
    setItems(prev => {
      const updated = [...prev]
      updated[i] = { ...updated[i], [key]: val }
      if (key === 'productid') {
        const prod = products.find(p => p.productid === val)
        if (prod) updated[i].unit_price = prod.price
      }
      return updated
    })
  }

  function addItem() { setItems(prev => [...prev, { productid: '', quantity: 1, unit_price: 0 }]) }
  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }

  const total = items.reduce((s, it) => s + (+it.quantity * +it.unit_price), 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!customerId) { alert('Select a customer'); return }
    if (items.some(it => !it.productid)) { alert('Select a product for all items'); return }
    setLoading(true)
    const { data: newBuy } = await supabase.from('buy').insert({ companyid: company.companyid, customerid: customerId, date, totalamount: total }).select().single()
    if (newBuy) await supabase.from('buy_items').insert(items.map(it => ({ buyid: newBuy.buyid, productid: it.productid, quantity: +it.quantity, unit_price: +it.unit_price })))
    setCustomerId(''); setDate(new Date().toISOString().split('T')[0])
    setItems([{ productid: '', quantity: 1, unit_price: 0 }])
    setShowForm(false); load(); setLoading(false)
  }

  async function del(id) {
    if (!confirm('Delete this sale?')) return
    await supabase.from('buy').delete().eq('buyid', id); load()
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Sales</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={15} /> New Sale</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="section-title">New Sale</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">Customer *</label>
                    <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                      <option value="">-- Select Customer --</option>
                      {customers.map(c => <option key={c.customerid} value={c.customerid}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Date</label><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="label" style={{ margin: 0 }}>Products</label>
                    <button type="button" onClick={addItem} style={{ fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Plus size={13} /> Add Item</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 3fr 2fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <select className="input" value={item.productid} onChange={e => updateItem(i, 'productid', e.target.value)}>
                          <option value="">-- Product --</option>
                          {products.map(p => <option key={p.productid} value={p.productid}>{p.name}</option>)}
                        </select>
                        <input className="input" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                        <input className="input" type="number" step="0.01" placeholder="Price" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>PKR {(item.quantity * item.unit_price).toLocaleString()}</span>
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>PKR {total.toLocaleString()}</strong></span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Sale'}</button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-head">Customer</th>
              <th className="table-head">Date</th>
              <th className="table-head">Items</th>
              <th className="table-head">Total</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, i) => (
              <motion.tr key={s.buyid} custom={i} variants={rowVariants} initial="hidden" animate="visible" className="table-row">
                <td className="table-cell" style={{ fontWeight: 500, color: 'var(--text)' }}>{s.customer?.name}</td>
                <td className="table-cell">{s.date}</td>
                <td className="table-cell" style={{ fontSize: '0.78rem' }}>{s.buy_items?.map(it => `${it.product?.name} ×${it.quantity}`).join(', ')}</td>
                <td className="table-cell" style={{ color: '#10b981', fontWeight: 600 }}>PKR {s.totalamount?.toLocaleString()}</td>
                <td className="table-cell">
                  <button onClick={() => del(s.buyid)} className="btn-danger"><Trash2 size={13} /></button>
                </td>
              </motion.tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No sales yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </motion.div>
  )
}
