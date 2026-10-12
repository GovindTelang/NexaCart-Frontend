import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import type { PageResponse, Product } from "../types/api";
import { getErrorMessage } from "../utils/errors";

const heroSlides = [
  { image: "/images/img1.png", alt: "H&M fresh arrivals fashion banner", label: "Fresh arrivals" },
  { image: "/images/img2.png", alt: "U.S. Polo Assn. men's wear promotion banner", label: "Men's wear" },
  { image: "/images/img3.png", alt: "Wonder Women new classic collections banner", label: "New classic collections" },
] as const;
const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports & Fitness", "Beauty", "Gaming", "Accessories", "Grocery", "Office & Study"];
const initialPage: PageResponse<Product> = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 8, first: true, last: true, empty: true };

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [pageData, setPageData] = useState<PageResponse<Product>>(initialPage);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((current) => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setKeyword("");
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = keyword.trim() || category
          ? await api.searchProducts({ keyword: keyword.trim(), category, page: 0, size: 8 })
          : await api.products({ page: 0, size: 8, sortBy: "id", direction: "asc" });
        if (active) setPageData(data);
      } catch (error: unknown) {
        if (active) setError(getErrorMessage(error, "We couldn't load the catalog."));
      } finally {
        if (active) setLoading(false);
      }
    };
    const timer = window.setTimeout(() => { void load(); }, keyword ? 220 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [keyword, category, retryKey]);

  const loadPage = async (page: number) => {
    setLoading(true);
    setError("");
    try {
      const data = keyword.trim() || category
        ? await api.searchProducts({ keyword: keyword.trim(), category, page, size: 8 })
        : await api.products({ page, size: 8, sortBy: "id", direction: "asc" });
      setPageData(data);
      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't load that page."));
    } finally {
      setLoading(false);
    }
  };

  const activeSlide = heroSlides[slide];

  return (
    <>
      <main>
        <section className="hero-wrap shell" aria-label="Featured collections">
          <div className="hero">
            <img className="hero-image" src={activeSlide.image} alt={activeSlide.alt} />
            <div className="hero-footer">
              <span className="hero-index">0{slide + 1}<span> / 0{heroSlides.length}</span></span>
              <span className="hero-current-label">{activeSlide.label}</span>
              <div className="hero-controls" aria-label="Featured collection slides">
                {heroSlides.map((item, index) => (
                  <button key={item.label} className={`hero-dot${index === slide ? " active" : ""}`} onClick={() => setSlide(index)} aria-label={`Show ${item.label}`} aria-pressed={index === slide} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="benefit-strip shell" aria-label="Shopping benefits">
          <div className="benefit-item"><span className="benefit-icon">{"\u2197"}</span><div><strong>Browse by category</strong><span>Fashion, electronics, home and more</span></div></div>
          <div className="benefit-item"><span className="benefit-icon">{"\u25C7"}</span><div><strong>Your order history</strong><span>Review previous purchases</span></div></div>
          <div className="benefit-item"><span className="benefit-icon">{"\u2713"}</span><div><strong>Razorpay checkout</strong><span>Payments handled by Razorpay</span></div></div>
        </section>

        <section className="shell catalog-section" id="catalog">
          <div className="catalog-intro">
            <div>
              <span className="eyebrow">THE GOOD-FIND DEPARTMENT</span>
              <h2>Shop what feels right.</h2>
              <p>Useful things. Lovely things. Your next favourite could be here.</p>
            </div>
            
          </div>

          <div className="catalog-toolbar">
            <div className="category-list" aria-label="Filter by category">
              {categories.map((item) => {
                const value = item === "All" ? "" : item;
                return <button key={item} className={`category-chip${category === value ? " selected" : ""}`} onClick={() => setCategory(value)} aria-pressed={category === value}>{item}</button>;
              })}
            </div>
            <label className="search-box">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search the store" aria-label="Search products" />
              {keyword && <button type="button" onClick={() => setKeyword("")} aria-label="Clear search">{"\u00D7"}</button>}
            </label>
          </div>

          {error && <div className="alert error"><strong>Couldn't load products.</strong><span>{error}</span><button className="text-button" onClick={() => setRetryKey((value) => value + 1)}>Try again</button></div>}
          {loading ? <Loading label="Loading products..." /> : pageData.content.length ? (
            <>
              <div className="product-grid">{pageData.content.map((product) => <ProductCard key={product.id} product={product} />)}</div>
              <div className="pagination">
                <button className="button secondary" disabled={pageData.first} onClick={() => void loadPage(Math.max(0, pageData.number - 1))}>{"\u2190"} Previous</button>
                <span>Page <strong>{pageData.number + 1}</strong> of {Math.max(pageData.totalPages, 1)}</span>
                <button className="button secondary" disabled={pageData.last} onClick={() => void loadPage(pageData.number + 1)}>Next {"\u2192"}</button>
              </div>
            </>
          ) : (
            <div className="empty-state catalog-empty"><div className="empty-symbol">âŒ•</div><h3>No matches just yet</h3><p>Try another search or browse all categories.</p><button className="button secondary" onClick={() => { setKeyword(""); setCategory(""); }}>Clear filters</button></div>
          )}
        </section>

        {!isAuthenticated && <section className="join-banner shell"><div><span className="eyebrow">JOIN NEXACART</span><h2>Keep your shopping in one place.</h2><p>Create an account to keep your cart and orders together.</p></div><Link className="button" to="/register">Join NexaCart <span aria-hidden="true">{"\u2197"}</span></Link><div className="join-art" aria-hidden="true">N.</div></section>}
      </main>
    </>
  );
}


