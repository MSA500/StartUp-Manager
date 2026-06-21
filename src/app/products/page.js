'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const emptyForm = { name: '', description: '', price: '', color: '', product_type: 'physical', weight: '', filesize: '', format: '' }
const pageVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const rowVariants = { hidden: { opacity: 0, x: -10 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04 } }) }

export default function ProductsPage() {
  const { company } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    const { data } = await supabase.from('product').select('*, physical_product(*), digital_product(*)').eq('companyid', company.companyid).order('name')
    setProducts(data || [])
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    const payload = { companyid: company.companyid, name: form.name, description: form.description, price: +form.price, color: form.color, product_type: form.product_type }
    if (editId) {
      await supabase.from('product').update(payload).eq('productid', editId)
      if (form.product_type === 'physical') await supabase.from('physical_product').upsert({ productid: editId, color: form.color, weight: +form.weight || null })
      else await supabase.from('digital_product').upsert({ productid: editId, filesize: +form.filesize || null, format: form.format })
    } else {
      const { data: newP } = await supabase.from('product').insert(payload).select().single()
      if (newP) {
        if (form.product_type === 'physical') await supabase.from('physical_product').insert({ productid: newP.productid, color: form.color, weight: +form.weight || null })
        else await supabase.from('digital_product').insert({ productid: newP.productid, filesize: +form.filesize || null, format: form.format })
      }
    }
    setForm(emptyForm); setShowForm(false); setEditId(null); load(); setLoading(false)
  }

  function startEdit(p) {
    setForm({ name: p.name, description: p.description || '', price: p.price || '', color: p.color || '', product_type: p.product_type, weight: p.physical_product?.weight || '', filesize: p.digital_product?.filesize || '', format: p.digital_product?.format || '' })
    setEditId(p.productid); setShowForm(true)
  }

  async function del(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('product').delete().eq('productid', id); load()
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.product_type === filter)

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Products</h2>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="section-title">{editId ? 'Edit' : 'New'} Product</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                  <div><label className="label">Product Type *</label>
                    <select className="input" value={form.product_type} onChange={e => set('product_type', e.target.value)}>
                      <option value="physical">Physical</option>
                      <option value="digital">Digital</option>
                    </select>
                  </div>
                  <div><label className="label">Price (PKR) *</label><input className="input" type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required /></div>
                  <div><label className="label">Color</label><input className="input" value={form.color} onChange={e => set('color', e.target.value)} /></div>
                </div>
                <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
                {form.product_type === 'physical' && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <label className="label">Weight (kg)</label>
                    <input className="input" type="number" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} />
                  </div>
                )}
                {form.product_type === 'digital' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <div><label className="label">File Size (MB)</label><input className="input" type="number" step="0.01" value={form.filesize} onChange={e => set('filesize', e.target.value)} /></div>
                    <div><label className="label">Format</label><input className="input" value={form.format} onChange={e => set('format', e.target.value)} placeholder="PDF, MP4, ZIP..." /></div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'physical', 'digital'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.25rem 0.875rem', borderRadius: '100px', fontSize: '0.8rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s', backgroundColor: filter === f ? 'var(--accent)' : 'var(--bg-subtle)', color: filter === f ? 'white' : 'var(--text-secondary)', border: filter === f ? 'none' : '1px solid var(--border)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-head">Name</th>
              <th className="table-head">Type</th>
              <th className="table-head">Price</th>
              <th className="table-head">Details</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr key={p.productid} custom={i} variants={rowVariants} initial="hidden" animate="visible" className="table-row">
                <td className="table-cell" style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</td>
                <td className="table-cell">
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: p.product_type === 'physical' ? 'rgba(245,158,11,0.12)' : 'rgba(6,182,212,0.12)', color: p.product_type === 'physical' ? '#f59e0b' : '#06b6d4' }}>
                    {p.product_type}
                  </span>
                </td>
                <td className="table-cell" style={{ color: '#10b981', fontWeight: 600 }}>PKR {p.price?.toLocaleString()}</td>
                <td className="table-cell" style={{ fontSize: '0.78rem' }}>
                  {p.product_type === 'physical' ? `${p.physical_product?.weight || '?'} kg` : `${p.digital_product?.format || '?'} · ${p.digital_product?.filesize || '?'} MB`}
                </td>
                <td className="table-cell">
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => startEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={13} /> Edit</button>
                    <button onClick={() => del(p.productid)} className="btn-danger"><Trash2 size={13} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </motion.div>
  )
}
