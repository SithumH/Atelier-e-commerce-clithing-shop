'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

type User = {
  id: number
  name: string
  email: string
  phone: string
  role: 'customer' | 'admin'
  status: 'active' | 'banned'
  joined: string
  orders: number
}

const initialUsers: User[] = [
  { id: 1, name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 555 0101', role: 'customer', status: 'active', joined: 'Jan 2025', orders: 12 },
  { id: 2, name: 'James Carter', email: 'james@example.com', phone: '+1 555 0102', role: 'customer', status: 'active', joined: 'Feb 2025', orders: 5 },
  { id: 3, name: 'Sofia Reyes', email: 'sofia@example.com', phone: '+1 555 0103', role: 'admin', status: 'active', joined: 'Mar 2024', orders: 0 },
  { id: 4, name: 'Liam Park', email: 'liam@example.com', phone: '+1 555 0104', role: 'customer', status: 'banned', joined: 'Apr 2025', orders: 2 },
  { id: 5, name: 'Nora Blanc', email: 'nora@example.com', phone: '+1 555 0105', role: 'customer', status: 'active', joined: 'May 2025', orders: 8 },
  { id: 6, name: 'Kai Tanaka', email: 'kai@example.com', phone: '+1 555 0106', role: 'customer', status: 'active', joined: 'Jun 2025', orders: 3 },
]

const empty: Omit<User, 'id'> = { name: '', email: '', phone: '', role: 'customer', status: 'active', joined: '', orders: 0 }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')
  const [modal, setModal] = useState<{ open: boolean; user: Omit<User, 'id'> & { id?: number } }>({ open: false, user: empty })
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2400) }

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
  )

  const openAdd = () => setModal({ open: true, user: { ...empty } })
  const openEdit = (u: User) => setModal({ open: true, user: { ...u } })
  const closeModal = () => setModal({ open: false, user: empty })

  const saveUser = () => {
    if (!modal.user.name || !modal.user.email) return
    if (modal.user.id) {
      setUsers(prev => prev.map(u => u.id === modal.user.id ? { ...modal.user as User } : u))
      showToast('User updated')
    } else {
      setUsers(prev => [...prev, { ...modal.user, id: Date.now(), joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) } as User])
      showToast('User added')
    }
    closeModal()
  }

  const confirmDelete = () => {
    setUsers(prev => prev.filter(u => u.id !== deleteId))
    setDeleteId(null)
    showToast('User deleted')
  }

  const toggleStatus = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u))
  }

  return (
    <div>
      <div className="admin-page-head">
        <p className="eyebrow">Management</p>
        <h2>Users</h2>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <label className="search-box">
          <Search size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users…" />
        </label>
        <div className="filter-pills">
          {(['all', 'customer', 'admin'] as const).map(r => (
            <button key={r} className={roleFilter === r ? 'active' : ''} onClick={() => setRoleFilter(r)}>
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <button className="button dark-button admin-add-btn" onClick={openAdd}>
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Orders</th><th>Joined</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="admin-table__empty">No users found</td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td className="admin-table__muted">{u.email}</td>
                  <td className="admin-table__muted">{u.phone}</td>
                  <td>
                    <span className={`role-pill ${u.role === 'admin' ? 'role-pill--admin' : 'role-pill--customer'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="admin-table__center">{u.orders}</td>
                  <td className="admin-table__muted">{u.joined}</td>
                  <td>
                    <button
                      className={`status-pill ${u.status === 'active' ? 'status--delivered' : 'status--cancelled'}`}
                      onClick={() => toggleStatus(u.id)}
                      title="Click to toggle"
                    >
                      {u.status}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => openEdit(u)} title="Edit"><Pencil size={14} /></button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => setDeleteId(u.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-table__count">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{modal.user.id ? 'Edit User' : 'Add User'}</h3>
              <button className="icon-button" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-row">
                <label className="admin-label">Full Name</label>
                <input className="admin-input" value={modal.user.name} onChange={e => setModal(m => ({ ...m, user: { ...m.user, name: e.target.value } }))} placeholder="Emma Wilson" />
              </div>
              <div className="admin-form-row">
                <label className="admin-label">Email</label>
                <input className="admin-input" type="email" value={modal.user.email} onChange={e => setModal(m => ({ ...m, user: { ...m.user, email: e.target.value } }))} placeholder="emma@example.com" />
              </div>
              <div className="admin-form-row">
                <label className="admin-label">Phone</label>
                <input className="admin-input" value={modal.user.phone} onChange={e => setModal(m => ({ ...m, user: { ...m.user, phone: e.target.value } }))} placeholder="+1 555 0100" />
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label">Role</label>
                  <select className="admin-input" value={modal.user.role} onChange={e => setModal(m => ({ ...m, user: { ...m.user, role: e.target.value as User['role'] } }))}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">Status</label>
                  <select className="admin-input" value={modal.user.status} onChange={e => setModal(m => ({ ...m, user: { ...m.user, status: e.target.value as User['status'] } }))}>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-modal__foot">
              <button className="button outline-button" onClick={closeModal}>Cancel</button>
              <button className="button dark-button" onClick={saveUser}><Check size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal admin-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>Delete User</h3>
              <button className="icon-button" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>This action cannot be undone. The user and all their data will be permanently removed.</p>
            </div>
            <div className="admin-modal__foot">
              <button className="button outline-button" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="button" style={{ background: '#c0392b', color: 'white', borderColor: '#c0392b' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  )
}
