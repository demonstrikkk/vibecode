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
        isAuthenticated: true, // Always authenticated
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


