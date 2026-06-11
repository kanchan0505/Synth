#creating 4 agents - search,reader,writer and critcal
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from tools import web_search,scrape_url

import os
from dotenv import load_dotenv
load_dotenv()

#model setup
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    timeout=60,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

#creating agent--1st 
def build_search_agent():
    return create_react_agent(
        model=llm,
        tools=[web_search]
    )
#2nd agent
def build_reader_agent():
    return create_react_agent(
        model=llm,
        tools=[scrape_url]
    )

#creating 2 chains- writer and critic chain
#writer chain - using runnables/lce pipline

writer_prompt = ChatPromptTemplate.from_messages([ #a lists
("system", "You are an expert research writer. Write clear, structured and insightful reports. Use clean Markdown for formatting (e.g. ## headings, **bold text**, and bullet points)."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional. Please use standard Markdown formatting: use `##` for sections and sub-sections, `**` for bolding, and standard bullet points `-` (not mixed symbols) so it can be parsed correctly."""),
])

#invoking writer chain 
writer_chain= writer_prompt | llm | StrOutputParser() #a structured output we got by using strOutputParser

#critic_chain

critic_prompt= ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain= critic_prompt | llm | StrOutputParser()