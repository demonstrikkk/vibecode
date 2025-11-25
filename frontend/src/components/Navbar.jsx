import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Book, Calendar, ShoppingBag, Refrigerator as PantryIcon, Menu, X, ChefHat, User, Sparkles, Clock } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            <User size={18} />
            <span>Welcome, User!</span>
          </Link>
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
          <Link
            to="/profile"
            className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
