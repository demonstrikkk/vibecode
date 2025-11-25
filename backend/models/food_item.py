"""
Food item models for in-memory storage.
No MongoDB dependencies - uses simple string IDs.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class FoodItemBase(BaseModel):
    """Base schema for food item."""
    name: str
    category: str
    purchaseDate: str
    quantity: Optional[int] = 1
    notes: Optional[str] = None
    manufacturedDate: Optional[str] = None

class FoodItemCreate(FoodItemBase):
    """Schema for creating a food item."""
    pass

class FoodItem(FoodItemBase):
    """Schema for food item with database ID."""
    id: Optional[str] = Field(alias="_id")
    createdAt: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class FoodItemWithPrediction(FoodItem):
    """Schema for food item with expiry prediction."""
    prediction: Optional[dict] = None
    daysLeft: Optional[int] = None
