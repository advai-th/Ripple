from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import policies, rules, analyses, students, audit, notifications

app = FastAPI(
    title="Ripple Policy Impact Engine API",
    description="AI-powered change-impact engine: LLM reasons; deterministic code validates.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(policies.router)
app.include_router(rules.router)
app.include_router(analyses.router)
app.include_router(students.router)
app.include_router(audit.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    return {
        "service": "Ripple Institutional Policy Impact Engine API",
        "status": "active",
        "version": "1.0.0",
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Ripple Core Engine",
        "version": "1.0.0",
        "mode": "Build It (Local)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
