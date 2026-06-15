'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) router.push('/dashboard')
      else router.push('/login')
    }
  }, [user, loading])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}
      >
        <Zap size={18} />
        <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading...</span>
      </motion.div>
    </div>
  )
}
