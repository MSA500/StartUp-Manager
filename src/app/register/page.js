'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { UserPlus, ChevronRight, ChevronLeft, Zap, User, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [cnic, setCnic] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipcode, setZipcode] = useState('')

  async function handleRegister(e) {
    e.preventDefault(); setLoading(true); setError('')
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    const userId = authData.user.id
    const { error: ownerError } = await supabase.from('owner').insert({ ownerid: userId, cnic, email, fullname_firstname: firstName, fullname_lastname: lastName, password_hash: 'managed_by_supabase_auth' })
    if (ownerError) { setError(ownerError.message); setLoading(false); return }
    const { error: companyError } = await supabase.from('company').insert({ ownerid: userId, name: companyName, type: companyType, description, startdate: startDate || null, location_city: city, location_state: state, location_zipcode: zipcode })
    if (companyError) { setError(companyError.message); setLoading(false); return }
    router.push('/dashboard'); setLoading(false)
  }

  const stepVariants = {
    hidden: (dir) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -30 : 30, transition: { duration: 0.2 } }),
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '30rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={22} style={{ color: 'var(--accent)' }} />
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em', margin: 0 }}>StartupManager</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create your account &amp; company</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {[{ num: 1, label: 'Owner Info', Icon: User }, { num: 2, label: 'Company Info', Icon: Building2 }].map(({ num, label, Icon }, idx) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {idx > 0 && <div style={{ width: '2.5rem', height: '1px', backgroundColor: step >= num ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: step === num ? 600 : 400, color: step >= num ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.3s' }}>
                <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, backgroundColor: step >= num ? 'var(--accent)' : 'var(--bg-subtle)', color: step >= num ? 'white' : 'var(--text-muted)', border: `1px solid ${step >= num ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                  {num}
                </div>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.form key="step1" custom={1} variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                onSubmit={e => { e.preventDefault(); setStep(2) }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
              >
                <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>Owner Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">First Name</label><input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
                  <div><label className="label">Last Name</label><input className="input" value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
                </div>
                <div><label className="label">CNIC</label><input className="input" value={cnic} onChange={e => setCnic(e.target.value)} placeholder="12345-1234567-1" required /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
                <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '0.625rem' }}>
                  Next <ChevronRight size={15} />
                </button>
              </motion.form>
            )}
            {step === 2 && (
              <motion.form key="step2" custom={2} variants={stepVariants} initial="hidden" animate="visible" exit="exit"
                onSubmit={handleRegister}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
              >
                <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>Company Information</h3>
                <div><label className="label">Company Name</label><input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">Type</label>
                    <select className="input" value={companyType} onChange={e => setCompanyType(e.target.value)}>
                      <option value="">Select type</option>
                      <option>Retail</option><option>Technology</option><option>Service</option><option>Manufacturing</option><option>Other</option>
                    </select>
                  </div>
                  <div><label className="label">Start Date</label><input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                </div>
                <div><label className="label">Description</label><textarea className="input" rows={2} value={description} onChange={e => setDescription(e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div><label className="label">City</label><input className="input" value={city} onChange={e => setCity(e.target.value)} /></div>
                  <div><label className="label">State</label><input className="input" value={state} onChange={e => setState(e.target.value)} /></div>
                  <div><label className="label">Zip</label><input className="input" value={zipcode} onChange={e => setZipcode(e.target.value)} /></div>
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{error}</motion.p>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                    <UserPlus size={15} /> {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
