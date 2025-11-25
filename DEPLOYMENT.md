# ChefBuddy - Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) (FREE tier available)
3. **OpenRouter API Key**: Get from [openrouter.ai](https://openrouter.ai)
4. **GitHub Account**: Push your code to GitHub

---

## 🗄️ Step 1: Set Up MongoDB Atlas (FREE)

### Create a Free Cluster:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up / Log in
3. Click **"Build a Database"**
4. Select **"M0 FREE"** tier
5. Choose a cloud provider (AWS recommended) and region closest to you
6. Click **"Create Cluster"**

### Create Database User:
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username: `chefbuddy`
5. Enter a strong password (save this!)
6. Set privileges to **"Read and write to any database"**
7. Click **"Add User"**

### Allow Network Access:
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Get Connection String:
1. Go to **"Database"** → Click **"Connect"**
2. Select **"Connect your application"**
3. Copy the connection string, it looks like:
   ```
   mongodb+srv://chefbuddy:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password

---

## 🔑 Step 2: Get OpenRouter API Key

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up / Log in
3. Go to **"Keys"** section
4. Click **"Create Key"**
5. Copy the API key (starts with `sk-or-v1-...`)

---

## 🚀 Step 3: Deploy Backend to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend folder
cd backend

# Deploy
vercel

# Follow prompts and set environment variables when asked
```

### Option B: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Vercel will auto-detect Python

### Set Environment Variables in Vercel:
Go to your project → **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-your-key-here` |
| `MONGODB_URI` | `mongodb+srv://chefbuddy:yourpassword@cluster0.xxxxx.mongodb.net/chefbuddy_db?retryWrites=true&w=majority` |
| `USE_MONGODB` | `true` |
| `SECRET_KEY` | `your-super-secret-jwt-key-change-this-in-production-2025` |

---

## 🎨 Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the same repository again (or create new project)
3. Set **Root Directory** to `frontend`
4. Vercel will auto-detect Vite

### Set Environment Variable:
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-project.vercel.app` |

---

## 📁 Project Structure for Vercel

```
vibecode/
├── backend/
│   ├── api/
│   │   └── index.py          # Vercel serverless entry point
│   ├── vercel.json           # Vercel config
│   ├── requirements.txt
│   ├── main.py
│   └── ...
├── frontend/
│   ├── vercel.json           # Frontend Vercel config
│   ├── src/
│   └── ...
└── DEPLOYMENT.md
```

---

## 🔧 Environment Variables Summary

### Backend (Vercel):
```env
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chefbuddy_db
USE_MONGODB=true
SECRET_KEY=your-random-secret-key-for-jwt-tokens
```

### Frontend (Vercel):
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

## ⚠️ Important Notes

1. **MongoDB Atlas FREE tier** gives you 512MB storage - enough for development
2. **OpenRouter** has free models available (we use `x-ai/grok-4.1-fast:free`)
3. **Vercel Hobby Plan** is FREE and supports Python serverless functions
4. Make sure to use HTTPS URLs in production
5. The `SECRET_KEY` should be a long random string in production

---

## 🧪 Testing Your Deployment

1. Visit your frontend URL
2. Register a new account
3. Log in
4. Try generating a recipe
5. Add items to your pantry

If something doesn't work, check:
- Vercel logs (Functions tab in dashboard)
- Browser console for errors
- Network tab for failed API calls

---

## 🆘 Troubleshooting

### "MongoDB connection failed"
- Check your `MONGODB_URI` has the correct password
- Make sure Network Access allows `0.0.0.0/0`
- Add `?retryWrites=true&w=majority` to the URI

### "OpenRouter API error"
- Verify your API key is correct
- Check if you have credits (free models work without credits)

### "CORS errors" / Double slash in URLs
- Check that `VITE_API_URL` doesn't end with `/` (should be `https://your-backend.vercel.app` not `https://your-backend.vercel.app/`)
- Make sure backend allows frontend origin
- Check browser network tab for the exact failing URL

### "500 FUNCTION_INVOCATION_FAILED" on Vercel
1. Check Vercel function logs:
   - Go to your project dashboard
   - Click "Functions" tab  
   - Click on failed function to see logs
2. Common issues:
   - Missing environment variables
   - Import errors (missing dependencies in requirements.txt)
   - **EMAIL VALIDATOR ERROR**: `ModuleNotFoundError: No module named 'email_validator'` - Fixed by adding `email-validator==2.1.0` to requirements.txt
   - **PYMONGO COMPATIBILITY ERROR**: `cannot import name '_QUERY_OPTIONS' from 'pymongo.cursor'` - Fixed by updating Motor to 3.5.1 and pinning PyMongo to 4.8.0
   - **MONGODB AUTH ERROR**: `bad auth : authentication failed` - Check MONGODB_URI format and credentials
   - MongoDB connection timeout
3. Test the root endpoint: `https://your-backend.vercel.app/` should return JSON with status

### "JWT errors"
- Make sure `SECRET_KEY` is the same in all environments

### MongoDB Atlas Authentication Issues
If you see `bad auth : authentication failed`:

1. **Check your MONGODB_URI format** in Vercel environment variables:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

2. **Verify MongoDB Atlas settings**:
   - Go to MongoDB Atlas dashboard
   - Check if your database user exists and password is correct
   - Ensure IP whitelist includes `0.0.0.0/0` (for Vercel serverless functions)
   - Database name should match what's in your connection string

3. **Test connection locally** first:
   - Copy MONGODB_URI from Vercel environment variables
   - Test in your local environment
   - If it works locally but not on Vercel, it's likely an IP restriction

4. **Fallback behavior**: The app will automatically fall back to in-memory mode if MongoDB connection fails

### Quick Health Check
Visit `https://your-backend.vercel.app/` - you should see:
```json
{
  "message": "ChefBuddy Recipe Generator API is running!",
  "serverless": true,
  "mongodb": true,
  "env_vars": {
    "VERCEL": "1",
    "OPENROUTER_API_KEY": "set",
    "MONGODB_URI": "set"
  }
}
```
