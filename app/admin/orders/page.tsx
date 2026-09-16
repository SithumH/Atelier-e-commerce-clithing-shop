'use client'

import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'

type Order = {
  id: string
  customer: string
  email: string
  items: number
  amount: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

const initialOrders: Order[] = [
  { id: 'ATL-001', customer: 'Emma Wilson', email: 'emma@example.com', items: 3, amount: '$248', status: 'delivered', date: 'Jun 12, 2025' },
  { id: 'ATL-002', customer: 'James Carter', email: 'james@example.com', items: 1, amount: '$96', status: 'shipped', date: 'Jun 13, 2025' },
  { id: 'ATL-003', customer: 'Sofia Reyes', email: 'sofia@example.com', items: 4, amount: '$310', status: 'processing', date: 'Jun 14, 2025' },
  { id: 'ATL-004', customer: 'Liam Park', email: 'liam@example.com', items: 2, amount: '$128', status: 'pending', date: 'Jun 14, 2025' },
  { id: 'ATL-005', customer: 'Nora Blanc', email: 'nora@example.com', items: 1, amount: '$88', status: 'cancelled', date: 'Jun 15, 2025' },
  { id: 'ATL-006', customer: 'Kai Tanaka', email: 'kai@example.com', items: 2, amount: '$176', status: 'delivered', date: 'Jun 15, 2025' },
]

const statusColor: Record<string, string> = {
  delivered: 'status--delivered', shipped: 'status--shipped',
  processing: 'status--processing', pending: 'status--pending', cancelled: 'status--cancelled',
}

const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof statuses[number]>('all')

  const filtered = orders.filter(o =>
    (statusFilter === 'all' || o.status === statusFilter) &&
    (o.customer.toLowerCase().includes(query.toLowerCase()) || o.id.toLowerCase().includes(query.toLowerCase()))
  )

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  return (
    <div>
      <div className="admin-page-head">
        <p className="eyebrow">Management</p>
        <h2>Orders</h2>
      </div>

      <div className="admin-toolbar">
        <label className="search-box">
          <Search size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders…" />
        </label>
        <div className="filter-pills" style={{ flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th>Update</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="admin-table__empty">No orders found</td></tr>}
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className="admin-table__mono">{o.id}</td>
                  <td>
                    <strong>{o.customer}</strong>
                    <br /><span className="admin-table__muted" style={{ fontSize: 11 }}>{o.email}</span>
                  </td>
                  <td className="admin-table__center">{o.items}</td>
                  <td><strong>{o.amount}</strong></td>
                  <td><span className={`status-pill ${statusColor[o.status]}`}>{o.status}</span></td>
                  <td className="admin-table__muted">{o.date}</td>
                  <td>
                    <select
                      className="admin-input admin-input--sm"
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value as Order['status'])}
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-table__count">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}
