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

    try:
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
    except Exception as e:
        print(f"Search Agent failed: {e}")
        raise RuntimeError(f"Search Agent failed to gather information: {str(e)}")

    # ── STEP 2: SCRAPE — use Tavily sources directly, no agent ────────────────
    # The Groq/Llama search agent often answers from memory without calling the
    # web_search tool, so message history contains no raw URLs.
    # get_structured_sources() calls Tavily directly and always returns clean URLs.
    print("\n" + "=" * 50)
    print("STEP 2 - READER AGENT")
    print("=" * 50)

    try:
        tavily_sources = get_structured_sources(topic)
    except Exception as e:
        print(f"Tavily search failed: {e}")
        raise RuntimeError(f"Failed to fetch search sources: {str(e)}")

    SKIP_DOMAINS = ("youtube.com", "reddit.com", "twitter.com", "instagram.com")

    # Pick up to 5 scrapable URLs
    urls_to_scrape = []
    for source in tavily_sources:
        url = source["url"]
        if not any(domain in url for domain in SKIP_DOMAINS):
            urls_to_scrape.append(url)
            if len(urls_to_scrape) == 5:
                break

    if not urls_to_scrape:
        print("No scrapable URL found in Tavily results.")
        state["scraped_content"] = "No scrapable URL available."
    else:
        scraped_results = []
        for url in urls_to_scrape:
            print(f"Scraping URL: {url}")
            try:
                content = scrape_url.invoke(url)
                if content and not content.startswith("Could not scrape URL:"):
                    scraped_results.append(f"--- Source: {url} ---\n{content}")
                else:
                    print(f"Failed to scrape {url}: {content}")
            except Exception as scrape_err:
                print(f"Failed to scrape {url} due to exception: {scrape_err}")
        
        if scraped_results:
            state["scraped_content"] = "\n\n".join(scraped_results)
        else:
            state["scraped_content"] = "Failed to scrape any of the selected URLs."
            raise RuntimeError("Reader Agent failed to scrape any content from search results.")
        print(state["scraped_content"][:500] + "\n...[truncated]")

    # ── STEP 3: WRITER ────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("STEP 3 - WRITER")
    print("=" * 50)

    try:
        # Build a clean source list to pass to the writer so it can cite URLs
        source_list = "\n".join(
            [f"- {s['title']}: {s['url']}" for s in tavily_sources]
        )

        research_combined = f"""
SEARCH RESULTS:
{state['search_results']}

DETAILED SCRAPED CONTENT (from {', '.join(urls_to_scrape)}):
{state['scraped_content']}

VERIFIED SOURCE URLS:
{source_list}
"""

        state["report"] = writer_chain.invoke({
            "topic": topic,
            "research": research_combined
        })
        print(state["report"])
    except Exception as e:
        print(f"Writer Chain failed: {e}")
        raise RuntimeError(f"Writer Chain failed to generate report: {str(e)}")

    # ── STEP 4: CRITIC ────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print("STEP 4 - CRITIC")
    print("=" * 50)

    try:
        state["feedback"] = critic_chain.invoke({
            "report": state["report"]
        })
        print(state["feedback"])
    except Exception as e:
        print(f"Critic Chain failed: {e}")
        raise RuntimeError(f"Critic Chain failed to review report: {str(e)}")

    return {
        "report": state["report"],
        "feedback": state["feedback"],
        "sources": tavily_sources   # reuse already-fetched sources, no 2nd Tavily call
    }


if __name__ == "__main__":
    topic = input("Enter research topic: ")
    result = run_research_pipeline(topic)
    print(result)