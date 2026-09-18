import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

app.include_router(policies.router)
app.include_router(rules.router)
app.include_router(analyses.router)
app.include_router(students.router)
app.include_router(audit.router)
app.include_router(notifications.router)

frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
stitch_dir = Path(__file__).resolve().parent.parent / "stitch"

if (frontend_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="react_assets")

if stitch_dir.exists():
    app.mount("/static", StaticFiles(directory=str(stitch_dir)), name="static")


@app.get("/favicon.ico")
async def favicon():
    logo_file = (frontend_dist / "logo.png") if (frontend_dist / "logo.png").exists() else (stitch_dir / "logo.png")
    if logo_file.exists():
        return FileResponse(str(logo_file), media_type="image/png")
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.get("/logo.png")
async def logo_png():
    logo_file = (frontend_dist / "logo.png") if (frontend_dist / "logo.png").exists() else (stitch_dir / "logo.png")
    if logo_file.exists():
        return FileResponse(str(logo_file), media_type="image/png")
    raise HTTPException(status_code=404, detail="Logo not found")


@app.get("/")
async def root():
    react_index = frontend_dist / "index.html"
    if react_index.exists():
        return FileResponse(str(react_index))
    index_file = stitch_dir / "dashboard.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Welcome to Ripple Engine API."}


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
