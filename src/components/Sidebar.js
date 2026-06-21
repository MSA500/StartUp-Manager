'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { LayoutDashboard, Users, Building2, UserCheck, Package, ShoppingCart, LogOut, Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '/dashboard',   label: 'Dashboard',   Icon: LayoutDashboard },
  { href: '/employees',   label: 'Employees',   Icon: Users },
  { href: '/departments', label: 'Departments', Icon: Building2 },
  { href: '/customers',   label: 'Customers',   Icon: UserCheck },
  { href: '/products',    label: 'Products',    Icon: Package },
  { href: '/sales',       label: 'Sales',       Icon: ShoppingCart },
]

const sidebarVariants = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
}

const itemVariants = {
  hidden: { x: -12, opacity: 0 },
  visible: (i) => ({ x: 0, opacity: 1, transition: { delay: i * 0.05 + 0.15, duration: 0.25 } }),
}

export default function Sidebar() {
  const pathname = usePathname()
  const { company, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Zap size={16} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--accent)',
              letterSpacing: '-0.02em',
            }}>
              StartupManager
            </span>
          </div>
          {company && (
            <p style={{
              fontSize: '0.72rem',
              color: 'var(--sidebar-text)',
              marginTop: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {company.name}
            </p>
          )}
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--sidebar-text)',
            padding: '0.25rem',
          }}
          className="sidebar-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {navLinks.map(({ href, label, Icon }, i) => {
          const active = pathname === href
          return (
            <motion.div key={href} custom={i} variants={itemVariants} initial="hidden" animate="visible">
              <Link
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-active-bg)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--sidebar-text)'
                  }
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--sidebar-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
            fontSize: '0.8125rem', color: 'var(--sidebar-text)',
            background: 'none', border: 'none', cursor: 'pointer',
            width: '100%', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--sidebar-text)'; e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile Topbar ── */}
      <div
        className="mobile-topbar"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '4rem',
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          zIndex: 1000,
          display: 'none',
          alignItems: 'center',
          padding: '0 1rem',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--sidebar-border)',
            backgroundColor: 'var(--sidebar-bg)',
            color: 'var(--sidebar-text)',
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
            StartupManager
          </span>
        </div>
        <div style={{ width: '2.25rem' }} /> {/* Spacer to balance flex layout */}
      </div>

      {/* ── Desktop sidebar ── */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="desktop-sidebar"
        style={{
          width: '14rem',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          flexShrink: 0,
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* ── Mobile overlay + drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1001,
              }}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '14rem',
                zIndex: 1002,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
              }}
            >
              {/* Close button inside drawer header */}
              <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                    StartupManager
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {company && (
                <p style={{ fontSize: '0.72rem', color: 'var(--sidebar-text)', padding: '0.4rem 1.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company.name}
                </p>
              )}

              {/* Nav */}
              <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {navLinks.map(({ href, label, Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.8125rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                        backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                      {label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div style={{ padding: '0.75rem', borderTop: '1px solid var(--sidebar-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={signOut}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    fontSize: '0.8125rem', color: 'var(--sidebar-text)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    width: '100%', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--sidebar-text)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: flex !important; }
        }
      `}</style>
    </>
  )
}
