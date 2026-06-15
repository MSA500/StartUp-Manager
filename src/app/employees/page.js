'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const emptyForm = {
  name: '', dob: '', age: '', joindate: '', salary: '',
  rank: '', state: '', emp_type: 'worker', deptid: '',
  bonus: '', decisionpower: '', hourlyrate: '', shift: ''
}

const pageVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const rowVariants = { hidden: { opacity: 0, x: -10 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04 } }) }

export default function EmployeesPage() {
  const { company } = useAuth()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (company) { load(); loadDepts() } }, [company])

  async function load() {
    const { data } = await supabase
      .from('employees')
      .select('*, department(deptname), manager(bonus, decisionpower), worker(hourlyrate, shift)')
      .eq('companyid', company.companyid).order('name')
    setEmployees(data || [])
  }

  async function loadDepts() {
    const { data } = await supabase.from('department').select('deptid, deptname').eq('companyid', company.companyid)
    setDepartments(data || [])
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true)
    const empPayload = {
      companyid: company.companyid, deptid: form.deptid || null,
      name: form.name, dob: form.dob || null, age: form.age ? +form.age : null,
      joindate: form.joindate || null, salary: form.salary ? +form.salary : null,
      rank: form.rank, state: form.state, emp_type: form.emp_type,
    }
    if (editId) {
      await supabase.from('employees').update(empPayload).eq('empid', editId)
      if (form.emp_type === 'manager') await supabase.from('manager').upsert({ empid: editId, bonus: +form.bonus || null, decisionpower: form.decisionpower })
      else await supabase.from('worker').upsert({ empid: editId, hourlyrate: +form.hourlyrate || null, shift: form.shift })
    } else {
      const { data: newEmp } = await supabase.from('employees').insert(empPayload).select().single()
      if (newEmp) {
        if (form.emp_type === 'manager') await supabase.from('manager').insert({ empid: newEmp.empid, bonus: +form.bonus || null, decisionpower: form.decisionpower })
        else await supabase.from('worker').insert({ empid: newEmp.empid, hourlyrate: +form.hourlyrate || null, shift: form.shift })
      }
    }
    setForm(emptyForm); setShowForm(false); setEditId(null); load(); setLoading(false)
  }

  function startEdit(emp) {
    setForm({ name: emp.name, dob: emp.dob || '', age: emp.age || '', joindate: emp.joindate || '', salary: emp.salary || '', rank: emp.rank || '', state: emp.state || '', emp_type: emp.emp_type, deptid: emp.deptid || '', bonus: emp.manager?.bonus || '', decisionpower: emp.manager?.decisionpower || '', hourlyrate: emp.worker?.hourlyrate || '', shift: emp.worker?.shift || '' })
    setEditId(emp.empid); setShowForm(true)
  }

  async function del(id) {
    if (!confirm('Delete this employee?')) return
    await supabase.from('employees').delete().eq('empid', id); load()
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 className="page-title">Employees</h2>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="section-title">{editId ? 'Edit' : 'New'} Employee</h3>
                <button onClick={() => setShowForm(false)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
                  <div><label className="label">Department</label>
                    <select className="input" value={form.deptid} onChange={e => set('deptid', e.target.value)}>
                      <option value="">-- None --</option>
                      {departments.map(d => <option key={d.deptid} value={d.deptid}>{d.deptname}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></div>
                  <div><label className="label">Join Date</label><input className="input" type="date" value={form.joindate} onChange={e => set('joindate', e.target.value)} /></div>
                  <div><label className="label">Salary (PKR)</label><input className="input" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} /></div>
                  <div><label className="label">Rank</label><input className="input" value={form.rank} onChange={e => set('rank', e.target.value)} /></div>
                  <div><label className="label">State/Status</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Active / On Leave" /></div>
                  <div><label className="label">Employee Type *</label>
                    <select className="input" value={form.emp_type} onChange={e => set('emp_type', e.target.value)}>
                      <option value="worker">Worker</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
                {form.emp_type === 'manager' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <div><label className="label">Bonus (PKR)</label><input className="input" type="number" value={form.bonus} onChange={e => set('bonus', e.target.value)} /></div>
                    <div><label className="label">Decision Power</label><input className="input" value={form.decisionpower} onChange={e => set('decisionpower', e.target.value)} /></div>
                  </div>
                )}
                {form.emp_type === 'worker' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <div><label className="label">Hourly Rate (PKR)</label><input className="input" type="number" value={form.hourlyrate} onChange={e => set('hourlyrate', e.target.value)} /></div>
                    <div><label className="label">Shift</label><input className="input" value={form.shift} onChange={e => set('shift', e.target.value)} placeholder="Morning / Evening / Night" /></div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-head">Name</th>
              <th className="table-head">Type</th>
              <th className="table-head">Department</th>
              <th className="table-head">Salary</th>
              <th className="table-head">Status</th>
              <th className="table-head">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <motion.tr key={emp.empid} custom={i} variants={rowVariants} initial="hidden" animate="visible" className="table-row">
                <td className="table-cell" style={{ fontWeight: 500, color: 'var(--text)' }}>{emp.name}</td>
                <td className="table-cell">
                  <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.7rem', fontWeight: 600, backgroundColor: emp.emp_type === 'manager' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)', color: emp.emp_type === 'manager' ? '#8b5cf6' : '#3b82f6' }}>
                    {emp.emp_type}
                  </span>
                </td>
                <td className="table-cell">{emp.department?.deptname || '—'}</td>
                <td className="table-cell">PKR {emp.salary?.toLocaleString() || '—'}</td>
                <td className="table-cell">{emp.state || '—'}</td>
                <td className="table-cell">
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => startEdit(emp)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}><Pencil size={13} /> Edit</button>
                    <button onClick={() => del(emp.empid)} className="btn-danger"><Trash2 size={13} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No employees yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
