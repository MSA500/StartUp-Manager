'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { LayoutDashboard, Users, Building2, UserCheck, Package, ShoppingCart, LogOut, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
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

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
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
      {/* Brand */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--sidebar-border)' }}>
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
    </motion.aside>
  )
}
