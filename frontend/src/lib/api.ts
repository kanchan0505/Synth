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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const res = await fetch(`${API_BASE}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let errorMsg = text;
      try {
        const parsed = JSON.parse(text);
        errorMsg = parsed.message || parsed.error || text;
      } catch {}
      throw new Error(errorMsg || `Server error ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timed out (90s limit reached). Please verify backend status.");
    }
    throw error;
  }
}
