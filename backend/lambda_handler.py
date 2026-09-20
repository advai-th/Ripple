"""
AWS Lambda Handler for Ripple Policy Impact Engine API.
Adapts the FastAPI ASGI application to AWS API Gateway HTTP API / REST API events via Mangum.
"""

from mangum import Mangum
from backend.main import app

# Initialize Mangum ASGI handler
handler = Mangum(app, lifespan="off")
