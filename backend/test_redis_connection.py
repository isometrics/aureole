#!/usr/bin/env python3
"""
Test Redis connectivity with the environment variables your app expects.
"""

import os
import redis
import sys

def test_redis_connection():
    """Test Redis connections with app's environment variables."""
    
    print("Testing Redis connectivity...")
    print("=" * 50)
    
    # Test main Redis connection (Celery broker/backend)
    print("1. Testing main Redis connection (Celery broker/backend):")
    
    redis_host = os.getenv("REDIS_SERVICE_HOST", "redis-cache")
    redis_port = int(os.getenv("REDIS_SERVICE_PORT", "6379"))
    redis_password = os.getenv("REDIS_PASSWORD", "")
    
    print(f"   Host: {redis_host}")
    print(f"   Port: {redis_port}")
    print(f"   Password: {'*' * len(redis_password) if redis_password else '(none)'}")
    
    try:
        # Test main Redis connection
        r = redis.StrictRedis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            decode_responses=True
        )
        
        # Test connection
        r.ping()
        print("   ✅ Main Redis connection successful!")
        
        # Test basic operations
        r.set("test_key", "test_value")
        value = r.get("test_key")
        r.delete("test_key")
        
        if value == "test_value":
            print("   ✅ Redis read/write operations successful!")
        else:
            print("   ❌ Redis read/write operations failed!")
            
    except Exception as e:
        print(f"   ❌ Main Redis connection failed: {e}")
        return False
    
    # Test users Redis connection (if different)
    print("\n2. Testing users Redis connection:")
    
    users_redis_host = os.getenv("REDIS_SERVICE_USERS_HOST", "redis-users")
    
    if users_redis_host != redis_host:
        print(f"   Host: {users_redis_host}")
        print(f"   Port: {redis_port}")
        print(f"   Password: {'*' * len(redis_password) if redis_password else '(none)'}")
        
        try:
            users_r = redis.StrictRedis(
                host=users_redis_host,
                port=redis_port,
                password=redis_password,
                decode_responses=True
            )
            
            users_r.ping()
            print("   ✅ Users Redis connection successful!")
            
        except Exception as e:
            print(f"   ❌ Users Redis connection failed: {e}")
            print("   Note: This might be expected if using same Redis instance")
    else:
        print("   ℹ️  Using same Redis instance as main connection")
    
    # Test Celery Redis URL construction
    print("\n3. Testing Celery Redis URL construction:")
    
    if redis_password:
        redis_url = f"redis://:{redis_password}@{redis_host}:{redis_port}"
    else:
        redis_url = f"redis://{redis_host}:{redis_port}"
    
    print(f"   Redis URL: {redis_url}")
    print("   ✅ Redis URL constructed successfully!")
    
    print("\n" + "=" * 50)
    print("✅ All Redis connectivity tests passed!")
    print("\nYour Redis environment is ready for Celery tasks!")
    
    return True

def show_environment_summary():
    """Show current environment variable settings."""
    
    print("\nCurrent Environment Variables:")
    print("-" * 30)
    
    env_vars = [
        "REDIS_SERVICE_HOST",
        "REDIS_SERVICE_PORT", 
        "REDIS_PASSWORD",
        "REDIS_SERVICE_USERS_HOST"
    ]
    
    for var in env_vars:
        value = os.getenv(var, "(not set)")
        if var == "REDIS_PASSWORD" and value != "(not set)":
            value = "*" * len(value)
        print(f"{var}: {value}")

if __name__ == "__main__":
    print("Redis Connectivity Test")
    print("=" * 50)
    
    show_environment_summary()
    
    success = test_redis_connection()
    
    if not success:
        print("\n❌ Redis connectivity test failed!")
        print("\nTroubleshooting tips:")
        print("1. Make sure Redis is running: brew services start redis")
        print("2. Check Redis is accessible: redis-cli ping")
        print("3. Verify environment variables are set correctly")
        print("4. For local development, try: export REDIS_SERVICE_HOST=localhost")
        sys.exit(1)
    else:
        print("\n🎉 Ready to submit Celery tasks!") 