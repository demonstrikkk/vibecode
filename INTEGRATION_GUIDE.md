# ChefBuddy - Complete ChefBuddy Integration

## Overview
A fully integrated AI-powered recipe generator with user authentication, personalized preferences, and expiry tracking system.

## Features

### 🔐 Authentication System
- **User Registration**: Multi-step registration with profile setup
- **Login/Logout**: Secure JWT-based authentication
- **Protected Routes**: Dashboard and preferences accessible only to authenticated users
- **Persistent Sessions**: Token-based session management with localStorage

### 👤 User Profile & Preferences
- **Dietary Preferences**: Vegetarian, Vegan, Pescatarian, Keto, Paleo, Mediterranean, Balanced
- **Dietary Restrictions**: Nuts, Dairy, Gluten, Shellfish, Eggs, Soy, Halal, Kosher
- **Health Goals**: Weight loss, Muscle gain, Maintenance, Heart health, Better energy
- **Cooking Preferences**: Skill level, Household size, Budget, Favorite cuisines
- **Personalized Recommendations**: Recipe generation uses saved user preferences

### 🍳 Recipe Generator
- **AI-Powered**: Uses OpenRouter (Meta LLaMA 3.1) for intelligent recipe generation
- **Personalized**: Automatically incorporates user's dietary preferences and restrictions
- **Customizable**: Manual input for specific ingredients, cuisine types, and difficulty levels
- **Beautiful UI**: Vintage-style recipe cards with ingredients, steps, and YouTube links

### ⏰ Expiry Tracker
- **Food Item Management**: Track groceries with purchase and manufactured dates
- **AI Predictions**: Smart expiry date predictions based on food category
- **Advice Generation**: LLM-powered storage tips and recipe suggestions
- **Daily Alerts**: Scheduled checks for expiring items

## Project Structure

```
ChefBuddy/
├── backend/
│   ├── main.py                    # FastAPI application with all routes
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   ├── user.py               # User and preferences models
│   │   └── food_item.py          # Food item models
│   ├── utils/
│   │   ├── auth.py               # JWT authentication utilities
│   │   └── predict_expiry.py     # Expiry prediction logic
│   └── services/
│       └── openrouter_expiry.py  # OpenRouter API integration
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # Main app with routing
    │   ├── context/
    │   │   └── AuthContext.tsx   # Authentication state management
    │   ├── components/
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── VintageRecipeCard.tsx
    │   │   ├── ExpiryForm.tsx
    │   │   └── ExpiryList.tsx
    │   └── pages/
    │       ├── Login.tsx          # Login/Register page
    │       ├── Dashboard.tsx      # Main dashboard with recipe generator
    │       └── PreferencesPage.tsx # User preferences management
    └── package.json
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
   ```powershell
   cd backend
   ```

2. **Install Python dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Create `.env` file**:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   SECRET_KEY=your_secret_key_for_jwt
   USE_MONGODB=false
   ```

4. **Start the backend server**:
   ```powershell
   python main.py
   ```
   Or use the start script:
   ```powershell
   .\start.ps1
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```powershell
   cd frontend
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Start the development server**:
   ```powershell
   npm run dev
   ```
   Or use the start script:
   ```powershell
   .\start.ps1
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/preferences` - Update user preferences (requires auth)

### Recipe Generation
- `POST /api/generate-recipe` - Generate personalized recipe (requires auth)
- `POST /api/generate-recipe-public` - Generate recipe without auth (demo)

### Expiry Tracking
- `POST /api/expiry/items` - Add food item
- `GET /api/expiry/items` - Get all items with predictions
- `GET /api/expiry/items/{id}` - Get specific item
- `DELETE /api/expiry/items/{id}` - Delete item
- `POST /api/expiry/items/{id}/advice` - Get AI advice for item
- `POST /api/expiry/multi-recipe` - Get recipes for expiring items

## User Flow

1. **First Visit**: User lands on `/login` page
2. **Registration**: 
   - Create account with email, password, name, age, location
   - Redirected to `/preferences` to set dietary preferences
3. **Preferences Setup**:
   - Select dietary preferences, restrictions, health goals
   - Choose favorite cuisines, skill level, budget
   - Save and redirect to `/dashboard`
4. **Dashboard**:
   - Access recipe generator with pre-filled user preferences
   - Toggle between Recipe Generator and Expiry Tracker tabs
   - Manage profile and logout options
5. **Recipe Generation**:
   - Customize ingredients, cuisine, difficulty
   - AI generates personalized recipe based on profile + inputs
   - View beautiful vintage-style recipe card
6. **Expiry Tracking**:
   - Add grocery items with purchase dates
   - View AI-predicted expiry dates
   - Get storage advice and recipe suggestions

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation
- **python-jose**: JWT token handling
- **passlib**: Password hashing (bcrypt)
- **OpenAI SDK**: OpenRouter API client
- **Motor**: Async MongoDB driver (optional)
- **APScheduler**: Task scheduling

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **React Router**: Navigation
- **Context API**: State management
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **Vite**: Build tool

## Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=your_api_key
SECRET_KEY=your_jwt_secret_key
USE_MONGODB=false
MONGODB_URI=mongodb://localhost:27017  # if using MongoDB
```

### Frontend
No environment variables required for development. API calls go to `/api/*` which Vite proxies to `http://localhost:8000`.

## Security Features

- **Password Hashing**: bcrypt algorithm
- **JWT Tokens**: Secure authentication with 7-day expiry
- **Protected Routes**: Client-side route protection
- **Token Storage**: localStorage with automatic cleanup on logout
- **CORS**: Configured for secure cross-origin requests

## Future Enhancements

- Email verification system
- Password reset functionality
- Social login (Google, Facebook)
- Recipe favorites and history
- Meal planning calendar
- Shopping list generation
- Nutrition tracking
- Recipe sharing with other users
- Mobile app version

## Troubleshooting

### Backend Issues
- **Import errors**: Ensure all dependencies are installed via `pip install -r requirements.txt`
- **OpenRouter API errors**: Check your API key in `.env` file
- **Port conflicts**: Backend runs on port 8000 by default

### Frontend Issues
- **React Router errors**: Ensure `react-router-dom` is installed
- **Authentication loop**: Clear localStorage and cookies, then restart
- **API connection**: Ensure backend is running on port 8000

## License
MIT

## Contributors
ChefBuddy Team
