#!/usr/bin/env python3
"""Test script to verify all imports work correctly."""

try:
    print("Testing imports...")
    
    # Test user models
    from models.user import UserCreate, UserLogin, UserResponse, Token, UserPreferences, UserInDB
    print("✓ User models imported successfully")
    
    # Test auth utilities
    from utils.auth import get_password_hash, verify_password, create_access_token, decode_access_token
    print("✓ Auth utilities imported successfully")
    
    # Test main imports
    from fastapi import FastAPI, HTTPException, Depends
    print("✓ FastAPI imported successfully")
    
    # Test password hashing
    test_password = "test123"
    hashed = get_password_hash(test_password)
    is_valid = verify_password(test_password, hashed)
    print(f"✓ Password hashing works: {is_valid}")
    
    # Test JWT token creation
    token = create_access_token(data={"sub": "test@example.com"})
    print(f"✓ JWT token created: {token[:20]}...")
    
    # Test token decoding
    email = decode_access_token(token)
    print(f"✓ JWT token decoded: {email}")
    
    print("\n✅ All imports and utilities working correctly!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
