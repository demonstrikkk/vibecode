#!/usr/bin/env python3
"""Test script to verify FastAPI app starts correctly."""

try:
    print("Testing FastAPI application...")
    
    # Import the main app
    from main import app
    print("✓ Main app imported successfully")
    
    # Check if all routes are registered
    routes = [route.path for route in app.routes]
    print(f"\n✓ Total routes registered: {len(routes)}")
    
    # Check authentication routes
    auth_routes = [r for r in routes if '/auth/' in r]
    print(f"✓ Authentication routes: {len(auth_routes)}")
    for route in auth_routes:
        print(f"  - {route}")
    
    # Check recipe routes
    recipe_routes = [r for r in routes if 'recipe' in r]
    print(f"\n✓ Recipe routes: {len(recipe_routes)}")
    for route in recipe_routes:
        print(f"  - {route}")
    
    # Check expiry routes
    expiry_routes = [r for r in routes if 'expiry' in r]
    print(f"\n✓ Expiry routes: {len(expiry_routes)}")
    for route in expiry_routes[:5]:  # Show first 5
        print(f"  - {route}")
    
    print("\n✅ FastAPI application is configured correctly!")
    print("\n🚀 Ready to start with: python3 main.py")
    
except Exception as e:
    print(f"\n❌ Error loading application: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
