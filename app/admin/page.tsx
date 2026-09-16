'use client'

import { useState } from 'react'
import { Users, ShoppingBag, Package, TrendingUp, ArrowRight, Clock } from 'lucide-react'

const stats = [
  { label: 'Total Users', value: '1,284', change: '+12%', icon: Users },
  { label: 'Total Orders', value: '3,920', change: '+8%', icon: ShoppingBag },
  { label: 'Products', value: '148', change: '+3', icon: Package },
  { label: 'Revenue', value: '$48,320', change: '+18%', icon: TrendingUp },
]

const recentOrders = [
  { id: 'ATL-001', customer: 'Emma Wilson', amount: '$248', status: 'delivered', date: 'Jun 12' },
  { id: 'ATL-002', customer: 'James Carter', amount: '$96', status: 'shipped', date: 'Jun 13' },
  { id: 'ATL-003', customer: 'Sofia Reyes', amount: '$310', status: 'processing', date: 'Jun 14' },
  { id: 'ATL-004', customer: 'Liam Park', amount: '$128', status: 'pending', date: 'Jun 14' },
  { id: 'ATL-005', customer: 'Nora Blanc', amount: '$88', status: 'cancelled', date: 'Jun 15' },
]

const statusColor: Record<string, string> = {
  delivered: 'status--delivered',
  shipped: 'status--shipped',
  processing: 'status--processing',
  pending: 'status--pending',
  cancelled: 'status--cancelled',
}

export default function AdminDashboard() {
  return (
    <div>
      <div className="admin-page-head">
        <p className="eyebrow">Overview</p>
        <h2>Dashboard</h2>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="admin-stat-card">
            <div className="admin-stat-card__icon"><Icon size={18} /></div>
            <div>
              <p className="admin-stat-card__label">{label}</p>
              <p className="admin-stat-card__value">{value}</p>
            </div>
            <span className="admin-stat-card__change">{change}</span>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="admin-section__head">
          <h3 className="admin-section__title"><Clock size={15} /> Recent Orders</h3>
          <a href="/admin/orders" className="text-link">View all <ArrowRight size={13} /></a>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="admin-table__mono">{o.id}</td>
                  <td>{o.customer}</td>
                  <td><strong>{o.amount}</strong></td>
                  <td><span className={`status-pill ${statusColor[o.status]}`}>{o.status}</span></td>
                  <td className="admin-table__muted">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
