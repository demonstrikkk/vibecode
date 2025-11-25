# ChefBuddy - AI Recipe Generator

A full-stack application that generates personalized recipes using AI. Built with React + Vite frontend and FastAPI backend.

## 🚀 Features

- **AI-Powered Recipe Generation** using OpenRouter API
- **Beautiful Vintage Recipe Card UI** with smooth animations
- **Customizable Preferences**: dietary type, cuisine, difficulty, available ingredients
- **YouTube Video Integration** for recipe tutorials
- **Responsive Design** with Tailwind CSS

## 📁 Project Structure

```
ChefBuddy/
├── frontend/          # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   └── VintageRecipeCard.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── backend/           # FastAPI + Python
    ├── main.py
    ├── requirements.txt
    └── .env
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd backend
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Activate the virtual environment:

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/WSL:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```powershell
pip install -r requirements.txt
```

5. The API key is already configured in `.env` file

6. Run the FastAPI server:
```powershell
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Run the development server:
```powershell
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎯 Usage

1. Start both backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Fill in your recipe preferences:
   - Dietary Type (veg/non-veg/vegan)
   - Cuisine Type
   - Food Category
   - Available Ingredients
   - Foods You Like
   - Difficulty Level
4. Click "Generate Recipe" to get your AI-powered recipe!

## 🔧 Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **FastAPI** - Web framework
- **Python 3.8+** - Programming language
- **OpenAI SDK** - API integration with OpenRouter
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

## 📝 API Endpoints

### `POST /generate-recipe`
Generates a recipe based on user preferences.

**Request Body:**
```json
{
  "dietary_type": "veg",
  "cuisine_type": "Indian",
  "food_category": "snacks",
  "food_available": "tofu",
  "like_eating": "chilli potato, noodles",
  "difficulty": "easy"
}
```

**Response:**
```json
{
  "recipe": "Recipe Name: ...\n\nDescription: ...\n\nIngredients:\n..."
}
```

## 🔐 Environment Variables

### Backend (.env)
```
OPENROUTER_API_KEY=your_openrouter_api_key
```

Get your API key from [OpenRouter](https://openrouter.ai)

## 📦 Build for Production

### Frontend
```powershell
npm run build
```

### Backend
Deploy using services like:
- Railway
- Render
- AWS EC2
- DigitalOcean

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎨 Screenshots

The app features a beautiful vintage-style recipe card with:
- Elegant typography
- Smooth animations
- Responsive layout
- YouTube tutorial links
- Ingredient lists and step-by-step instructions

---

**Happy Cooking! 👨‍🍳👩‍🍳**
