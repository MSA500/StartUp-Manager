'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const emptyForm = { name: '', dob: '', age: '', location_city: '', location_country: '', customer_type: 'individual', companyname: '', contactperson: '' }
const pageVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const rowVariants = { hidden: { opacity: 0, x: -10 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04 } }) }

export default function CustomersPage() {
  const { company } = useAuth()
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    const { data } = await supabase.from('customer').select('*, individual(*), business_customer(*)').eq('companyid', company.companyid).order('name')
    setCustomers(data || [])
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    const payload = { companyid: company.companyid, name: form.name, dob: form.dob || null, age: form.age ? +form.age : null, location_city: form.location_city, location_country: form.location_country, customer_type: form.customer_type }
    if (editId) {
      await supabase.from('customer').update(payload).eq('customerid', editId)
      if (form.customer_type === 'individual') await supabase.from('individual').upsert({ customerid: editId, dob: form.dob || null, age: +form.age || null })
      else await supabase.from('business_customer').upsert({ customerid: editId, companyname: form.companyname, contactperson: form.contactperson })
    } else {
      const { data: newCust } = await supabase.from('customer').insert(payload).select().single()
      if (newCust) {
        if (form.customer_type === 'individual') await supabase.from('individual').insert({ customerid: newCust.customerid, dob: form.dob || null, age: +form.age || null })
        else await supabase.from('business_customer').insert({ customerid: newCust.customerid, companyname: form.companyname, contactperson: form.contactperson })
      }
    }
    setForm(emptyForm); setShowForm(false); setEditId(null); load(); setLoading(false)
  }

  function startEdit(c) {
    setForm({ name: c.name, dob: c.dob || '', age: c.age || '', location_city: c.location_city || '', location_country: c.location_country || '', customer_type: c.customer_type, companyname: c.business_customer?.companyname || '', contactperson: c.business_customer?.contactperson || '' })
    setEditId(c.customerid); setShowForm(true)
  }

  async function del(id) {
    if (!confirm('Delete this customer?')) return
    await supabase.from('customer').delete().eq('customerid', id); load()
  }

  const filtered = filter === 'all' ? customers : customers.filter(c => c.customer_type === filter)

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Customers</h2>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="section-title">{editId ? 'Edit' : 'New'} Customer</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                  <div><label className="label">Customer Type *</label>
                    <select className="input" value={form.customer_type} onChange={e => set('customer_type', e.target.value)}>
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div><label className="label">City</label><input className="input" value={form.location_city} onChange={e => set('location_city', e.target.value)} /></div>
                  <div><label className="label">Country</label><input className="input" value={form.location_country} onChange={e => set('location_country', e.target.value)} /></div>
                </div>
                {form.customer_type === 'individual' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <div><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
                    <div><label className="label">Age</label><input className="input" type="number" value={form.age} onChange={e => set('age', e.target.value)} /></div>
                  </div>
                )}
                {form.customer_type === 'business' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <div><label className="label">Company Name</label><input className="input" value={form.companyname} onChange={e => set('companyname', e.target.value)} /></div>
                    <div><label className="label">Contact Person</label><input className="input" value={form.contactperson} onChange={e => set('contactperson', e.target.value)} /></div>
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
        {['all', 'individual', 'business'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.25rem 0.875rem', borderRadius: '100px', fontSize: '0.8rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s', backgroundColor: filter === f ? 'var(--accent)' : 'var(--bg-subtle)', color: filter === f ? 'white' : 'var(--text-secondary)', border: filter === f ? 'none' : '1px solid var(--border)' }}>
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-head">Name</th>
              <th className="table-head">Type</th>
              <th className="table-head">City</th>
              <th className="table-head">Details</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <motion.tr key={c.customerid} custom={i} variants={rowVariants} initial="hidden" animate="visible" className="table-row">
                <td className="table-cell" style={{ fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                <td className="table-cell">
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: c.customer_type === 'individual' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: c.customer_type === 'individual' ? '#10b981' : '#f59e0b' }}>
                    {c.customer_type}
                  </span>
                </td>
                <td className="table-cell">{c.location_city || '—'}</td>
                <td className="table-cell" style={{ fontSize: '0.78rem' }}>{c.customer_type === 'business' ? c.business_customer?.companyname : `Age: ${c.age || '?'}`}</td>
                <td className="table-cell">
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => startEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={13} /> Edit</button>
                    <button onClick={() => del(c.customerid)} className="btn-danger"><Trash2 size={13} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
