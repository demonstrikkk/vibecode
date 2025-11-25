# Expiry Food Predictor - Complete Documentation

## Overview

The **Expiry Food Predictor** is an intelligent system that tracks your grocery items, predicts their expiry dates, and provides AI-generated recipes and storage tips for items nearing expiry. It helps reduce food waste by sending timely reminders and creative recipe suggestions.

---

## Features

### 1. **Smart Expiry Prediction**
- Automatic calculation of manufacturing and expiry dates based on food category
- Safety buffer built into predictions (uses "safe expiry" date)
- Supports 8 food categories with different shelf-life profiles:
  - **Dairy**: 7 days shelf life, 20% safety buffer
  - **Vegetables**: 5 days shelf life, 15% safety buffer
  - **Fruits**: 10 days shelf life, 15% safety buffer
  - **Meat & Poultry**: 3 days shelf life, 20% safety buffer
  - **Packaged Foods**: 200 days shelf life, 5% safety buffer
  - **Spices**: 365 days shelf life, 5% safety buffer
  - **Bakery Items**: 3 days shelf life, 20% safety buffer
  - **Frozen Foods**: 180 days shelf life, 10% safety buffer

### 2. **AI-Powered Recipe Suggestions**
- Click "Get Recipes & Tips" on any item to receive:
  - Urgency summary (e.g., "Use within 2 days")
  - 2 quick recipes using the item
  - Storage tips to prolong freshness
  - Friendly sign-off message
- Powered by OpenRouter with Meta Llama 3.1 8B Instruct

### 3. **Multi-Item Recipe Combos**
- Automatically finds items expiring within 5 days
- Generates creative recipes combining multiple near-expiry ingredients
- Endpoint: `POST /api/expiry/multi-recipe`

### 4. **Automated Daily Checks**
- Scheduler runs every day at 8:00 AM
- Checks for items expiring within 3 days
- Generates advice/recipes automatically
- Logs alerts to console (can be extended to email/SMS)

### 5. **Color-Coded Urgency**
- **Red**: 0-1 days left (Critical)
- **Orange**: 2-3 days left (Urgent)
- **Yellow**: 4-7 days left (Soon)
- **Green**: 8+ days left (Fresh)

---

## Architecture

### Backend (FastAPI)

**File Structure:**
```
backend/
├── main.py                          # Main FastAPI app with all endpoints
├── utils/
│   └── predict_expiry.py            # Expiry prediction logic
├── services/
│   └── openrouter_expiry.py         # OpenRouter LLM integration
├── models/
│   └── food_item.py                 # Pydantic schemas
├── requirements.txt                 # Python dependencies
└── .env                             # Environment variables
```

**Key Dependencies:**
- `motor==3.3.2` - Async MongoDB driver
- `apscheduler==3.10.4` - Job scheduler for daily checks
- `openai==1.51.0` - OpenRouter client
- `fastapi==0.104.1` - Web framework

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expiry/items` | Add new grocery item |
| GET | `/api/expiry/items` | List all items with predictions |
| GET | `/api/expiry/items/{id}` | Get single item details |
| POST | `/api/expiry/items/{id}/advice` | Generate AI advice for item |
| POST | `/api/expiry/multi-recipe` | Generate recipes for near-expiry items |
| DELETE | `/api/expiry/items/{id}` | Delete item |

### Frontend (React + TypeScript)

**Components:**
- `ExpiryForm.tsx` - Add new grocery items
- `ExpiryList.tsx` - Display items with predictions
- `App.tsx` - Tab navigation between Recipe Generator and Expiry Tracker

---

## Prediction Algorithm

The expiry prediction works as follows:

1. **Input**: Purchase date, category, optional manufactured date
2. **Calculate Manufacturing Date**:
   - If not provided: `manufacturing_date = purchase_date - store_delay`
   - Example: Milk purchased Nov 21, store_delay=2 → manufactured Nov 19
3. **Calculate Predicted Expiry**:
   - `predicted_expiry = manufacturing_date + shelf_life`
   - Example: Manufactured Nov 19 + 7 days → expires Nov 26
4. **Calculate Safe Expiry** (with safety buffer):
   - `safety_days = shelf_life × safety_percent / 100`
   - `safe_expiry = predicted_expiry - safety_days`
   - Example: Nov 26 - 1.4 days → safe until Nov 24
5. **Calculate Days Left**:
   - `days_left = (safe_expiry - today) / 1 day`

---

## Setup Instructions

### Prerequisites
- **MongoDB** (local or Atlas):
  - Local: Install MongoDB Community Server
  - Cloud: Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- **Python 3.10+** (WSL2 for Windows users)
- **Node.js 18+**

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables** in `backend/.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   MONGODB_URI=mongodb://localhost:27017
   # Or for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/ChefBuddy_db
   ```

3. **Start FastAPI server:**
   ```bash
   # WSL (Linux):
   cd /mnt/c/Users/asus/ChefBuddy/ChefBuddy/backend
   python3 main.py

   # Windows PowerShell:
   wsl bash -c "cd /mnt/c/Users/asus/ChefBuddy/ChefBuddy/backend && python3 main.py"
   ```

   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Install Node dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Vite dev server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5174`

