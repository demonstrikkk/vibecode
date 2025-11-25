from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional
import os
import json
import urllib.parse

# Load .env variables FIRST
load_dotenv()

# Import expiry prediction modules
from utils.predict_expiry import predict_expiry, calculate_days_left
from services.openrouter_expiry import generate_advice_for_item
from models.food_item import FoodItemCreate, FoodItem, FoodItemWithPrediction

# Import user models for preferences
from models.user import UserPreferences

# In-memory storage only (MongoDB completely removed)
food_items_db = {}
item_counter = {"count": 0}

# Create FastAPI app
app = FastAPI(title="ChefBuddy Recipe Generator API")

# Enable CORS for frontend
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
        "storage_mode": "in-memory",
        "note": "All data is stored in-memory and will be lost on server restart",
        "openrouter_api_key_configured": bool(os.getenv("OPENROUTER_API_KEY"))
    }

@app.get("/api/debug/storage")
async def test_storage():
    """Check storage mode and current data"""
    return {
        "storage_mode": "in-memory",
        "food_items_count": len(food_items_db),
        "note": "Using in-memory storage - data persists only during server session"
    }


# ========================================
#    PREFERENCES ENDPOINT (No Auth)
# ========================================

@app.put("/api/auth/preferences")
async def update_user_preferences(preferences: UserPreferences):
    """Update user's dietary preferences (client-side only, returns echo)."""
    return {
        "success": True,
        "message": "Preferences acknowledged",
        "preferences": preferences.model_dump()
    }


# ========================================
#    EXPIRY PREDICTOR ENDPOINTS
# ========================================

@app.post("/api/expiry/items")
async def add_food_item(item: FoodItemCreate):
    """Add a new grocery item to track."""
    try:
        item_dict = item.model_dump()
        item_dict["createdAt"] = datetime.utcnow().isoformat()
        
        # In-memory storage
        item_counter["count"] += 1
        item_id = str(item_counter["count"])
        item_dict["id"] = item_id
        food_items_db[item_id] = item_dict
        
        return {"success": True, "item": item_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding item: {str(e)}")


@app.get("/api/expiry/items")
async def get_all_items():
    """Get all grocery items with expiry predictions."""
    try:
        items = []
        
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
        
        # In-memory storage only
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
        
        system_prompt = """You are a creative chef helping reduce food waste. Return ONLY valid JSON following this structure:
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
- Include at least 5-8 ingredients and 4-6 steps."""

        user_prompt = f"""Create a delicious recipe that uses these expiring ingredients: {items_text}

Make sure to incorporate all or most of these items in the recipe.
Return the recipe in the JSON format specified."""

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
async def generate_recipe_from_query(request_data: dict):
    """
    Generate a recipe from preferences or query.
    Accepts either: {query: str, preferences?: {...}} OR just preferences object
    """
    try:
        # Check if this is a direct preferences object or query format
        if "dietary_type" in request_data:
            # Direct preferences format from Recipes.jsx
            preferences = request_data
            query_text = f"Generate a recipe for {preferences.get('food_category', 'main course')}"
        else:
            # Query format with optional preferences
            query_text = request_data.get("query", "Generate a healthy recipe")
            preferences = request_data.get("preferences", {})
        
        # Use provided preferences or empty defaults
        dietary_context = ""
        if preferences:
            if preferences.get("dietary_type") and preferences.get("dietary_type") != "None":
                dietary_context += f"\nDietary preference: {preferences['dietary_type']}"
            if preferences.get("cuisine_type") and preferences.get("cuisine_type") != "None":
                dietary_context += f"\nCuisine type: {preferences['cuisine_type']}"
            if preferences.get("food_category") and preferences.get("food_category") != "None":
                dietary_context += f"\nFood category: {preferences['food_category']}"
            if preferences.get("difficulty") and preferences.get("difficulty") != "None":
                dietary_context += f"\nDifficulty level: {preferences['difficulty']}"
        
        # STRICT JSON PROMPT
        system_prompt = """You are a helpful chef assistant. Return ONLY valid JSON following EXACTLY this structure:
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
- Include at least 5-8 ingredients and 4-6 steps."""

        user_prompt = f"""Generate a recipe based on this request: {query_text}
{dietary_context}

Return a complete recipe in the JSON format specified."""

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
async def generate_recipe_structured(preferences: RecipePreferences):
    """
    Generate a structured recipe JSON using OpenRouter.
    Accepts user preferences directly in the request for personalized recommendations.
    """
    try:
        # Build dietary context from provided preferences
        dietary_context = ""
        if preferences.dietary_type and preferences.dietary_type != "None":
            dietary_context += f"\nDietary preference: {preferences.dietary_type}"
        if preferences.cuisine_type and preferences.cuisine_type != "None":
            dietary_context += f"\nCuisine type: {preferences.cuisine_type}"
        if preferences.food_category and preferences.food_category != "None":
            dietary_context += f"\nFood category: {preferences.food_category}"
        if preferences.difficulty and preferences.difficulty != "None":
            dietary_context += f"\nDifficulty level: {preferences.difficulty}"
        
        # STRICT JSON PROMPT
        system_prompt = """Return ONLY valid JSON following EXACTLY this structure:
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
  "youtubeLinks": []
}

Rules:
- DO NOT include any text before or after the JSON.
- DO NOT return markdown.
- Fill every field with meaningful content."""

        user_prompt = f"""Generate a recipe based on these preferences:

Dietary Type: {preferences.dietary_type}
Cuisine Type: {preferences.cuisine_type}
Food Category: {preferences.food_category}
Difficulty: {preferences.difficulty}
Available Ingredients: {preferences.food_available}
User Likes Eating: {preferences.like_eating}
{dietary_context}

Fill all JSON fields meaningfully."""

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
            # Safety fallback - try to extract JSON
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

        return RecipeResponse(recipe=recipe_json)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recipe: {str(e)}")


@app.post("/api/generate-recipe-public")
async def generate_recipe_public(query_data: RecipeQuery):
    """Generate a recipe without authentication (for testing/demo)."""
    try:
        # STRICT JSON PROMPT
        system_prompt = """You are a helpful chef assistant. Return ONLY valid JSON following EXACTLY this structure:
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
- Include at least 5-8 ingredients and 4-6 steps."""

        user_prompt = f"""Generate a recipe based on this request: {query_data.query}

Return a complete recipe in the JSON format specified."""

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
#    DAILY EXPIRY CHECK (In-Memory)
# ========================================

async def check_expiring_items():
    """Daily job to check for items nearing expiry and generate advice."""
    print("Running daily expiry check...")
    try:
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
    except Exception as e:
        print(f"Error in daily expiry check: {str(e)}")


# Start server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
