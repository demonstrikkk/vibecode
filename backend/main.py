from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from contextlib import asynccontextmanager
import os
import json
import urllib.parse

# Load .env variables FIRST before any other imports that need env vars
load_dotenv()

# Check if running in serverless environment (Vercel)
IS_SERVERLESS = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None

# Import expiry prediction modules
from utils.predict_expiry import predict_expiry, calculate_days_left
from services.openrouter_expiry import generate_advice_for_item, generate_multi_item_recipes
from models.food_item import FoodItemCreate, FoodItem, FoodItemWithPrediction

# Import authentication modules
from models.user import UserCreate, UserLogin, UserResponse, Token, UserPreferences, UserInDB
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user_email

# In-memory storage for development (replace with MongoDB for production)
USE_MONGODB = os.getenv("USE_MONGODB", "false").lower() == "true"

# MongoDB setup - lazy initialization for serverless
mongo_client = None
db = None
items_collection = None
users_collection = None

# In-memory storage (for non-MongoDB mode)
food_items_db = {}
users_db = {}
item_counter = {"count": 0}

def get_mongo_client():
    """Lazy initialization of MongoDB client with proper error handling"""
    global mongo_client, db, items_collection, users_collection
    if USE_MONGODB and mongo_client is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        
        try:
            # Create client with proper timeout settings for serverless
            mongo_client = AsyncIOMotorClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,  # 5 seconds timeout
                connectTimeoutMS=10000,  # 10 seconds connection timeout
                socketTimeoutMS=10000,   # 10 seconds socket timeout
                maxPoolSize=1,           # Limit connections for serverless
            )
            db = mongo_client.ChefBuddy_db
            items_collection = db.food_items
            users_collection = db.users
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            # Fallback to in-memory mode if connection fails
            global USE_MONGODB
            USE_MONGODB = False
            return None
    return mongo_client

def get_collections():
    """Get MongoDB collections with lazy initialization"""
    if USE_MONGODB:
        get_mongo_client()
        return items_collection, users_collection
    return None, None

# Initialize on first request for serverless
if USE_MONGODB and not IS_SERVERLESS:
    get_mongo_client()

# Scheduler for daily expiry checks (only in non-serverless mode)
scheduler = None
if not IS_SERVERLESS:
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler()
    except ImportError:
        pass

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if scheduler:
        scheduler.add_job(check_expiring_items, 'cron', hour=8, minute=0)
        scheduler.start()
        print("✓ Scheduler started - Daily expiry checks enabled")
    print("✓ ChefBuddy Backend is ready!")
    yield
    # Shutdown
    if scheduler:
        scheduler.shutdown()
    if mongo_client:
        mongo_client.close()
    print("✓ Server shutdown complete")

# Create app with or without lifespan based on environment
if IS_SERVERLESS:
    app = FastAPI(title="ChefBuddy Recipe Generator API")
else:
    app = FastAPI(
        title="ChefBuddy Recipe Generator API",
        lifespan=lifespan
    )

