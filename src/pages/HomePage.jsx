import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'

const heroSlides = [
  { image: '/images/img1.png', kicker: 'NexaCart picks', title: 'Style for every side of you', copy: 'Fresh fashion, everyday essentials and smart deals in one place.' },
  { image: '/images/img2.png', kicker: 'Move better', title: 'Footwear built for the next step', copy: 'Explore comfortable, on-trend picks from your NexaCart catalog.' },
  { image: '/images/img3.png', kicker: 'Refined details', title: 'Upgrade the little things', copy: 'Premium accessories that finish the look without the fuss.' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [pageData, setPageData] = useState({ content: [], totalPages: 0, number: 0 })
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState(
    searchParams.get('category') || ''
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSlide((current) => (current + 1) % heroSlides.length), 5000)
    return () => clearInterval(id)
  }, [])

  const load = async (page = 0) => {
    setLoading(true)
    setError('')
    try {
      const data = keyword || category
        ? await api.searchProducts({ keyword, category, page, size: 8 })
        : await api.products({ page, size: 8, sortBy: 'id', direction: 'asc' })
      setPageData(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    setCategory(searchParams.get('category') || '')
    setKeyword('')
  }, [searchParams])

  useEffect(() => {
    load(0)
  }, [keyword, category])

  const categories = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Beauty',
  'Gaming',
  'Accessories',
  'Grocery',
  'Office & Study',
  ]

  const activeSlide = heroSlides[slide]

  return (
    <>
      <section className="hero shell-wide">
        <img src={activeSlide.image} alt="NexaCart collection" />
        <div className="hero-overlay" />
        <div className="shell hero-content">
          <div className="eyebrow">{activeSlide.kicker}</div>
          <h1>{activeSlide.title}</h1>
          <p>{activeSlide.copy}</p>
          {!isAuthenticated && <a className="button button-hero" href="#catalog">Start shopping</a>}
        </div>
        <div className="hero-dots">
          {heroSlides.map((_, index) => (
            <button key={index} className={index === slide ? 'dot active' : 'dot'} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} />
          ))}
        </div>
      </section>

      <main className="shell page-section" id="catalog">
        <section className="section-heading">
          <div>
            <span className="eyebrow">The catalog</span>
            <h2>Find your next favorite</h2>
          </div>
          <div className="catalog-controls">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </section>

        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <Loading label="Loading the catalog..." />
        ) : pageData.content?.length ? (
          <>
            <div className="product-grid">
              {pageData.content.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            <div className="pagination">
              <button className="button secondary" disabled={pageData.first} onClick={() => load(Math.max(0, pageData.number - 1))}>Previous</button>
              <span>Page {(pageData.number || 0) + 1} of {Math.max(pageData.totalPages || 1, 1)}</span>
              <button className="button secondary" disabled={pageData.last} onClick={() => load((pageData.number || 0) + 1)}>Next</button>
            </div>
          </>
        ) : (
          <div className="empty-state">No products match your search.</div>
        )}
      </main>
    </>
  )
}
