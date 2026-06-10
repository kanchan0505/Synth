from langchain.tools import tool #a decorator
import requests #online web se scrapping krnie so have to use requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os 
from dotenv import load_dotenv
from rich import print #just for printing properly on. terminal
load_dotenv()

#TOOL-1------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#creating very first tool - tavily api key(fetching data)

#firsy have to load tavily client
tavily= TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

#a function for web search , going to get a qyery of string 
@tool #used a tool decorator
def web_search(query :str)->str:
 """Search the web for recent and reliable information on a topic and after that returns title , urls and snippets ."""
#wrote a docstring for ai 
 results= tavily.search(query=query,max_results=5) #5 results we will get , cause if not mentioned our tokens will be rapidly used
#query=query: we will get a query 
#return results -- just for knowledge purpuses


 out=[]
 for r in results['results']: #we are accessing a key(result ) from a dictionary thats why we wrote this line results["resu;ts"]
  out.append( #results- [results- {lists1{},lists2{}.... }]
   f"Title:{r['title']}\nURL:{r['url']}\nSnippet:{r['content'][:300]}\n"
  )
  
 return "\n---\n".join(out)

#print(web_search.invoke("what are the recent nes of war?"))

#print(web_search.invoke("what are the recent nes of war?"))#invoke the decorator for just testing purpose 
 #results ---
'''{  
  this is a dictionary and in the result - it contains a lists
    'query': 'what are the recent nes of war?',
    'follow_up_questions': None,
    'answer': None,
    'images': [],
    'results': [ 
        { 
            'url': 'https://www.scmp.com/topics/war-and-conflict',
            'title': 'War and conflict: Latest News and Updates',
            'content': "Ukraine drones target St Petersburg as 'Russia's 
Davos' opens. Black smoke rises over major fuel terminal as city hosts 
Vladimir Putin's global economic summit.",
            'score': 0.19599423,
            'raw_content': None
        },
        {
            'url': 'https://www.war.gov/news',
            'title': 'News | U.S. Department of War',
            'content': "104th Fighter Wing Strengthens Regional Medical 
Readiness With Multiday Emergency Decontamination Course. The Massachusetts 
National Guard's 104th Fighter",
            'score': 0.08315053,
            'raw_content': None
        },}'''




#Tool-2------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#beautiful scoop for scrapping the data from these urls 


@tool
def scrape_url(url: str) -> str: #we are gettings urls (string for multiple urls)
    """Scrape and return clean text content from a given URL for deeper reading.""" #docstring
    try: #if i hit an URL AND due to reasons it didnt hit so we have to apply try and catch block ---errror handling 
        resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"}) #timeout-8 sec : open it for 8 sec ifff no response then close itx ---HEADERS: should look like a real user because we are stelling data from a website/url 
        #saving the response we got from bs -  resp =

        soup = BeautifulSoup(resp.text, "html.parser") #resp.text{RAW HTML} ; contains everything: headings, para , links , ETC ETC 
         #removing- "script", "style", "nav", "footer" we dont need this so decomposing these 
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        return soup.get_text(separator=" ", strip=True)[:3000] #only getting 3k words :3000
    except Exception as e:
        return f"Could not scrape URL: {str(e)}"
    
#testing one url    
#print(scrape_url.invoke("https://www.thehindu.com/sport/cricket/red-ball-cricket-is-pinnacle-of-cricket-meant-everything-to-me-manav-suthar/article71079467.ece")    )


def get_structured_sources(query: str):

    results = tavily.search(
        query=query,
        max_results=5
    )

    return [
        {
            "title": r["title"],
            "url": r["url"],
            "snippet": r["content"][:300]
        }
        for r in results["results"]
    ]