from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

from pipeline import run_research_pipeline

app = FastAPI(title="Synth Research API")

# Read allowed origins from env; default to wildcard for local dev
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    query: str


@app.get("/config")
def get_config():
    api_base = os.getenv("API_BASE")

    if not api_base:
        return JSONResponse(
            status_code=500,
            content={"error": "API_BASE environment variable not configured"}
        )

    return JSONResponse({
        "api_base": api_base
    })


@app.post("/research")
def research(req: ResearchRequest):
    return run_research_pipeline(req.query)


@app.get("/")
def root():
    return {"status": "running"}