'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Users, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const emptyForm = { deptname: '', numofemployees: '', description: '' }
const pageVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const cardVariants = { hidden: { opacity: 0, scale: 0.97 }, visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.07, duration: 0.3 } }) }

export default function DepartmentsPage() {
  const { company } = useAuth()
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (company) load() }, [company])

  async function load() {
    const { data } = await supabase.from('department').select('*').eq('companyid', company.companyid).order('deptname')
    setDepartments(data || [])
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    const payload = { companyid: company.companyid, deptname: form.deptname, numofemployees: form.numofemployees ? +form.numofemployees : 0, description: form.description }
    if (editId) await supabase.from('department').update(payload).eq('deptid', editId)
    else await supabase.from('department').insert(payload)
    setForm(emptyForm); setShowForm(false); setEditId(null); load(); setLoading(false)
  }

  function startEdit(dept) {
    setForm({ deptname: dept.deptname, numofemployees: dept.numofemployees || '', description: dept.description || '' })
    setEditId(dept.deptid); setShowForm(true)
  }

  async function del(id) {
    if (!confirm('Delete this department?')) return
    await supabase.from('department').delete().eq('deptid', id); load()
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Departments</h2>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Department
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="section-title">{editId ? 'Edit' : 'New'} Department</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><label className="label">Department Name *</label><input className="input" value={form.deptname} onChange={e => set('deptname', e.target.value)} required /></div>
                <div><label className="label">Number of Employees</label><input className="input" type="number" value={form.numofemployees} onChange={e => set('numofemployees', e.target.value)} /></div>
                <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))', gap: '1rem' }}>
        {departments.map((dept, i) => (
          <motion.div key={dept.deptid} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className="card" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="section-title">{dept.deptname}</h3>
                  <p className="meta-text" style={{ marginTop: '0.375rem' }}>{dept.description || 'No description'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.625rem', color: 'var(--accent)', fontSize: '0.8rem' }}>
                    <Users size={13} />
                    <span>{dept.numofemployees} employees</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
                  <button onClick={() => startEdit(dept)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={12} /></button>
                  <button onClick={() => del(dept.deptid)} className="btn-danger"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {departments.length === 0 && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2.5rem' }}>No departments yet</div>
        )}
      </div>
    </motion.div>
  )
}
