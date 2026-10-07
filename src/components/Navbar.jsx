import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const signOut = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="topbar">
      <div className="shell nav-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">N</span>
          <span>NexaCart</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Shop</NavLink>
          {user && <NavLink to="/orders">My Orders</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <button className="link-button" onClick={signOut}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="link-button" to="/login">
                Login
              </Link>
              <Link className="button button-small" to="/register">
                Join
              </Link>
            </>
          )}

          <Link className="cart-link" to="/cart" aria-label="Shopping cart">
            <span className="cart-icon">🛒</span>
            <span className="cart-badge">{itemCount}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}