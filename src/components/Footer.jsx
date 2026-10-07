import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">

        <div className="footer-brand">
          <h3>NexaCart</h3>
          <p className="footer-tagline">
            Everything you need. Nothing you don't.
          </p>
          <span className="footer-brand-note">
            Browse better. Shop easier.
          </span>
        </div>

        <div className="footer-column">
          <span className="footer-kicker">SHOP</span>

          <Link to="/?category=Fashion">Clothing</Link>
          <Link to="/?category=Electronics">Electronics</Link>
          <Link to="/?category=Beauty">Beauty</Link>
        </div>

        <div className="footer-column">
          <span className="footer-kicker">PLATFORM</span>

          <Link to="/cart">Secure checkout</Link>
          <Link to="/orders">Order tracking</Link>
          <Link to="/admin">Admin tools</Link>
        </div>

      </div>

      <div className="shell footer-bottom">
        <span>© 2026 Govind Telang · NexaCart</span>
        <span>Built with Spring Boot + React</span>
      </div>
    </footer>
  )
}