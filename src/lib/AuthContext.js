'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchCompany(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchCompany(session.user.id)
      else { setCompany(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchCompany(userId) {
  const { data, error } = await supabase
    .from('company')
    .select('*')
    .eq('ownerid', userId)
    .single()
  
  console.log('fetchCompany result:', data, error) // temp debug
  setCompany(data)
  setLoading(false)
}

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, company, loading, signOut, fetchCompany }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
