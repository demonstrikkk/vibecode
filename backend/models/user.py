from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserPreferences(BaseModel):
    dietary_preferences: List[str] = Field(default_factory=list)  # Vegetarian, Vegan, etc.
    dietary_restrictions: List[str] = Field(default_factory=list)  # Nuts, Dairy, etc.
    health_goals: List[str] = Field(default_factory=list)  # Weight loss, etc.
    skill_level: Optional[str] = None  # Beginner, Intermediate, Advanced
    household_size: int = 1
    budget: Optional[str] = None  # Low, Medium, High
    cuisines: List[str] = Field(default_factory=list)  # Italian, Mexican, etc.

class UserProfile(BaseModel):
    full_name: str
    age: Optional[int] = None
    location: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    age: Optional[int] = None
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    email: EmailStr
    hashed_password: str
    full_name: str
    age: Optional[int] = None
    location: Optional[str] = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    email: str
    full_name: str
    age: Optional[int] = None
    location: Optional[str] = None
    preferences: UserPreferences
    is_verified: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
