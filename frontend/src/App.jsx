import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import FoodRecommendations from './pages/FoodRecommendations';
import ExpiryRecommendations from './pages/ExpiryRecommendations';

function AppLayout({ children }) {
    return (
        <div className="app-container">
            <Navbar />
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Landing page redirects to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route
                    path="/dashboard"
                    element={
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    }
                />
                <Route
                    path="/recipes"
                    element={
                        <AppLayout>
                            <Recipes />
                        </AppLayout>
                    }
                />
                <Route
                    path="/recipes/:id"
                    element={
                        <AppLayout>
                            <RecipeDetail />
                        </AppLayout>
                    }
                />
                <Route
                    path="/planner"
                    element={
                        <AppLayout>
                            <MealPlanner />
                        </AppLayout>
                    }
                />
                <Route
                    path="/shopping"
                    element={
                        <AppLayout>
                            <ShoppingList />
                        </AppLayout>
                    }
                />
                <Route
                    path="/pantry"
                    element={
                        <AppLayout>
                            <Pantry />
                        </AppLayout>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <AppLayout>
                            <Profile />
                        </AppLayout>
                    }
                />
                <Route
                    path="/food-recommendations"
                    element={
                        <AppLayout>
                            <FoodRecommendations />
                        </AppLayout>
                    }
                />
                <Route
                    path="/expiry-recommendations"
                    element={
                        <AppLayout>
                            <ExpiryRecommendations />
                        </AppLayout>
                    }
                />
            </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
