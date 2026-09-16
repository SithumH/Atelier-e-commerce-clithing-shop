'use client'

import { useMemo, useState } from 'react'
import { Search, ShoppingBag, UserRound, Heart, ChevronDown, ArrowRight, Star, Plus, Minus, X, Menu, Instagram, Facebook, Twitter, Check, Truck, ShieldCheck } from 'lucide-react'

const products = [
  { id: 1, name: 'Cloud Knit Cardigan', category: 'Women', price: 128, oldPrice: 168, rating: 4.9, reviews: 84, image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85', color: 'Ivory', tag: 'Best seller' },
  { id: 2, name: 'Relaxed Oxford Shirt', category: 'Men', price: 96, oldPrice: 120, rating: 4.8, reviews: 61, image: 'https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=85', color: 'Sky', tag: 'New' },
  { id: 3, name: 'Studio Leather Tote', category: 'Accessories', price: 210, oldPrice: 260, rating: 4.9, reviews: 109, image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85', color: 'Espresso', tag: 'Limited' },
  { id: 4, name: 'Everyday Wide Leg Trouser', category: 'Women', price: 110, oldPrice: 145, rating: 4.7, reviews: 42, image: 'https://images.unsplash.com/photo-1506629905607-d9b1e7adf8b6?auto=format&fit=crop&w=900&q=85', color: 'Stone', tag: 'Sale' },
  { id: 5, name: 'Canvas Weekend Sneaker', category: 'Accessories', price: 88, oldPrice: 110, rating: 4.8, reviews: 76, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', color: 'Cedar', tag: 'New' },
  { id: 6, name: 'Essential Rib Tank', category: 'Women', price: 42, oldPrice: 58, rating: 4.6, reviews: 35, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85', color: 'Black', tag: 'Everyday' },
]

const categories = [
  { name: 'New arrivals', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Women', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Men', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1000&q=85' },
]

type Product = typeof products[number]

function ProductCard({ product, onAdd, onWish, wished }: { product: Product; onAdd: (p: Product) => void; onWish: (id: number) => void; wished: boolean }) {
  return (
    <article className="product-card group">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        <span className="product-tag">{product.tag}</span>
        <button className={`wish-button ${wished ? 'is-wished' : ''}`} onClick={() => onWish(product.id)} aria-label={`Add ${product.name} to wishlist`}>
          <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
        </button>
        <button className="quick-add" onClick={() => onAdd(product)}>Quick add <Plus size={15} /></button>
      </div>
      <div className="product-meta">
        <div className="product-row"><h3>{product.name}</h3><span className="product-color">{product.color}</span></div>
        <div className="product-row"><div className="price"><strong>${product.price}</strong><del>${product.oldPrice}</del></div><span className="rating"><Star size={13} fill="currentColor" /> {product.rating}</span></div>
      </div>
    </article>
  )
}

export default function Page() {
  const [cart, setCart] = useState<Product[]>([])
  const [wished, setWished] = useState<number[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState('')
  const [email, setEmail] = useState('')

  const filtered = useMemo(() => products.filter((p) => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [category, query])
  const addToCart = (product: Product) => { setCart((current) => [...current, product]); setToast(`${product.name} added to bag`); setTimeout(() => setToast(''), 2400) }
  const toggleWish = (id: number) => setWished((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <main className="site-shell">
      <div className="announcement">Complimentary shipping on orders over $150 <ArrowRight size={14} /></div>
      <header className="site-header">
        <button className="mobile-menu" onClick={() => setDrawer(!drawer)} aria-label="Toggle menu"><Menu size={21} /></button>
        <a href="#top" className="brand">atelier<span>.</span></a>
        <nav className={`main-nav ${drawer ? 'open' : ''}`}>
          <a href="#shop">Shop</a><a href="#new">New arrivals</a><a href="#story">Our story</a><a href="#journal">Journal</a>
        </nav>
        <div className="header-actions">
          <label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pieces" aria-label="Search products" /></label>
          <button className="icon-button" aria-label="Account"><UserRound size={19} /></button>
          <button className="icon-button wish-nav" aria-label="Wishlist"><Heart size={19} fill={wished.length ? 'currentColor' : 'none'} /><span>{wished.length}</span></button>
          <button className="bag-button" onClick={() => document.getElementById('bag')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Open shopping bag"><ShoppingBag size={19} /><span>Bag ({cart.length})</span></button>
        </div>
      </header>

      <section className="hero" id="top">
        <img src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=2200&q=90" alt="Model wearing the new autumn collection" />
        <div className="hero-overlay" />
        <div className="hero-content"><p className="eyebrow light">The autumn edit / 2026</p><h1>Made for<br /><em>every day.</em></h1><p className="hero-copy">Thoughtful pieces designed to live in your wardrobe, not just your feed.</p><a className="button light-button" href="#shop">Shop the collection <ArrowRight size={16} /></a></div>
        <div className="hero-note">01 <span /> 03</div>
      </section>

      <section className="intro-section" id="story"><div><p className="eyebrow">Considered essentials</p><h2>Less, but <em>better.</em></h2></div><p className="intro-copy">We make beautiful, lasting things for the everyday. From the first sketch to the final stitch, every detail is considered — so getting dressed feels effortless.</p></section>

      <section className="category-section"><div className="section-heading"><div><p className="eyebrow">Explore the edit</p><h2>Find your <em>everyday.</em></h2></div><a className="text-link" href="#shop">View all <ArrowRight size={15} /></a></div><div className="category-grid">{categories.map((item) => <a href="#shop" className="category-card" key={item.name}><img src={item.image} alt={item.name} /><div><span>{item.name}</span><ArrowRight size={17} /></div></a>)}</div></section>

      <section className="products-section" id="shop"><div className="section-heading product-heading"><div><p className="eyebrow">Curated for now</p><h2>New <em>in.</em></h2></div><div className="filter-pills">{['All', 'Women', 'Men', 'Accessories'].map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="product-grid">{filtered.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} onAdd={addToCart} onWish={toggleWish} wished={wished.includes(p.id)} />)}</div><div className="center-action"><a className="button outline-button" href="#shop">View all pieces <ArrowRight size={16} /></a></div></section>

      <section className="feature-banner" id="new"><div className="feature-image"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85" alt="Layered neutral clothing from the autumn edit" /></div><div className="feature-copy"><p className="eyebrow">The autumn edit</p><h2>Layers of<br /><em>possibility.</em></h2><p>Soft tailoring, warm textures, and the kind of easy layers that make the in-between season the best one.</p><a className="button dark-button" href="#shop">Explore the edit <ArrowRight size={16} /></a></div></section>

      <section className="values-section"><div className="section-heading"><div><p className="eyebrow">Why atelier</p><h2>Good by <em>design.</em></h2></div></div><div className="values-grid"><div><span className="value-number">01</span><h3>Thoughtful materials</h3><p>Natural fibers and recycled fabrics selected for how they feel, wear, and age.</p></div><div><span className="value-number">02</span><h3>Made to last</h3><p>Timeless silhouettes designed to be worn on repeat and passed along.</p></div><div><span className="value-number">03</span><h3>Less waste</h3><p>Small-batch production and considered packaging, from us to you.</p></div></div></section>

      <section className="newsletter" id="journal"><p className="eyebrow">A note from us</p><h2>Stay in the <em>know.</em></h2><p>New pieces, studio notes, and a little inspiration. Delivered occasionally.</p><form onSubmit={(e) => { e.preventDefault(); setEmail(''); setToast('You are on the list'); setTimeout(() => setToast(''), 2400) }}><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Your email address" aria-label="Email address" /><button type="submit"><ArrowRight size={19} /></button></form></section>

      <footer className="site-footer"><div className="footer-top"><div><a className="brand footer-brand" href="#top">atelier<span>.</span></a><p>Considered essentials for<br />the everyday.</p></div><div className="footer-links"><div><p className="footer-label">Explore</p><a href="#shop">Shop all</a><a href="#new">New arrivals</a><a href="#story">Our story</a></div><div><p className="footer-label">Help</p><a href="#bag">Shipping & returns</a><a href="#bag">Contact us</a><a href="#bag">FAQ</a></div><div><p className="footer-label">Follow</p><a href="#top">Instagram</a><a href="#top">Pinterest</a><a href="#top">TikTok</a></div></div></div><div className="footer-bottom"><span>© 2026 atelier. All rights reserved.</span><span>Designed with intention.</span></div></footer>

      <aside className={`bag-drawer ${cart.length ? 'has-items' : 'empty-hidden'}`} id="bag"><div className="bag-header"><h2>Your bag <span>{cart.length}</span></h2><button onClick={() => setCart([])} aria-label="Clear bag"><X size={18} /></button></div>{cart.length ? <><div className="bag-items">{cart.map((p, i) => <div className="bag-item" key={`${p.id}-${i}`}><img src={p.image} alt="" /><div><h3>{p.name}</h3><p>${p.price} · {p.color}</p><div className="quantity"><button aria-label="Decrease quantity"><Minus size={13} /></button><span>1</span><button aria-label="Increase quantity"><Plus size={13} /></button></div></div></div>)}</div><div className="bag-total"><span>Subtotal</span><strong>${cart.reduce((total, p) => total + p.price, 0)}</strong></div><button className="button dark-button full-button">Checkout <ArrowRight size={16} /></button></> : <div className="empty-bag"><ShoppingBag size={30} /><p>Your bag is waiting.</p><span>Add something beautiful.</span></div>}</aside>
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </main>
  )
}