---

## Usage Guide

### Adding Items

1. Navigate to **Expiry Tracker** tab
2. Fill out the form:
   - **Item Name**: e.g., "Milk", "Tomatoes"
   - **Category**: Select from dropdown (Dairy, Vegetables, etc.)
   - **Purchase Date**: When you bought it (defaults to today)
   - **Quantity**: Number of items
   - **Notes** (optional): Any additional details
3. Click **Add to Pantry**

### Viewing Predictions

- Items appear in the list with color-coded urgency
- See purchase date, safe expiry date, and days remaining
- Delete items when consumed

### Getting Recipe Advice

1. Click **Get Recipes & Tips** on any item
2. AI generates:
   - Urgency message
   - 2 creative recipes
   - Storage tips
3. Modal displays the advice

### Multi-Item Recipes

- Backend automatically finds items expiring ≤5 days
- Call `POST /api/expiry/multi-recipe` to generate combined recipes
- (Future: Add button in UI to trigger this)

---

## Scheduler Details

**Daily Job Configuration:**
- **Schedule**: Every day at 8:00 AM
- **Action**: Checks all items for `days_left ≤ 3`
- **Output**: Console logs with advice (extend to email/SMS)

**For Testing:**
Change in `main.py`:
```python
# Original (daily at 8 AM):
scheduler.add_job(check_expiring_items, 'cron', hour=8, minute=0)

# Testing (every 5 minutes):
scheduler.add_job(check_expiring_items, 'interval', minutes=5)
```

---

## OpenRouter Integration

**Model**: `meta-llama/llama-3.1-8b-instruct`

**Prompt Template** (single item):
```
You are a helpful, friendly kitchen assistant. A user has the following grocery item:

- Item: {item_name}
- Category: {category}
- Estimated days left before safe expiry: {days_left} days

Produce a warm, human message suitable to show to the user. Include:
1) One-sentence urgency summary (e.g., "Use within 2 days")
2) Two short, quick recipes (title + 2–4 short steps each) that use the item.
3) One storage tip to prolong freshness (if possible).
4) A friendly sign-off.

Keep the tone loving, concise, and clear. Do not hallucinate dangerous food advice.
```

**API Call:**
```python
from services.openrouter_expiry import generate_advice_for_item

advice = await generate_advice_for_item("Milk", "dairy", 2)
print(advice)
```

---

## MongoDB Schema

**Collection**: `food_items`

**Document Structure:**
```json
{
  "_id": "ObjectId(...)",
  "name": "Milk",
  "category": "dairy",
  "purchaseDate": "2025-11-21T00:00:00",
  "quantity": 2,
  "notes": "Organic whole milk",
  "manufacturedDate": null,
  "createdAt": "2025-11-21T10:30:00"
}
```

---

## Production Considerations

### 1. **Email/SMS Notifications**
Replace console logs in `check_expiring_items()` with:
- **SendGrid** for email
- **Twilio** for SMS
- **Firebase Cloud Messaging** for push notifications

Example (SendGrid):
```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_expiry_alert(email, item_name, days_left, advice):
    message = Mail(
        from_email='alerts@ChefBuddy.com',
        to_emails=email,
        subject=f'🚨 {item_name} expires in {days_left} days!',
        html_content=f'<p>{advice}</p>'
    )
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    sg.send(message)
```

