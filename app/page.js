'use client'

import { useState } from 'react'
import styles from './page.module.css'

const products = [
  { name: 'Minimalist Wall Print', type: 'Digital', status: 'Published', price: '$12.00' },
  { name: 'Wedding Invitation Set', type: 'Template', status: 'Draft', price: '$18.00' },
  { name: 'Neutral Desk Planner', type: 'Digital', status: 'Published', price: '$9.00' },
]

export default function Home() {
  const [active, setActive] = useState('Overview')

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>BECOME</div>
        <div className={styles.shopStatus}><span /> Shop connected</div>
        <nav>
          {['Overview', 'Products', 'Orders', 'Sales', 'Settings'].map((item) => (
            <button key={item} onClick={() => setActive(item)} className={active === item ? styles.active : ''}>
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
          <div><p className={styles.eyebrow}>WORKSPACE / {active.toUpperCase()}</p><h1>{active}</h1></div>
          <button className={styles.primary}>+ Create product</button>
        </header>

        <div className={styles.hero}>
          <div>
            <p className={styles.kicker}>Good afternoon</p>
            <h2>Your shop is ready to grow.</h2>
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
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>CATALOG</p><h3>Recent products</h3></div><button className={styles.ghost}>View all</button></div>
          <div className={styles.table}>
            <div className={styles.tableHead}><span>PRODUCT</span><span>TYPE</span><span>STATUS</span><span>PRICE</span></div>
            {products.map((product) => <div className={styles.row} key={product.name}><strong>{product.name}</strong><span>{product.type}</span><span className={product.status === 'Published' ? styles.published : styles.draft}>{product.status}</span><span>{product.price}</span></div>)}
          </div>
        </section>
      </section>
    </main>
  )
}
