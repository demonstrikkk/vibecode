#!/usr/bin/env python3
"""
Backend Status Check and Startup Script
Verifies all components before starting the server
"""

import sys
import os
from pathlib import Path

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def check_environment():
    """Check if required environment variables are set."""
    print_header("Checking Environment")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found!")
        print("   Please create .env with:")
        print("   - OPENROUTER_API_KEY")
        print("   - SECRET_KEY")
        print("   - USE_MONGODB")
        return False
    
    print("✓ .env file found")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = ["OPENROUTER_API_KEY", "SECRET_KEY"]
    missing = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing.append(var)
            print(f"❌ {var} not set")
        else:
            masked_value = value[:10] + "..." if len(value) > 10 else "***"
            print(f"✓ {var} = {masked_value}")
    
    if missing:
        print(f"\n❌ Missing environment variables: {', '.join(missing)}")
        return False
    
    return True

def check_dependencies():
    """Check if all required packages are installed."""
    print_header("Checking Dependencies")
    
    required_packages = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'pydantic': 'Pydantic',
        'openai': 'OpenAI',
        'motor': 'Motor',
        'jose': 'python-jose',
        'passlib': 'passlib',
    }
    
    missing = []
    
    for package, name in required_packages.items():
        try:
            __import__(package)
            print(f"✓ {name} installed")
        except ImportError:
            print(f"❌ {name} not installed")
            missing.append(name)
    
    if missing:
        print(f"\n❌ Missing packages: {', '.join(missing)}")
        print("   Install with: pip install -r requirements.txt")
        return False
    
    return True

def check_imports():
    """Check if all custom modules can be imported."""
    print_header("Checking Custom Modules")
    
    try:
        from models.user import UserCreate, UserLogin
        print("✓ models.user imported")
    except Exception as e:
        print(f"❌ models.user import failed: {e}")
        return False
    
    try:
        from utils.auth import get_password_hash, verify_password
        print("✓ utils.auth imported")
    except Exception as e:
        print(f"❌ utils.auth import failed: {e}")
        return False
    
    try:
        from main import app
        print("✓ main.app imported")
    except Exception as e:
        print(f"❌ main.app import failed: {e}")
        return False
    
    return True

def check_routes():
    """Verify all routes are registered."""
    print_header("Checking API Routes")
    
    try:
        from main import app
        
        routes = [route.path for route in app.routes]
        
        # Check authentication routes
        auth_routes = [r for r in routes if '/auth/' in r]
        print(f"✓ Authentication routes: {len(auth_routes)}")
        
        # Check recipe routes
        recipe_routes = [r for r in routes if 'recipe' in r.lower()]
        print(f"✓ Recipe routes: {len(recipe_routes)}")
        
        # Check expiry routes
        expiry_routes = [r for r in routes if 'expiry' in r]
        print(f"✓ Expiry routes: {len(expiry_routes)}")
        
        print(f"\n✓ Total routes: {len(routes)}")
        
        return True
    except Exception as e:
        print(f"❌ Route check failed: {e}")
        return False

def main():
    """Run all checks and start server if everything is OK."""
    print("\n" + "="*60)
    print("  🚀 ChefBuddy Backend - Pre-flight Check")
    print("="*60)
    
    checks = [
        ("Environment Variables", check_environment),
        ("Dependencies", check_dependencies),
        ("Custom Modules", check_imports),
        ("API Routes", check_routes),
    ]
    
    for name, check_func in checks:
        if not check_func():
            print(f"\n❌ {name} check failed!")
            print("   Please fix the issues above before starting the server.")
            sys.exit(1)
    
    print_header("✅ All Checks Passed!")
    print("🎉 Backend is ready to start!")
    print("\nStarting server on http://0.0.0.0:8000...")
    print("Press CTRL+C to stop\n")
    
    # Start the server
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
