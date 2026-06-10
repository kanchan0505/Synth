// src/lib/api.ts
// The backend URL is read from the NEXT_PUBLIC_API_URL env variable.
// Never hardcode it — set it in .env.local for local dev, and in your
// deployment platform's env settings for production.

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export interface ResearchResult {
  report: string;
  feedback: string;
  sources: { title: string; url: string; snippet: string }[];
}

export async function runResearch(query: string): Promise<ResearchResult> {
  const res = await fetch(`${API_BASE}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error ${res.status}${text ? `: ${text}` : ""}`);
  }

  return res.json();
}