# Enable CORS for frontend - Allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter client helper function
def get_openrouter_client():
    """Get OpenRouter client with API key from environment"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
    return OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )

# ----------------------------
#      REQUEST MODELS
# ----------------------------
class RecipePreferences(BaseModel):
    dietary_type: str
    cuisine_type: str
    food_category: str
    food_available: str
    like_eating: str
    difficulty: str

class RecipeQuery(BaseModel):
    query: str

class MultiRecipeRequest(BaseModel):
    item_ids: list[str]

# ----------------------------
#      RESPONSE MODEL
# ----------------------------
class RecipeResponse(BaseModel):
    recipe: dict


@app.get("/")
async def root():
    return {
        "message": "ChefBuddy Recipe Generator API is running!",
        "serverless": IS_SERVERLESS,
        "mongodb": USE_MONGODB,
        "env_vars": {
            "VERCEL": os.getenv("VERCEL", "not set"),
            "OPENROUTER_API_KEY": "set" if os.getenv("OPENROUTER_API_KEY") else "not set",
            "MONGODB_URI": "set" if os.getenv("MONGODB_URI") else "not set"
        }
    }


# ========================================
#    AUTHENTICATION ENDPOINTS
# ========================================

@app.post("/api/auth/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user."""
    try:
        # Get collections with lazy initialization
        items_coll, users_coll = get_collections()
        
        # Check if user already exists
        if USE_MONGODB:
            existing_user = await users_coll.find_one({"email": user_data.email})
        else:
            existing_user = users_db.get(user_data.email)
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user with hashed password
        hashed_password = get_password_hash(user_data.password)
        user_dict = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "full_name": user_data.full_name,
            "age": user_data.age,
            "location": user_data.location,
            "preferences": UserPreferences().model_dump(),
            "is_verified": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if USE_MONGODB:
            await users_coll.insert_one(user_dict)
        else:
            users_db[user_data.email] = user_dict
        
        # Create access token
        access_token = create_access_token(data={"sub": user_data.email})
        
        return {
            "success": True,
            "message": "User registered successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user_data.email,
                "full_name": user_data.full_name,
                "age": user_data.age,
                "location": user_data.location
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")


@app.post("/api/auth/login", response_model=dict)
async def login_user(credentials: UserLogin):
    """Login user and return JWT token."""
    try:
        # Get collections with lazy initialization
        items_coll, users_coll = get_collections()
        
        # Find user
        if USE_MONGODB:
            user = await users_coll.find_one({"email": credentials.email})
        else:
            user = users_db.get(credentials.email)
        
        if not user or not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": credentials.email})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user["email"],
                "full_name": user["full_name"],
                "age": user.get("age"),
                "location": user.get("location"),
                "preferences": user.get("preferences", {}),
                "is_verified": user.get("is_verified", False)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging in: {str(e)}")


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user(email: str = Depends(get_current_user_email)):
    """Get current user profile."""
    try:
        if USE_MONGODB:
            user = await users_collection.find_one({"email": email})
        else:
            user = users_db.get(email)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            email=user["email"],
            full_name=user["full_name"],
            age=user.get("age"),
            location=user.get("location"),
            preferences=UserPreferences(**user.get("preferences", {})),
            is_verified=user.get("is_verified", False)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")


@app.put("/api/auth/preferences")
async def update_user_preferences(
    preferences: UserPreferences,
    email: str = Depends(get_current_user_email)
):
    """Update user's dietary preferences."""
    try:
        preferences_dict = preferences.dict()
        
        if USE_MONGODB:
            result = await users_collection.update_one(
                {"email": email},
                {"$set": {"preferences": preferences_dict}}
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="User not found")
        else:
            if email not in users_db:
                raise HTTPException(status_code=404, detail="User not found")
            users_db[email]["preferences"] = preferences_dict
        
        return {
            "success": True,
            "message": "Preferences updated successfully",
            "preferences": preferences_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")


# ========================================
#    EXPIRY PREDICTOR ENDPOINTS
# ========================================

@app.post("/api/expiry/items", response_model=dict)
async def add_food_item(item: FoodItemCreate):
    """Add a new grocery item to track."""
    try:
        item_dict = item.model_dump()
        item_dict["createdAt"] = datetime.utcnow().isoformat()
        
        if USE_MONGODB:
            result = await items_collection.insert_one(item_dict)
            item_dict["_id"] = str(result.inserted_id)
        else:
            # In-memory storage
            item_counter["count"] += 1
            item_id = str(item_counter["count"])
            item_dict["_id"] = item_id
            food_items_db[item_id] = item_dict
        
        return {"success": True, "item": item_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding item: {str(e)}")


@app.get("/api/expiry/items", response_model=list)
async def get_all_items():
    """Get all grocery items with expiry predictions."""
    try:
        items = []
        
        if USE_MONGODB:
            cursor = items_collection.find().sort("createdAt", -1)
            async for item in cursor:
                item["_id"] = str(item["_id"])
                
                # Calculate expiry prediction
                prediction = predict_expiry(
                    item["category"], 
                    item["purchaseDate"],
                    datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                )
                
                days_left = calculate_days_left(prediction["safeExpiry"])
                
                items.append({
                    **item,
                    "prediction": prediction,
                    "daysLeft": days_left
                })
        else:
            # In-memory storage
            for item_id, item in sorted(food_items_db.items(), key=lambda x: x[1].get("createdAt", ""), reverse=True):
                # Calculate expiry prediction
                prediction = predict_expiry(
                    item["category"], 
                    item["purchaseDate"],
                    datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                )
                
                days_left = calculate_days_left(prediction["safeExpiry"])
                
                items.append({
                    **item,
                    "prediction": prediction,
                    "daysLeft": days_left
                })
        
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching items: {str(e)}")


@app.get("/api/expiry/items/{item_id}")
async def get_item_by_id(item_id: str):
    """Get a single item with prediction."""
    try:
        if USE_MONGODB:
            from bson import ObjectId
            item = await items_collection.find_one({"_id": ObjectId(item_id)})
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
            item["_id"] = str(item["_id"])
        else:
            # In-memory storage
            item = food_items_db.get(item_id)
            if not item:
                raise HTTPException(status_code=404, detail="Item not found")
        
        prediction = predict_expiry(
            item["category"], 
            item["purchaseDate"],
            datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
        )
        
        days_left = calculate_days_left(prediction["safeExpiry"])
        
        return {
            **item,
            "prediction": prediction,
            "daysLeft": days_left
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching item: {str(e)}")


@app.post("/api/expiry/items/{item_id}/advice")
async def generate_item_advice(item_id: str):
    """Generate LLM-powered advice and recipes for a specific item."""
    try:
        if USE_MONGODB:
            from bson import ObjectId
            item = await items_collection.find_one({"_id": ObjectId(item_id)})
        else:
            item = food_items_db.get(item_id)
            
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        prediction = predict_expiry(
            item["category"], 
            item["purchaseDate"],
            datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
        )
        
        days_left = calculate_days_left(prediction["safeExpiry"])
        
        # Generate advice using OpenRouter
        advice = await generate_advice_for_item(
            item["name"], 
            item["category"], 
            days_left
        )
        
        return {
            "advice": advice,
            "daysLeft": days_left,
            "prediction": prediction
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating advice: {str(e)}")


@app.post("/api/expiry/multi-recipe")
async def generate_multi_item_recipe(request: MultiRecipeRequest):
    """Generate a recipe combining selected near-expiry items."""
    try:
        items = []
        
        if USE_MONGODB:
            from bson import ObjectId
            for item_id in request.item_ids:
                item = await items_collection.find_one({"_id": ObjectId(item_id)})
                if item:
                    prediction = predict_expiry(
                        item["category"], 
                        item["purchaseDate"],
                        datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                    )
                    days_left = calculate_days_left(prediction["safeExpiry"])
                    items.append({
                        "name": item["name"],
                        "category": item["category"],
                        "days_left": days_left
                    })
        else:
            # In-memory storage
            for item_id in request.item_ids:
                if item_id in food_items_db:
                    item = food_items_db[item_id]
                    prediction = predict_expiry(
                        item["category"], 
                        item["purchaseDate"],
                        datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                    )
                    days_left = calculate_days_left(prediction["safeExpiry"])
                    items.append({
                        "name": item["name"],
                        "category": item["category"],
                        "days_left": days_left
                    })
        
        if not items:
            raise HTTPException(status_code=404, detail="No valid items found")
        
        # Generate recipe using selected items
        items_text = ", ".join([item["name"] for item in items])
        
        system_prompt = """
You are a creative chef helping reduce food waste. Return ONLY valid JSON following this structure:
{
  "title": "Recipe Name",
  "subtitle": "Using your expiring ingredients",
  "description": "A paragraph describing the dish",
  "servings": "4",
  "time": "30 minutes",
  "ingredients": [
    { "name": "ingredient name", "amount": "1 cup" }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "suggestions": [
    "Tip 1"
  ],
  "youtubeLinks": []
}

Rules:
- DO NOT include any text before or after the JSON.
- DO NOT return markdown code blocks.
- Prioritize using ALL the expiring ingredients provided.
- Include at least 5-8 ingredients and 4-6 steps.
"""

        user_prompt = f"""
Create a delicious recipe that uses these expiring ingredients: {items_text}

Make sure to incorporate all or most of these items in the recipe.
Return the recipe in the JSON format specified.
"""

        client = get_openrouter_client()
        response = client.chat.completions.create(
            model="x-ai/grok-4.1-fast:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.8,
        )

        raw_output = response.choices[0].message.content.strip()
        
        # Clean up markdown code blocks if present
        if raw_output.startswith("```"):
            lines = raw_output.split("\n")
            raw_output = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        
        # Parse JSON
        try:
            recipe_json = json.loads(raw_output)
        except json.JSONDecodeError:
            json_start = raw_output.find("{")
            json_end = raw_output.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                recipe_json = json.loads(raw_output[json_start:json_end])
            else:
                raise ValueError("Could not parse recipe JSON")

        # Add YouTube search links based on recipe title
        recipe_title = recipe_json.get("title", "recipe")
        search_query = urllib.parse.quote(f"{recipe_title} recipe tutorial")
        recipe_json["youtubeLinks"] = [
            f"https://www.youtube.com/results?search_query={search_query}"
        ]

        return {
            "recipe": recipe_json,
            "usedItems": items
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating multi-item recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")


@app.delete("/api/expiry/items/{item_id}")
async def delete_item(item_id: str):
    """Delete a food item."""
    try:
        if USE_MONGODB:
            from bson import ObjectId
            result = await items_collection.delete_one({"_id": ObjectId(item_id)})
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Item not found")
        else:
            # In-memory storage
            if item_id not in food_items_db:
                raise HTTPException(status_code=404, detail="Item not found")
            del food_items_db[item_id]
        
        return {"success": True, "message": "Item deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting item: {str(e)}")


# ========================================
#    RECIPE GENERATOR ENDPOINTS
# ========================================

@app.post("/api/generate-recipe")
async def generate_recipe_from_query(
    query_data: RecipeQuery,
    email: str = Depends(get_current_user_email)
):
    """
    Generate a recipe from a natural language query.
    Authenticated users get personalized recommendations based on their preferences.
    """
    try:
        # Get user's saved preferences
        if USE_MONGODB:
            user = await users_collection.find_one({"email": email})
        else:
            user = users_db.get(email)
        
        user_prefs = user.get("preferences", {}) if user else {}
        
        # Enhance prompt with user preferences
        dietary_context = ""
        if user_prefs.get("dietary_preferences"):
            dietary_context += f"\nUser follows: {', '.join(user_prefs['dietary_preferences'])}"
        if user_prefs.get("dietary_restrictions"):
            dietary_context += f"\nUser has restrictions: {', '.join(user_prefs['dietary_restrictions'])}"
        if user_prefs.get("health_goals"):
            dietary_context += f"\nUser's health goals: {', '.join(user_prefs['health_goals'])}"
        
        # STRICT JSON PROMPT
        system_prompt = """
You are a helpful chef assistant. Return ONLY valid JSON following EXACTLY this structure:
{
  "title": "Recipe Name",
  "subtitle": "A brief tagline",
  "description": "A paragraph describing the dish",
  "servings": "4",
  "time": "30 minutes",
  "ingredients": [
    { "name": "ingredient name", "amount": "1 cup" }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "suggestions": [
    "Tip 1",
    "Tip 2"
  ],
  "youtubeLinks": []
}

Rules:
- DO NOT include any text before or after the JSON.
- DO NOT return markdown code blocks.
- Fill every field with meaningful content.
- Include at least 5-8 ingredients and 4-6 steps.
"""

        user_prompt = f"""
Generate a recipe based on this request: {query_data.query}
{dietary_context}

Return a complete recipe in the JSON format specified.
"""

        client = get_openrouter_client()
        response = client.chat.completions.create(
            model="x-ai/grok-4.1-fast:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.8,
        )

        raw_output = response.choices[0].message.content.strip()
        
        # Clean up the response - remove markdown code blocks if present
        if raw_output.startswith("```"):
            lines = raw_output.split("\n")
            # Remove first line (```json) and last line (```)
            raw_output = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        
        # Parse JSON
        try:
            recipe_json = json.loads(raw_output)
        except json.JSONDecodeError:
            # Safety fallback - try to extract JSON
            json_start = raw_output.find("{")
            json_end = raw_output.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                recipe_json = json.loads(raw_output[json_start:json_end])
            else:
                raise ValueError("Could not parse recipe JSON from response")

        # Add YouTube search links based on recipe title
        import urllib.parse
        recipe_title = recipe_json.get("title", "recipe")
        search_query = urllib.parse.quote(f"{recipe_title} recipe tutorial")
        recipe_json["youtubeLinks"] = [
            f"https://www.youtube.com/results?search_query={search_query}"
        ]

        return {"recipe": recipe_json}

    except Exception as e:
        print(f"Error generating recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")


@app.post("/api/generate-recipe-structured", response_model=RecipeResponse)
async def generate_recipe_structured(
    preferences: RecipePreferences,
    email: str = Depends(get_current_user_email)
):
    """
    Generate a structured recipe JSON using OpenRouter.
    Authenticated users get personalized recommendations based on their preferences.
    """
    try:
        # Get user's saved preferences
        if USE_MONGODB:
            user = await users_collection.find_one({"email": email})
        else:
            user = users_db.get(email)
        
        user_prefs = user.get("preferences", {}) if user else {}
        
        # Enhance prompt with user preferences
        dietary_context = ""
        if user_prefs.get("dietary_preferences"):
            dietary_context += f"\nUser follows: {', '.join(user_prefs['dietary_preferences'])}"
        if user_prefs.get("dietary_restrictions"):
            dietary_context += f"\nUser has restrictions: {', '.join(user_prefs['dietary_restrictions'])}"
        if user_prefs.get("health_goals"):
            dietary_context += f"\nUser's health goals: {', '.join(user_prefs['health_goals'])}"
        
        # STRICT JSON PROMPT (Fixes UI issues)
        system_prompt = """
Return ONLY valid JSON following EXACTLY this structure:
{
  "title": "",
  "subtitle": "",
  "description": "",
  "servings": "",
  "time": "",
  "ingredients": [
    { "name": "", "amount": "" }
  ],
  "steps": [
    ""
  ],
  "suggestions": [
    ""
  ],
  "youtubeLinks": [
    ""
  ]
}

Rules:
- DO NOT include any text before or after the JSON.
- DO NOT return markdown.
- DO NOT return bullet points unless inside strings.
- Fill every field.
"""

        user_prompt = f"""
Generate a recipe based on these preferences:

Dietary Type: {preferences.dietary_type}
Cuisine Type: {preferences.cuisine_type}
Food Category: {preferences.food_category}
Difficulty: {preferences.difficulty}
Available Ingredients: {preferences.food_available}
User Likes Eating: {preferences.like_eating}
{dietary_context}

Fill all JSON fields meaningfully.
"""

        client = get_openrouter_client()
        response = client.chat.completions.create(
            model="x-ai/grok-4.1-fast:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=700,
            temperature=0.8,
        )

        raw_output = response.choices[0].message.content.strip()

        # ----------------------------
        # PARSE STRICT JSON
        # ----------------------------
        try:
            recipe_json = json.loads(raw_output)
        except json.JSONDecodeError:
            # Safety fallback - try to extract JSON
            json_start = raw_output.find("{")
            json_end = raw_output.rfind("}") + 1
            recipe_json = json.loads(raw_output[json_start:json_end])

        # Add YouTube search links based on recipe title
        recipe_title = recipe_json.get("title", "recipe")
        search_query = urllib.parse.quote(f"{recipe_title} recipe tutorial")
        recipe_json["youtubeLinks"] = [
            f"https://www.youtube.com/results?search_query={search_query}"
        ]

        return RecipeResponse(recipe=recipe_json)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")


# Optional: Public recipe generation endpoint (no auth required)
@app.post("/api/generate-recipe-public")
async def generate_recipe_public(query_data: RecipeQuery):
    """
    Generate a recipe without authentication (for testing/demo).
    """
    try:
        # STRICT JSON PROMPT
        system_prompt = """
You are a helpful chef assistant. Return ONLY valid JSON following EXACTLY this structure:
{
  "title": "Recipe Name",
  "subtitle": "A brief tagline",
  "description": "A paragraph describing the dish",
  "servings": "4",
  "time": "30 minutes",
  "ingredients": [
    { "name": "ingredient name", "amount": "1 cup" }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "suggestions": [
    "Tip 1",
    "Tip 2"
  ],
  "youtubeLinks": []
}

Rules:
- DO NOT include any text before or after the JSON.
- DO NOT return markdown code blocks.
- Fill every field with meaningful content.
- Include at least 5-8 ingredients and 4-6 steps.
"""

        user_prompt = f"""
Generate a recipe based on this request: {query_data.query}

Return a complete recipe in the JSON format specified.
"""

        client = get_openrouter_client()
        response = client.chat.completions.create(
            model="x-ai/grok-4.1-fast:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=1500,
            temperature=0.8,
        )

        raw_output = response.choices[0].message.content.strip()
        
        # Clean up the response - remove markdown code blocks if present
        if raw_output.startswith("```"):
            lines = raw_output.split("\n")
            raw_output = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

        # Parse JSON
        try:
            recipe_json = json.loads(raw_output)
        except json.JSONDecodeError:
            json_start = raw_output.find("{")
            json_end = raw_output.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                recipe_json = json.loads(raw_output[json_start:json_end])
            else:
                raise ValueError("Could not parse recipe JSON from response")

        # Add YouTube search links based on recipe title
        import urllib.parse
        recipe_title = recipe_json.get("title", "recipe")
        search_query = urllib.parse.quote(f"{recipe_title} recipe tutorial")
        recipe_json["youtubeLinks"] = [
            f"https://www.youtube.com/results?search_query={search_query}"
        ]

        return {"recipe": recipe_json}

    except Exception as e:
        print(f"Error generating recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")


# ========================================
#    SCHEDULER FOR DAILY EXPIRY CHECKS
# ========================================

async def check_expiring_items():
    """Daily job to check for items nearing expiry and generate advice."""
    print("Running daily expiry check...")
    try:
        if USE_MONGODB:
            cursor = items_collection.find()
            async for item in cursor:
                prediction = predict_expiry(
                    item["category"], 
                    item["purchaseDate"],
                    datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                )
                days_left = calculate_days_left(prediction["safeExpiry"])
                
                # Alert for items expiring within 3 days
                if days_left <= 3:
                    advice = await generate_advice_for_item(
                        item["name"], 
                        item["category"], 
                        days_left
                    )
                    
                    print(f"\n{'='*60}")
                    print(f"EXPIRY ALERT: {item['name']} ({days_left} days left)")
                    print(f"{'='*60}")
                    print(advice)
                    print(f"{'='*60}\n")
        else:
            # In-memory storage
            for item_id, item in food_items_db.items():
                prediction = predict_expiry(
                    item["category"], 
                    item["purchaseDate"],
                    datetime.fromisoformat(item["manufacturedDate"]) if item.get("manufacturedDate") else None
                )
                days_left = calculate_days_left(prediction["safeExpiry"])
                
                # Alert for items expiring within 3 days
                if days_left <= 3:
                    advice = await generate_advice_for_item(
                        item["name"], 
                        item["category"], 
                        days_left
                    )
                    
                    print(f"\n{'='*60}")
                    print(f"EXPIRY ALERT: {item['name']} ({days_left} days left)")
                    print(f"{'='*60}")
                    print(advice)
                    print(f"{'='*60}\n")
                    
                    # TODO: Send email/SMS/push notification here
                
    except Exception as e:
        print(f"Error in daily expiry check: {str(e)}")


# Start server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
