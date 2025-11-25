"""
Expiry prediction logic for different food categories.
Calculates manufacturing date, predicted expiry, and safe expiry dates.
"""

from datetime import datetime, timedelta
from typing import Dict, Literal, Optional

Category = Literal[
    "dairy", "vegetables", "fruits", "meat", 
    "packaged", "spices", "bakery", "frozen"
]

class FoodConfig:
    def __init__(self, store_delay: int, shelf_life: int, safety_percent: int):
        self.store_delay = store_delay  # Days between manufacturing and purchase
        self.shelf_life = shelf_life    # Total shelf life in days
        self.safety_percent = safety_percent  # Safety buffer percentage

# Shelf life data for different food categories
FOOD_DATA: Dict[str, FoodConfig] = {
    "dairy": FoodConfig(store_delay=2, shelf_life=7, safety_percent=20),
    "vegetables": FoodConfig(store_delay=1, shelf_life=5, safety_percent=15),
    "fruits": FoodConfig(store_delay=2, shelf_life=10, safety_percent=15),
    "meat": FoodConfig(store_delay=1, shelf_life=3, safety_percent=20),
    "packaged": FoodConfig(store_delay=15, shelf_life=200, safety_percent=5),
    "spices": FoodConfig(store_delay=25, shelf_life=365, safety_percent=5),
    "bakery": FoodConfig(store_delay=0, shelf_life=3, safety_percent=20),
    "frozen": FoodConfig(store_delay=7, shelf_life=180, safety_percent=10),
}

def add_days(date: datetime, days: int) -> datetime:
    """Add days to a datetime object."""
    return date + timedelta(days=days)

def predict_expiry(
    category: str, 
    purchase_date: str | datetime, 
    override_manufactured: Optional[datetime] = None
) -> Dict:
    """
    Predict expiry dates for a food item.
    
    Args:
        category: Food category (dairy, vegetables, etc.)
        purchase_date: Date when item was purchased
        override_manufactured: Optional manufactured date if known
        
    Returns:
        Dictionary with prediction details including safe expiry date
    """
    # Normalize category to lowercase
    cat_lower = category.lower()
    config = FOOD_DATA.get(cat_lower, FOOD_DATA["packaged"])
    
    # Parse purchase date if string
    if isinstance(purchase_date, str):
        bought = datetime.fromisoformat(purchase_date.replace('Z', '+00:00'))
    else:
        bought = purchase_date
    
    # Calculate manufacturing date
    if override_manufactured:
        manufacturing_date = override_manufactured
    else:
        manufacturing_date = add_days(bought, -config.store_delay)
    
    # Calculate predicted expiry
    predicted_expiry = add_days(manufacturing_date, config.shelf_life)
    
    # Calculate safe expiry (with safety buffer)
    safety_days = max(1, int((config.shelf_life * config.safety_percent) / 100))
    safe_expiry = add_days(predicted_expiry, -safety_days)
    
    return {
        "category": cat_lower,
        "purchaseDate": bought.isoformat(),
        "manufacturingDate": manufacturing_date.isoformat(),
        "predictedExpiry": predicted_expiry.isoformat(),
        "safeExpiry": safe_expiry.isoformat(),
        "shelfLifeDays": config.shelf_life,
        "safetyDays": safety_days,
    }

def calculate_days_left(safe_expiry: str | datetime) -> int:
    """
    Calculate days remaining until safe expiry.
    
    Args:
        safe_expiry: Safe expiry date as string or datetime
        
    Returns:
        Number of days left (can be negative if expired)
    """
    if isinstance(safe_expiry, str):
        expiry_date = datetime.fromisoformat(safe_expiry.replace('Z', '+00:00'))
    else:
        expiry_date = safe_expiry
    
    delta = expiry_date - datetime.now()
    return max(0, int(delta.total_seconds() / (60 * 60 * 24)))
