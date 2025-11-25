import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Sparkles, Clock, Users, Calendar, ShoppingBag, Leaf, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-header">
        <nav className="landing-nav container">
          <div className="logo">
            <ChefHat size={32} />
            <span>ChefBuddy</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </nav>
        
        <div className="hero container">
          <div className="hero-content">
            <div className="badge-pill">
              <Sparkles size={16} />
              <span>AI-Powered Recipe Generation</span>
            </div>
            <h1>Cook Smarter, <br/>Eat <span className="gradient-text">Better</span></h1>
            <p className="hero-subtitle">
              Your personal AI chef that creates recipes based on your dietary preferences, 
              available ingredients, and the time of day. Never wonder "what's for dinner" again.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary btn-lg">
                <ChefHat size={20} />
                Start Cooking Free
              </Link>
              <Link to="/recipes" className="btn-outline btn-lg">
                Browse Recipes
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <strong>1000+</strong>
                <span>Recipes</span>
              </div>
              <div className="stat">
                <strong>AI</strong>
                <span>Powered</span>
              </div>
              <div className="stat">
                <strong>Free</strong>
                <span>To Use</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80" 
              alt="Delicious food"
            />
            <div className="floating-card card-1">
              <Clock size={20} />
              <span>Breakfast at 8 AM</span>
            </div>
            <div className="floating-card card-2">
              <Leaf size={20} />
              <span>Vegetarian Friendly</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Cook Like a Pro</h2>
            <p>From meal planning to grocery shopping, we've got you covered</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles size={28} />
              </div>
              <h3>AI Recipe Generation</h3>
              <p>Tell us what ingredients you have, and our AI creates personalized recipes just for you.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={28} />
              </div>
              <h3>Time-Based Suggestions</h3>
              <p>Get breakfast, lunch, or dinner ideas based on the time of day automatically.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Dietary Preferences</h3>
              <p>Set your dietary needs once - vegan, gluten-free, halal - and every recipe fits.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={28} />
              </div>
              <h3>Meal Planning</h3>
              <p>Plan your entire week's meals with our intuitive calendar interface.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <ShoppingBag size={28} />
              </div>
              <h3>Smart Shopping List</h3>
              <p>Auto-generate shopping lists from your meal plan with one click.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Search size={28} />
              </div>
              <h3>Recipe Search</h3>
              <p>Search thousands of recipes by ingredients, cuisine, or dietary type.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in just 3 simple steps</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Tell us about your dietary preferences, allergies, and cooking skill level.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Get Personalized Recipes</h3>
              <p>Our AI generates recipes tailored to your taste and available ingredients.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Cook & Enjoy</h3>
              <p>Follow step-by-step instructions and track your pantry automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Cooking?</h2>
            <p>Join thousands of home cooks who've discovered their inner chef</p>
            <Link to="/register" className="btn-primary btn-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <ChefHat size={28} />
              <span>ChefBuddy</span>
            </div>
            <p>© 2025 ChefBuddy. Made with ❤️ for food lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
