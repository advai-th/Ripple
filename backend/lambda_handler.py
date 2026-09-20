"""
AWS Lambda Handler for Ripple Policy Impact Engine API.
Adapts the FastAPI ASGI application to AWS API Gateway HTTP API / REST API events via Mangum.
"""

from mangum import Mangum
from backend.main import app

# api_gateway_base_path strips the stage prefix (/prod) injected by API Gateway
# so FastAPI receives clean paths e.g. /api/health instead of /prod/api/health
handler = Mangum(app, lifespan="off", api_gateway_base_path="/prod")
