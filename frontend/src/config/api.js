// API configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  baseUrl: API_BASE_URL,
  
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  preferences: `${API_BASE_URL}/api/auth/preferences`,
  
  // Recipe endpoints
  generateRecipe: `${API_BASE_URL}/api/generate-recipe`,
  
  // Expiry/Pantry endpoints
  expiryItems: `${API_BASE_URL}/api/expiry/items`,
  multiRecipe: `${API_BASE_URL}/api/expiry/multi-recipe`,
  
  // Helper function to build URLs with IDs
  expiryItemById: (id) => `${API_BASE_URL}/api/expiry/items/${id}`,
  expiryItemAdvice: (id) => `${API_BASE_URL}/api/expiry/items/${id}/advice`,
};

export default api;
