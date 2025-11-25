import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, Book, Calendar, ShoppingBag, Refrigerator as PantryIcon, Menu, X, ChefHat, User, LogOut, Settings, Sparkles, Clock } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const token = localStorage.getItem('auth_token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/recipes', icon: Book, label: 'Recipes' },
    { to: '/food-recommendations', icon: Sparkles, label: 'AI Recipes' },
    { to: '/expiry-recommendations', icon: Clock, label: 'Expiring Soon' },
    { to: '/planner', icon: Calendar, label: 'Planner' },
    { to: '/pantry', icon: PantryIcon, label: 'Pantry' },
    { to: '/shopping', icon: ShoppingBag, label: 'Shopping' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-brand">
          <ChefHat size={28} />
          <span>ChefBuddy</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-links desktop-nav">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="navbar-user desktop-nav">
          {token ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <User size={18} />
                <span>{user.name || 'Profile'}</span>
              </Link>
              <Link to="/preferences" className={`nav-link ${isActive('/preferences') ? 'active' : ''}`}>
                <Settings size={18} />
              </Link>
              <button onClick={logout} className="btn-logout">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
          <div className="mobile-divider" />
          {token ? (
            <>
              <Link
                to="/profile"
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
              <Link
                to="/preferences"
                className={`mobile-nav-link ${isActive('/preferences') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={20} />
                <span>Preferences</span>
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="mobile-nav-link logout"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="mobile-nav-link signup"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
