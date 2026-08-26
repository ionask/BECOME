'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const products = [
  { name: 'Minimalist Wall Print', type: 'Digital', status: 'Published', price: '$12.00' },
  { name: 'Wedding Invitation Set', type: 'Template', status: 'Draft', price: '$18.00' },
  { name: 'Neutral Desk Planner', type: 'Digital', status: 'Published', price: '$9.00' },
]

const emptyDraft = { title: '', description: '', tags: [], price: '' }

export default function Home() {
  const [active, setActive] = useState('Overview')
  const [etsyConnected, setEtsyConnected] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)
  const [idea, setIdea] = useState('')
  const [category, setCategory] = useState('')
  const [audience, setAudience] = useState('')
  const [style, setStyle] = useState('')
  const [cost, setCost] = useState('')
  const [draft, setDraft] = useState(emptyDraft)
  const [rationale, setRationale] = useState('')
  const [mode, setMode] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/etsy/status')
      .then((response) => response.json())
      .then((data) => setEtsyConnected(Boolean(data.connected)))
      .catch(() => setEtsyConnected(false))
  }, [])

  async function generateProduct(event) {
    event.preventDefault()
    setGenerating(true)
    setError('')
    try {
      const response = await fetch('/api/product/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, category, audience, style, cost }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generation failed')
      setDraft({ title: data.title, description: data.description, tags: data.tags || [], price: data.price })
      setRationale(data.rationale || '')
      setMode(data.mode || 'preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  function resetStudio() {
    setDraft(emptyDraft)
    setRationale('')
    setMode('')
    setError('')
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>BECOME</div>
        <a href={etsyConnected ? '/api/etsy/status' : '/api/etsy/connect'} className={styles.shopStatus}>
          <span /> {etsyConnected ? 'Shop connected' : 'Connect Etsy'}
        </a>
        <nav className={styles.navigation}>
          {['Overview', 'Products', 'Orders', 'Sales', 'Settings'].map((item) => (
            <button key={item} onClick={() => setActive(item)} className={active === item ? `${styles.navButton} ${styles.active}` : styles.navButton}>
              <span className={styles.dot} />{item}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.avatar}>G</div>
          <div><strong>My Shop</strong><small>Etsy Store</small></div>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>WORKSPACE / {active.toUpperCase()}</p><h1 className={styles.title}>{active}</h1></div>
          <button className={styles.primary} onClick={() => { setStudioOpen(true); setActive('Products'); }}>+ Create product</button>
        </header>

        {active === 'Products' || studioOpen ? (
          <section className={styles.studioShell}>
            <div className={styles.studioHeader}>
              <div>
                <p className={styles.eyebrow}>PRODUCT STUDIO</p>
                <h2 className={styles.studioTitle}>Turn an idea into an Etsy-ready product.</h2>
                <p className={styles.muted}>Describe what you want to sell. BECOME builds the title, listing copy, tags and a suggested price for you to review.</p>
              </div>
              <button className={styles.ghost} onClick={() => { setStudioOpen(false); resetStudio(); }}>Close</button>
            </div>

            <div className={styles.studioGrid}>
              <form className={styles.studioForm} onSubmit={generateProduct}>
                <label>What are you selling?<textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. minimalist printable wall art for a neutral bedroom" /></label>
                <div className={styles.formRow}>
                  <label>Category<input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Digital print" /></label>
                  <label>Target buyer<input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="New homeowners" /></label>
                </div>
                <div className={styles.formRow}>
                  <label>Style<input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Minimal, warm, editorial" /></label>
                  <label>Estimated cost<input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" /></label>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button className={styles.primary} type="submit" disabled={generating || !idea.trim()}>{generating ? 'Creating your product…' : 'Generate product'}</button>
              </form>

              <div className={styles.previewCard}>
                <div className={styles.previewTop}><span>LISTING PREVIEW</span>{mode && <em>{mode === 'ai' ? 'Generated' : 'Preview mode'}</em>}</div>
                {draft.title ? (
                  <>
                    <h3 className={styles.previewTitle}>{draft.title}</h3>
                    <div className={styles.price}>${Number(draft.price || 0).toFixed(2)}</div>
                    <p className={styles.previewDescription}>{draft.description}</p>
                    <div className={styles.tags}>{draft.tags.map((tag) => <span key={tag}>#{tag.replace(/^#/, '')}</span>)}</div>
                    {rationale && <p className={styles.rationale}>{rationale}</p>}
                    <div className={styles.previewActions}>
                      <button className={styles.ghost} onClick={resetStudio}>Start over</button>
                      <button className={styles.primary} disabled={!etsyConnected}>Save as Etsy draft</button>
                    </div>
                    {!etsyConnected && <p className={styles.connectHint}>Connect Etsy first. Publishing will stay disabled until your Etsy app is approved and connected.</p>}
                  </>
                ) : (
                  <div className={styles.emptyPreview}><div className={styles.emptyMark}>B</div><strong>Your listing will appear here.</strong><span>Generate a product to review the title, copy, tags and price before publishing.</span></div>
                )}
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className={styles.hero}>
              <div>
                <p className={styles.kicker}>Good afternoon</p>
                <h2 className={styles.heroTitle}>Your shop is ready to grow.</h2>
                <p className={styles.muted}>Everything you need to create, organize and publish your products in one place.</p>
              </div>
              <div className={styles.heroMark}>B</div>
            </div>

            <div className={styles.stats}>
              <div><span>PRODUCTS</span><strong>24</strong><small>+4 this month</small></div>
              <div><span>ORDERS</span><strong>86</strong><small>+18% this month</small></div>
              <div><span>REVENUE</span><strong>$2,842</strong><small>+12.4% this month</small></div>
            </div>

            <section className={styles.section}>
              <div className={styles.sectionHead}><div><p className={styles.eyebrow}>CATALOG</p><h3 className={styles.sectionTitle}>Recent products</h3></div><button className={styles.ghost} onClick={() => { setActive('Products'); setStudioOpen(true); }}>Create first</button></div>
              <div className={styles.table}>
                <div className={styles.tableHead}><span>PRODUCT</span><span>TYPE</span><span>STATUS</span><span>PRICE</span></div>
                {products.map((product) => <div className={styles.row} key={product.name}><strong>{product.name}</strong><span>{product.type}</span><span className={product.status === 'Published' ? styles.published : styles.draft}>{product.status}</span><span>{product.price}</span></div>)}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
