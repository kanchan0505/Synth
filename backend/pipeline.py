from agents import (
    build_reader_agent,
    build_search_agent,
    writer_chain,
    critic_chain
)

from tools import get_structured_sources, scrape_url
import re


def run_research_pipeline(topic: str) -> dict:

    state = {}

    # ── STEP 1: SEARCH AGENT ──────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("STEP 1 - SEARCH AGENT")
    print("=" * 50)

    search_agent = build_search_agent()

    search_result = search_agent.invoke(
        {
            "messages": [
                ("user", f"Find recent, reliable and detailed information about: {topic}")
            ]
        },
        config={"recursion_limit": 10}
    )

    state["search_results"] = search_result["messages"][-1].content
    print(state["search_results"])

    # ── STEP 2: SCRAPE — use Tavily sources directly, no agent ────────────────
    # The Groq/Llama search agent often answers from memory without calling the
    # web_search tool, so message history contains no raw URLs.
    # get_structured_sources() calls Tavily directly and always returns clean URLs.
    print("\n" + "=" * 50)
    print("STEP 2 - READER AGENT")
    print("=" * 50)

    SKIP_DOMAINS = ("youtube.com", "reddit.com", "twitter.com", "instagram.com")

    tavily_sources = get_structured_sources(topic)

    # Pick the first scrapable URL (skip video/social sites)
    url_to_scrape = None
    for source in tavily_sources:
        url = source["url"]
        if not any(domain in url for domain in SKIP_DOMAINS):
            url_to_scrape = url
            break

    if not url_to_scrape:
        print("No scrapable URL found in Tavily results.")
        state["scraped_content"] = "No scrapable URL available."
    else:
        print(f"Scraping URL: {url_to_scrape}")
        # Call scrape_url directly — no agent needed, avoids Llama looping
        state["scraped_content"] = scrape_url.invoke(url_to_scrape)
        print(state["scraped_content"][:500] + "\n...[truncated]")

    # ── STEP 3: WRITER ────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("STEP 3 - WRITER")
    print("=" * 50)

    # Build a clean source list to pass to the writer so it can cite URLs
    source_list = "\n".join(
        [f"- {s['title']}: {s['url']}" for s in tavily_sources]
    )

    research_combined = f"""
SEARCH RESULTS:
{state['search_results']}

DETAILED SCRAPED CONTENT (from {url_to_scrape}):
{state['scraped_content']}

VERIFIED SOURCE URLS:
{source_list}
"""

    state["report"] = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    print(state["report"])

    # ── STEP 4: CRITIC ────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("STEP 4 - CRITIC")
    print("=" * 50)

    state["feedback"] = critic_chain.invoke({
        "report": state["report"]
    })

    print(state["feedback"])

    return {
        "report": state["report"],
        "feedback": state["feedback"],
        "sources": tavily_sources   # reuse already-fetched sources, no 2nd Tavily call
    }


if __name__ == "__main__":
    topic = input("Enter research topic: ")
    result = run_research_pipeline(topic)
    print(result)