'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  Tag, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__head">
          <Link href="/" className="brand admin-brand">atelier<span>.</span></Link>
          <button className="icon-button admin-close" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <p className="admin-sidebar__label">Management</p>
        <nav className="admin-nav">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav__item ${pathname === href ? 'admin-nav__item--active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} />
              {label}
              <ChevronRight size={13} className="admin-nav__arrow" />
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__foot">
          <Link href="/" className="admin-nav__item admin-logout">
            <LogOut size={16} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="icon-button" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="admin-topbar__title">
            {nav.find(n => n.href === pathname)?.label ?? 'Admin'}
          </span>
          <div className="admin-topbar__right">
            <span className="admin-badge">Admin</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}
    </div>
  )
}
