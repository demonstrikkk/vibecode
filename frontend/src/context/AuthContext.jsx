import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    // Mock user data - no real authentication needed
    const [user, setUser] = useState({
        email: 'user@chefbuddy.com',
        full_name: 'Guest User',
        preferences: {
            dietary_preferences: [],
            dietary_restrictions: [],
            household_size: 1
        }
    });
    
    // Mock token for API calls
    const [token] = useState('mock-token');
    const [loading] = useState(false);

    // Mock update preferences function
    const updatePreferences = (newPreferences) => {
        setUser(prev => ({
            ...prev,
            preferences: { ...prev.preferences, ...newPreferences }
        }));
    };

    const value = {
        user,
        token,
        loading,
        updatePreferences,
        // These functions are no longer used but kept for compatibility
        login: async () => {},
        register: async () => {},
        logout: () => {},
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    };

    const updatePreferences = async (preferences) => {
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(api.preferences, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(preferences),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to update preferences');
            }

            const data = await response.json();

            // Update user with new preferences
            if (user) {
                const updatedUser = { ...user, preferences: data.preferences };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        setUser, // Added setUser to allow manual updates if needed
        token,
        login,
        register,
        logout,
        updatePreferences,
        isAuthenticated: !!token,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;


