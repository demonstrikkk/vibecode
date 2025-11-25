# Quick Start Guide

## Complete Integration Summary

I've successfully integrated the ChefBuddy authentication system with your ChefBuddy recipe generator! Here's what was implemented:

## ✅ What's Been Done

### Backend (FastAPI)
1. **Authentication System**
   - User registration with JWT tokens
   - Login/logout functionality  
   - Password hashing with bcrypt
   - Protected routes requiring authentication
   
2. **User Management**
   - User profile with name, age, location
   - Dietary preferences storage
   - Preferences update endpoint
   
3. **Enhanced Recipe Generation**
   - Authenticated recipe generation uses user's saved preferences
   - Public endpoint for testing without auth
   - Personalized recommendations based on user profile

### Frontend (React + TypeScript)
1. **Routing Setup**
   - React Router for navigation
   - `/login` - Login/Register page
   - `/dashboard` - Main app with recipe generator & expiry tracker
   - `/preferences` - User preferences management
   - Protected routes requiring authentication
   
2. **Authentication Context**
   - Global auth state management
   - Token storage in localStorage
   - Login, register, logout, updatePreferences functions
   
3. **Pages Created**
   - **Login Page**: Clean login/register form with validation
   - **Preferences Page**: Multi-select dietary preferences, restrictions, health goals, cuisines
   - **Dashboard**: Your existing recipe generator + expiry tracker with user header
   
4. **Components**
   - ProtectedRoute: Redirects to login if not authenticated
   - User profile header with logout button
   - Integration with existing VintageRecipeCard, ExpiryForm, ExpiryList

## 🚀 How to Run

### Step 1: Install Backend Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

The requirements.txt now includes:
- `python-jose[cryptography]` - JWT tokens
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data support

### Step 2: Update .env File
```env
OPENROUTER_API_KEY=your_key_here
SECRET_KEY=your-secret-jwt-key-change-this
USE_MONGODB=false
```

### Step 3: Start Backend
```powershell
cd backend
python main.py
```
Backend runs on http://localhost:8000

### Step 4: Start Frontend
```powershell
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173 (or 5174 if 5173 is busy)

## 📱 User Flow

1. **Visit App** → Redirects to `/login`
2. **Register Account**:
   - Enter name, email, password, age, location
   - Click "Create Account"
   - Auto-redirected to `/preferences`
3. **Set Preferences**:
   - Select dietary preferences (Veg, Vegan, Keto, etc.)
   - Choose restrictions (Nuts, Dairy, Gluten, etc.)
   - Pick health goals, cuisines, skill level, budget
   - Click "Save Preferences" → Redirected to `/dashboard`
4. **Dashboard**:
   - Recipe Generator tab: Generate AI recipes (uses your preferences automatically!)
   - Expiry Tracker tab: Track food items and expiry dates
   - Settings button: Update preferences anytime
   - Logout button: End session

## 🔑 Key Features

### Personalized Recipes
When you generate a recipe, it automatically considers:
- Your dietary preferences (Veg/Vegan/etc.)
- Your dietary restrictions (no nuts, dairy-free, etc.)
- Your health goals (weight loss, muscle gain, etc.)
- Your favorite cuisines

### Secure Authentication
- JWT tokens with 7-day expiry
- Passwords hashed with bcrypt
- Protected routes on frontend and backend
- Persistent sessions via localStorage

### User Preferences
- Saved to backend (in-memory or MongoDB)
- Applied automatically to recipe generation
- Editable anytime via Preferences page

## 📁 New Files Created

### Backend
- `backend/models/user.py` - User and preferences data models
- `backend/utils/auth.py` - JWT and password utilities

### Frontend
- `frontend/src/context/AuthContext.tsx` - Auth state management
- `frontend/src/components/ProtectedRoute.tsx` - Route protection
- `frontend/src/pages/Login.tsx` - Login/Register page
- `frontend/src/pages/Dashboard.tsx` - Main dashboard
- `frontend/src/pages/PreferencesPage.tsx` - Preferences editor

### Documentation
- `INTEGRATION_GUIDE.md` - Complete integration documentation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth token)
- `PUT /api/auth/preferences` - Update preferences (requires auth token)

### Recipes
- `POST /api/generate-recipe` - Personalized recipe (requires auth token)
- `POST /api/generate-recipe-public` - Public recipe (no auth needed)

## 🎨 UI/UX
- Beautiful amber/orange theme maintained throughout
- Smooth transitions and animations
- Mobile-responsive design
- Loading states and error handling
- User-friendly forms with validation

## 🐛 Troubleshooting

### "401 Unauthorized" errors
- Make sure you're logged in
- Check that token is in localStorage
- Try logging out and back in

### Recipe generation fails
- Ensure backend is running on port 8000
- Check OPENROUTER_API_KEY in .env
- Look at backend terminal for error messages

### Can't login/register
- Verify backend is running
- Check browser console for errors
- Ensure email is valid format

## 📝 Notes

- In-memory storage by default (data resets on backend restart)
- To persist data, set `USE_MONGODB=true` and configure MongoDB
- All existing features (expiry tracker) still work!
- ChefBuddy theme CSS files kept for reference but not actively used

## 🎉 You're All Set!

Your app now has:
✅ Complete user authentication
✅ Personalized recipe generation  
✅ User preferences management
✅ Protected routes
✅ Beautiful, cohesive UI
✅ Food expiry tracking

Ready to cook! 🍳
