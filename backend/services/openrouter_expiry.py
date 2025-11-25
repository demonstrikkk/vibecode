"""
OpenRouter service for generating expiry advice and recipes.
Uses LLM to provide friendly suggestions for near-expiry items.
"""

import os
from openai import OpenAI

# Initialize OpenRouter client - API key is loaded from .env via main.py
API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE", "https://openrouter.ai/api/v1")
MODEL = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4.1-fast:free")

def get_openrouter_client():
    """Get OpenRouter client with current API key"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set in environment")
    return OpenAI(
        api_key=api_key,
        base_url=BASE_URL
    )

async def generate_advice_for_item(item_name: str, category: str, days_left: int) -> str:
    """
    Generate friendly advice and recipes for items nearing expiry.
    
    Args:
        item_name: Name of the food item
        category: Food category
        days_left: Days until safe expiry
        
    Returns:
        Human-friendly message with urgency, recipes, storage tips
    """
    prompt = f"""
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
Format your response in a structured way with clear sections.
"""

    try:
        client = get_openrouter_client()
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=450,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating advice: {str(e)}"

async def generate_multi_item_recipes(items: list) -> str:
    """
    Generate recipes combining multiple near-expiry items.
    
    Args:
        items: List of items with name, category, days_left
        
    Returns:
        Creative recipes using multiple ingredients
    """
    items_text = "\n".join([
        f"- {item['name']} ({item['category']}, {item['days_left']} days left)"
        for item in items
    ])
    
    prompt = f"""
You are a creative chef helping reduce food waste. A user has these groceries nearing expiry:

{items_text}

Create 2 delicious recipes that use as many of these items as possible:
1) Recipe 1: Quick & easy (15-20 minutes)
2) Recipe 2: More elaborate but rewarding (30-40 minutes)

For each recipe include:
- Creative title
- Ingredients list (highlighting which items from above are used)
- 5-7 clear cooking steps
- Serving suggestion

Be creative but practical. Focus on flavor combinations that work well together.
"""

    try:
        client = get_openrouter_client()
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.8
        )
        
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating recipes: {str(e)}"