### 2. **User Authentication**
- Add user accounts (FastAPI + JWT)
- Each user has their own pantry
- Filter items by `user_id` in queries

### 3. **Barcode Scanning**
- Integrate barcode scanner library
- Query product database for manufactured/expiry dates
- Auto-fill item details

### 4. **Advanced Categories**
- Allow subcategories (e.g., Dairy → Milk, Cheese, Yogurt)
- Different shelf lives per subcategory
- Brand-specific data

### 5. **Analytics Dashboard**
- Track waste reduction over time
- Most common expiring items
- Recipe usage stats

---

## Testing

### Manual Testing

1. **Add test items:**
   ```bash
   curl -X POST http://localhost:8000/api/expiry/items \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Milk",
       "category": "dairy",
       "purchaseDate": "2025-11-21",
       "quantity": 2
     }'
   ```

2. **Get all items:**
   ```bash
   curl http://localhost:8000/api/expiry/items
   ```

3. **Generate advice:**
   ```bash
   curl -X POST http://localhost:8000/api/expiry/items/{item_id}/advice
   ```

### Automated Testing

Create `tests/test_expiry.py`:
```python
import pytest
from utils.predict_expiry import predict_expiry, calculate_days_left

def test_dairy_prediction():
    result = predict_expiry("dairy", "2025-11-21")
    assert result["category"] == "dairy"
    assert result["shelfLifeDays"] == 7
    
def test_days_left_calculation():
    from datetime import datetime, timedelta
    future = (datetime.now() + timedelta(days=5)).isoformat()
    days = calculate_days_left(future)
    assert days == 5
```

Run: `pytest tests/`

---

## Troubleshooting

### MongoDB Connection Errors
```
Error: Could not connect to MongoDB
```
**Solution:**
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check URI in `.env` is correct
- For Atlas: Whitelist your IP address

### Scheduler Not Running
```
Scheduler started - Daily expiry checks enabled
(but no logs appear)
```
**Solution:**
- Change to interval mode for testing: `minutes=1`
- Check server logs for errors
- Verify items exist in database

### Import Errors
```
ModuleNotFoundError: No module named 'motor'
```
**Solution:**
```bash
pip install motor==3.3.2 apscheduler==3.10.4
```

### OpenRouter API Errors
```
Error generating advice: Unauthorized
```
**Solution:**
- Check `OPENROUTER_API_KEY` in `.env`
- Verify key is active at [openrouter.ai](https://openrouter.ai)
- Check API credits balance

---

## Future Enhancements

1. **Smart Shopping List**
   - Track consumption patterns
   - Predict when to buy more
   - Generate shopping lists

2. **Recipe Ratings**
   - Let users rate AI-generated recipes
   - Improve prompts based on feedback

3. **Waste Tracking**
   - Log items that expired unused
   - Calculate waste reduction metrics
   - Gamify waste reduction goals

4. **Community Sharing**
   - Share recipes with friends
   - Local food donation alerts
   - Community recipe book

5. **Voice Integration**
   - "Hey ChefBuddy, what's expiring soon?"
   - Voice-activated recipe suggestions

---

## API Reference

### POST /api/expiry/items
**Request:**
```json
{
  "name": "Milk",
  "category": "dairy",
  "purchaseDate": "2025-11-21",
  "quantity": 2,
  "notes": "Organic",
  "manufacturedDate": null
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "_id": "67...",
    "name": "Milk",
    ...
  }
}
```

### GET /api/expiry/items
**Response:**
```json
[
  {
    "_id": "67...",
    "name": "Milk",
    "category": "dairy",
    "purchaseDate": "2025-11-21T00:00:00",
    "quantity": 2,
    "prediction": {
      "safeExpiry": "2025-11-26T00:00:00",
      "shelfLifeDays": 7,
      ...
    },
    "daysLeft": 5
  }
]
```

### POST /api/expiry/items/{id}/advice
**Response:**
```json
{
  "advice": "Use within 2 days! Try making...",
  "daysLeft": 2,
  "prediction": { ... }
}
```

---

## Credits

- **Backend**: FastAPI + Python
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: MongoDB with Motor (async)
- **AI**: OpenRouter (Meta Llama 3.1 8B Instruct)
- **Scheduler**: APScheduler

---

## License

MIT License - Free to use and modify.

---

**Built with ❤️ to reduce food waste and help families save money.**
