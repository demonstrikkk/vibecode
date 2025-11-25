# 🔧 Troubleshooting Guide

## Recipe Card Not Showing After Submit

### Step 1: Check if Backend is Running ✅

Open a browser and go to: `http://localhost:8000`

You should see:
```json
{"message":"ChefBuddy Recipe Generator API is running!"}
```

**If you get an error:**
```powershell
# In backend directory
cd C:\Users\asus\ChefBuddy\ChefBuddy\backend
.\start.ps1
```

Or in WSL:
```bash
cd /mnt/c/Users/asus/ChefBuddy/ChefBuddy/backend
bash start.sh
```

### Step 2: Check Frontend Console 🖥️

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Generate Recipe"
4. Look for logs:

**Expected logs:**
```
Sending preferences: {dietary_type: "veg", ...}
Response status: 200
Received data: {recipe: "..."}
Parsed recipe: {title: "...", ingredients: [...], ...}
```

**If you see errors:**
- ❌ `Failed to fetch` → Backend not running
- ❌ `404 Not Found` → Check backend URL in vite.config.ts
- ❌ `CORS error` → Check backend CORS settings

### Step 3: Test Backend Directly 🧪

1. Open `test-api.html` in your browser:
```
file:///C:/Users/asus/ChefBuddy/ChefBuddy/test-api.html
```

2. Click "Test Generate Recipe"
3. Should see recipe JSON response

### Step 4: Check Network Tab 🌐

1. Open DevTools → Network tab
2. Click "Generate Recipe"
3. Look for `/api/generate-recipe` request

**Check:**
- Status: Should be `200 OK`
- Response: Should contain `{recipe: "..."}`
- Request Payload: Should contain your preferences

### Step 5: Verify Environment Variables 🔑

Check `backend/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-...
```

**Must start with `sk-or-`**

### Step 6: Common Issues & Fixes

#### Issue: Loading spinner doesn't stop
**Cause**: API error not being caught
**Fix**: Check console for error message

#### Issue: Blank screen after submit
**Cause**: Recipe state not updating
**Fix**: 
```typescript
// In App.tsx, add this after line 149:
console.log("Recipe state:", recipe);
```

#### Issue: "Failed to generate recipe"
**Cause**: Backend error
**Fix**: Check backend terminal for Python errors

#### Issue: Recipe shows old data
**Cause**: State not clearing
**Fix**: Already fixed - we clear recipe before fetching

### Step 7: Manual Test 🧪

Add this button to test with dummy data:

```tsx
// In App.tsx, before the form
<button
  onClick={() => {
    setRecipe({
      title: "Test Recipe",
      description: "This is a test",
      ingredients: [
        { name: "Flour", amount: "2 cups" },
        { name: "Sugar", amount: "1 cup" }
      ],
      steps: ["Mix ingredients", "Bake at 350°F"],
      youtubeLinks: ["https://youtube.com"]
    });
  }}
  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
>
  Test with Dummy Recipe
</button>
```

If this shows the recipe card → API/parsing issue
If this doesn't show → Component rendering issue

### Step 8: Check Vite Proxy 🔄

In `frontend/vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

**Test**: 
- Frontend: `http://localhost:5173/api/` 
- Should proxy to: `http://localhost:8000/`

### Quick Fix Commands 🚀

```powershell
# Kill all processes and restart
# Terminal 1: Backend
cd backend
.\start.ps1

# Terminal 2: Frontend  
cd frontend
.\start.ps1
```

### Still Not Working? 🆘

1. Check all console logs
2. Verify both servers are running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito mode
5. Check firewall isn't blocking ports 8000 or 5173

### Debug Checklist ✓

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] API key is set in .env
- [ ] CORS allows localhost:5173
- [ ] Network request shows 200 status
- [ ] Recipe data is being received
- [ ] Recipe state is updating (check React DevTools)

---

**Need more help?** Check the console logs and share them!
