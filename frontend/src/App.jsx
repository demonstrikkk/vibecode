import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ChefBuddyAuth from './components/ChefBuddyAuth';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import LandingPage from "./pages/LandingPage";
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
                    <Route path="/login" element={<ChefBuddyAuth initialView="login" />} />
                    <Route path="/register" element={<ChefBuddyAuth initialView="register" />} />

                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Dashboard />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recipes"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Recipes />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/recipes/:id"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <RecipeDetail />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/planner"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <MealPlanner />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/shopping"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <ShoppingList />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pantry"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Pantry />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Profile />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/food-recommendations"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <FoodRecommendations />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expiry-recommendations"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <ExpiryRecommendations />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
