from main import app

# Vercel serverless handler
def handler(request, response):
    return app(request, response)

# For ASGI compatibility
application = app