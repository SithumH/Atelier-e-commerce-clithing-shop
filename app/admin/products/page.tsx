'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  image: string
}

const initialProducts: Product[] = [
  { id: 1, name: 'Cloud Knit Cardigan', category: 'Women', price: 128, stock: 24, status: 'active', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=80&q=80' },
  { id: 2, name: 'Relaxed Oxford Shirt', category: 'Men', price: 96, stock: 18, status: 'active', image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=80&q=80' },
  { id: 3, name: 'Studio Leather Tote', category: 'Accessories', price: 210, stock: 7, status: 'active', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=80&q=80' },
  { id: 4, name: 'Everyday Wide Leg Trouser', category: 'Women', price: 110, stock: 0, status: 'inactive', image: 'https://images.unsplash.com/photo-1506629905607-d9b1e7adf8b6?auto=format&fit=crop&w=80&q=80' },
  { id: 5, name: 'Canvas Weekend Sneaker', category: 'Accessories', price: 88, stock: 31, status: 'active', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=80&q=80' },
]

const emptyProduct = { name: '', category: 'Women', price: 0, stock: 0, status: 'active' as const, image: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal] = useState<{ open: boolean; data: typeof emptyProduct & { id?: number } }>({ open: false, data: emptyProduct })
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2400) }

  const filtered = products.filter(p =>
    (catFilter === 'All' || p.category === catFilter) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const save = () => {
    if (!modal.data.name) return
    if (modal.data.id) {
      setProducts(prev => prev.map(p => p.id === modal.data.id ? { ...modal.data as Product } : p))
      showToast('Product updated')
    } else {
      setProducts(prev => [...prev, { ...modal.data, id: Date.now() } as Product])
      showToast('Product added')
    }
    setModal({ open: false, data: emptyProduct })
  }

  return (
    <div>
      <div className="admin-page-head">
        <p className="eyebrow">Management</p>
        <h2>Products</h2>
      </div>

      <div className="admin-toolbar">
        <label className="search-box">
          <Search size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products…" />
        </label>
        <div className="filter-pills">
          {['All', 'Women', 'Men', 'Accessories'].map(c => (
            <button key={c} className={catFilter === c ? 'active' : ''} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
        <button className="button dark-button admin-add-btn" onClick={() => setModal({ open: true, data: { ...emptyProduct } })}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="admin-section">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="admin-table__empty">No products found</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={p.image} alt={p.name} className="admin-product-thumb" />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td className="admin-table__muted">{p.category}</td>
                  <td><strong>${p.price}</strong></td>
                  <td>
                    <span className={p.stock === 0 ? 'status-pill status--cancelled' : p.stock < 10 ? 'status-pill status--pending' : 'status-pill status--delivered'}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </td>
                  <td><span className={`status-pill ${p.status === 'active' ? 'status--delivered' : 'status--cancelled'}`}>{p.status}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn" onClick={() => setModal({ open: true, data: { ...p } })}><Pencil size={14} /></button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => setDeleteId(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-table__count">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {modal.open && (
        <div className="admin-modal-overlay" onClick={() => setModal({ open: false, data: emptyProduct })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>{modal.data.id ? 'Edit Product' : 'Add Product'}</h3>
              <button className="icon-button" onClick={() => setModal({ open: false, data: emptyProduct })}><X size={18} /></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-row">
                <label className="admin-label">Product Name</label>
                <input className="admin-input" value={modal.data.name} onChange={e => setModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))} placeholder="Cloud Knit Cardigan" />
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label">Category</label>
                  <select className="admin-input" value={modal.data.category} onChange={e => setModal(m => ({ ...m, data: { ...m.data, category: e.target.value } }))}>
                    {['Women', 'Men', 'Accessories'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">Status</label>
                  <select className="admin-input" value={modal.data.status} onChange={e => setModal(m => ({ ...m, data: { ...m.data, status: e.target.value as 'active' | 'inactive' } }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-grid">
                <div className="admin-form-row">
                  <label className="admin-label">Price ($)</label>
                  <input className="admin-input" type="number" value={modal.data.price} onChange={e => setModal(m => ({ ...m, data: { ...m.data, price: +e.target.value } }))} />
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">Stock</label>
                  <input className="admin-input" type="number" value={modal.data.stock} onChange={e => setModal(m => ({ ...m, data: { ...m.data, stock: +e.target.value } }))} />
                </div>
              </div>
              <div className="admin-form-row">
                <label className="admin-label">Image URL</label>
                <input className="admin-input" value={modal.data.image} onChange={e => setModal(m => ({ ...m, data: { ...m.data, image: e.target.value } }))} placeholder="https://…" />
              </div>
            </div>
            <div className="admin-modal__foot">
              <button className="button outline-button" onClick={() => setModal({ open: false, data: emptyProduct })}>Cancel</button>
              <button className="button dark-button" onClick={save}><Check size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal admin-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h3>Delete Product</h3>
              <button className="icon-button" onClick={() => setDeleteId(null)}><X size={18} /></button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>This product will be permanently removed.</p>
            </div>
            <div className="admin-modal__foot">
              <button className="button outline-button" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="button" style={{ background: '#c0392b', color: 'white', borderColor: '#c0392b' }} onClick={() => { setProducts(p => p.filter(x => x.id !== deleteId)); setDeleteId(null); showToast('Product deleted') }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  )
}
