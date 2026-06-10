# Synth — Next.js Frontend

The Next.js frontend for the Synth AI Research Agent Platform.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   ├── page.tsx          # Entry — switches between Landing & Workspace
│   └── globals.css       # All CSS variables + component styles
├── components/
│   ├── LandingPage.tsx   # Marketing landing page
│   ├── Workspace.tsx     # Research workspace with full state logic
│   └── AgentNode.tsx     # Reusable agent status node
└── lib/
    ├── api.ts            # fetch wrapper — reads NEXT_PUBLIC_API_URL
    └── markdown.ts       # Markdown → HTML + score extraction
```

## Setup

```bash
# Install dependencies
npm install

# Copy env file and set your backend URL
cp .env.local.example .env.local
# → edit .env.local and set NEXT_PUBLIC_API_URL

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable              | Required | Description                              |
| --------------------- | -------- | ---------------------------------------- |
| `NEXT_PUBLIC_API_URL` | ✅ Yes   | URL of your FastAPI backend (no trailing slash) |

### Local dev `.env.local`
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Production (Vercel / Netlify / Render)
Set `NEXT_PUBLIC_API_URL` to your deployed FastAPI URL in the deployment platform's environment settings UI.  
Example: `https://synth-api.onrender.com`

## FastAPI Backend `.env`

The backend (unchanged) still uses its own `.env`:

```env
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_BASE=http://127.0.0.1:8000
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

> **CORS note:** When deploying, add your production frontend URL to `ALLOWED_ORIGINS` in the backend `.env`.

## Build for Production

```bash
npm run build
npm start
```

## Deploy

**Vercel (recommended for Next.js):**
1. Push code to GitHub
2. Import repo in Vercel
3. Add `NEXT_PUBLIC_API_URL` in Vercel → Settings → Environment Variables
4. Deploy

**Netlify / Render static:**
```bash
npm run build
# Upload the .next/ folder or use the @netlify/plugin-nextjs adapter
```
