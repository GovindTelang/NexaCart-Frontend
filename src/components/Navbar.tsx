import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announcement-bar">
        <span>Thoughtful finds for everyday living</span>
        <span className="announcement-note">Simple shopping. Secure checkout.</span>
      </div>
      <header className="topbar">
        <div className="shell nav-inner">
          <Link className="brand" to="/" onClick={closeMenu} aria-label="NexaCart home">
            <span className="brand-mark">N</span>
            <span className="brand-word">Nexa<span>Cart</span></span>
          </Link>

          <nav className={`nav-links${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
            <NavLink to="/" end onClick={closeMenu}>Shop</NavLink>
            <Link to="/?category=Home%20%26%20Kitchen" onClick={closeMenu}>Home & living</Link>
            <Link to="/?category=Electronics" onClick={closeMenu}>Electronics</Link>
            {user && <NavLink to="/orders" onClick={closeMenu}>My orders</NavLink>}
            {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <Link className="account-avatar" to="/orders" onClick={closeMenu} aria-label="Open your order history" title="My orders">{user.email.trim().split("@")[0]?.trim().charAt(0).toUpperCase() || "U"}</Link>
                <button className="link-button signout-button" onClick={signOut}>Sign out</button>
              </>
            ) : (
              <>
                <Link className="link-button login-link" to="/login">Sign in</Link>
                <Link className="button button-small join-button" to="/register">Create account</Link>
              </>
            )}
            <Link className="cart-link" to="/cart" aria-label={`Shopping cart, ${itemCount} items`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
              <span className="cart-badge">{itemCount}</span>
            </Link>
            <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}


