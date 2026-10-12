import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link className="brand footer-brand-link" to="/">
            <span className="brand-mark">N</span><span className="brand-word">Nexa<span>Cart</span></span>
          </Link>
          <p className="footer-tagline">Shop everyday essentials in one place.</p>
          <p className="footer-brand-note">Browse products for home, work and everyday life.</p>
        </div>
        <div className="footer-column">
          <span className="footer-kicker">EXPLORE</span>
          <Link to="/?category=Fashion">Fashion</Link>
          <Link to="/?category=Electronics">Electronics</Link>
          <Link to="/?category=Home%20%26%20Kitchen">Home & kitchen</Link>
          <Link to="/?category=Beauty">Beauty</Link>
        </div>
        <div className="footer-column">
          <span className="footer-kicker">YOUR ACCOUNT</span>
          <Link to="/cart">Shopping cart</Link>
          <Link to="/orders">Order history</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create an account</Link>
        </div>
        <div className="footer-note-block">
          <span className="footer-kicker">NEXACART</span>
          <p>Browse our latest products and find what you need.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>{ "\u00A9" } {new Date().getFullYear()} NexaCart</span>

      </div>
    </footer>
  );
}

