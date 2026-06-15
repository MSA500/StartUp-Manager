'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Users, UserCheck, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' } }),
}

export default function DashboardPage() {
  const { company } = useAuth()
  const [stats, setStats] = useState({ employees: 0, customers: 0, products: 0, sales: 0, revenue: 0 })
  const [recentSales, setRecentSales] = useState([])

  useEffect(() => { if (company) loadStats() }, [company])

  async function loadStats() {
    const cid = company.companyid
    const [emp, cust, prod, sales] = await Promise.all([
      supabase.from('employees').select('empid', { count: 'exact', head: true }).eq('companyid', cid),
      supabase.from('customer').select('customerid', { count: 'exact', head: true }).eq('companyid', cid),
      supabase.from('product').select('productid', { count: 'exact', head: true }).eq('companyid', cid),
      supabase.from('buy').select('buyid, totalamount').eq('companyid', cid)
    ])
    const revenue = sales.data?.reduce((s, b) => s + (b.totalamount || 0), 0) || 0
    setStats({ employees: emp.count || 0, customers: cust.count || 0, products: prod.count || 0, sales: sales.data?.length || 0, revenue })
    const { data } = await supabase
      .from('buy').select('buyid, date, totalamount, customer(name)')
      .eq('companyid', cid).order('created_at', { ascending: false }).limit(5)
    setRecentSales(data || [])
  }

  const statCards = [
    { label: 'Employees',  value: stats.employees, Icon: Users,         color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Customers',  value: stats.customers, Icon: UserCheck,     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Products',   value: stats.products,  Icon: Package,       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Sales',      value: stats.sales,     Icon: ShoppingCart,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: '1.75rem' }}>
        <h2 className="page-title">{company?.name || 'Dashboard'}</h2>
        <p className="meta-text" style={{ marginTop: '0.25rem' }}>{company?.type}{company?.location_city ? ` · ${company.location_city}` : ''}</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="meta-text">{s.label}</p>
                <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', backgroundColor: 'rgba(13,148,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="meta-text">Total Revenue</p>
            <p className="stat-value" style={{ color: 'var(--accent)' }}>PKR {stats.revenue.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '1rem' }}>Recent Sales</h3>
          {recentSales.length === 0 ? (
            <p className="meta-text">No sales yet.</p>
          ) : (
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="table-head">Customer</th>
                  <th className="table-head">Date</th>
                  <th className="table-head">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(s => (
                  <tr key={s.buyid} className="table-row">
                    <td className="table-cell" style={{ fontWeight: 500, color: 'var(--text)' }}>{s.customer?.name}</td>
                    <td className="table-cell">{s.date}</td>
                    <td className="table-cell" style={{ color: '#10b981', fontWeight: 600 }}>PKR {s.totalamount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}
