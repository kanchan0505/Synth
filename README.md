# Synth — AI Research Agent Platform

A multi-agent AI research platform that generates deep research reports with autonomous agents for search, content extraction, writing, and critique.

## Overview

Synth orchestrates four specialized AI agents working in sequence:

1. **Search Agent** - Queries Tavily for recent, reliable sources
2. **Reader Agent** - Scrapes and extracts content from URLs using BeautifulSoup
3. **Writer Chain** - Synthesizes research into structured reports
4. **Critic Chain** - Reviews and scores reports with improvement suggestions

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI entry point
│   ├── agents.py        # Agent definitions (search, reader, writer, critic)
│   ├── tools.py         # Tools for web search and URL scraping
│   ├── pipeline.py      # Main orchestration pipeline
│   ├── requirements.txt # Python dependencies
│   └── .env             # Backend API keys (TAVILY_API_KEY, GROQ_API_KEY, API_BASE, ALLOWED_ORIGINS)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   └── page.tsx          # Root page — renders LandingPage or Workspace
    │   ├── components/
    │   │   ├── LandingPage.tsx   # Landing / hero screen
    │   │   ├── Workspace.tsx     # Main research workspace with agent graph
    │   │   └── AgentNode.tsx     # Individual agent status card
    │   └── lib/
    │       ├── api.ts            # API client (calls FastAPI backend)
    │       └── markdown.ts       # Markdown → HTML + score extraction helpers
    ├── package.json
    ├── tailwind.config.js
    ├── next.config.js
    └── .env                      # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## Tech Stack

**Backend**
- **FastAPI** - Backend web framework
- **LangChain** - Agent framework and chains
- **Groq API** - LLM inference
- **Tavily API** - Web search engine
- **BeautifulSoup** - HTML content extraction
- **Python 3.x** - Backend runtime

**Frontend**
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type-safe components
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - State and side-effect management

## Setup

### Backend

```bash
# From the project root
cd backend

# Create and activate virtual environment
uv venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### Frontend

```bash
cd frontend

# Install Node dependencies
npm install
```

## Configuration

### `backend/.env`
```env
TAVILY_API_KEY=your_tavily_key
GROQ_API_KEY=your_groq_key
API_BASE=http://127.0.0.1:8000
ALLOWED_ORIGINS=http://localhost:3000
```

### `frontend/.env`
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

> **Important:** `NEXT_PUBLIC_API_URL` must point to the FastAPI backend port (8000), not the Next.js dev server port (3000).

## Running the Application

### Terminal 1 — Start the backend
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Start the frontend
```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

## API Endpoints

- `POST /research` - Run the full research pipeline for a given query
- `GET /config` - Returns runtime config (API base URL)
- `GET /` - Health check

## Architecture

```
Next.js Frontend ←→ FastAPI (main.py) ←→ run_research_pipeline (pipeline.py)
                                                      ↓
                        ┌────────────────────────────────────────────────────┐
                        │  Agent Execution Layer (agents.py)                 │
                        │  ├─► build_search_agent() → web_search (tools.py) │
                        │  ├─► build_reader_agent() → scrape_url (tools.py) │
                        │  ├─► writer_chain (LLM)                           │
                        │  └─► critic_chain (LLM)                           │
                        └────────────────────────────────────────────────────┘
```

**Clean Separation:**
- **API Layer** (`main.py`) - HTTP endpoints and CORS middleware
- **Research Orchestration** (`pipeline.py`) - Research workflow coordination
- **Agent Execution** (`agents.py`) - Agent builders and LLM chains
- **Tools** (`tools.py`) - Web search and scraping implementations
- **Frontend** (`Workspace.tsx`) - Multi-agent UI with live activity log and progress graph

**Data Flow:**
1. User enters a query in the Next.js frontend
2. `lib/api.ts` POSTs the query to `POST /research` on the FastAPI backend
3. FastAPI calls `run_research_pipeline()` synchronously and returns the full result
4. Frontend animates agent states (Search → Reader → Writer → Critic) as the result arrives
5. Report, critic feedback, and sources are rendered in the Workspace UI

## Features

- Deep web research with source verification
- Multi-agent workflows with live agent graph
- Inline citations and source tracking
- Quality scoring (out of 10) with critic feedback
- Report export (plain text download) and clipboard copy
- Quick, Deep, and Report-only research modes
- Collapsible sidebar with research history

## Research Examples

- AI agent frameworks comparison
- Electric vehicle market trends
- LLM prompt engineering best practices
- Startup fundraising landscape
- Quantum computing applications