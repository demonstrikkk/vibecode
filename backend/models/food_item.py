"""
MongoDB models for food items.
Uses Motor for async MongoDB operations with FastAPI.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic models."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

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
        json_encoders = {ObjectId: str}

class FoodItemWithPrediction(FoodItem):
    """Schema for food item with expiry prediction."""
    prediction: Optional[dict] = None
    daysLeft: Optional[int] = None
