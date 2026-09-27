# Projects Overview

Karan has built 8 major AI/ML projects spanning GenAI, RAG, multi-agent systems, recommendation engines, and time-series forecasting. All projects were built for real enterprise clients or as rigorous research prototypes.

---

## RapidX: Multimodal Contract Assurance
**Client:** Mining industry (name confidential)
**Technologies:** GPT-4 Vision, GPT-4o-mini, PyMuPDF, Azure Search, Pydantic, LangChain, Python

Hybrid GenAI + Computer Vision system to automate audits of 50+ page supply chain contracts. The core innovation is a "Smart Routing" heuristic: text-heavy clauses go to RAG + GPT-4o-mini for semantic verification, while signature pages and stamps are routed exclusively to GPT-4 Vision — avoiding expensive vision inference on text that doesn't need it. Pydantic schemas enforce structured output. Real-time visual error overlays rendered in React. Impact: 40% reduction in review time, 5× reduction in API costs.

---

## Hybrid RAG Tax Advisory System
**Technologies:** LangChain, FAISS, SerpAPI, OpenAI, LangSmith, Streamlit, Python

Dual-path RAG system solving "knowledge cutoff" risk in volatile regulatory environments. Two retrieval paths: static "Foundational Truth" (official ATO guidelines indexed in FAISS) and "Dynamic Truth" (real-time web results via SerpAPI). LangChain conflict-resolution logic prioritises official sources when they conflict. Evaluation suite: Hit Rate@K, MRR, and LLM-as-a-Judge via LangSmith.

---

## Asset Maintenance Intelligence Agent
**Client:** Industrial enterprise (name confidential)
**Technologies:** LangChain, RAG, Medallion Architecture, SAP Integration, Stored Procedures, Python

End-to-end maintenance lifecycle automation replacing a 5-person manual planning bottleneck. Medallion data architecture (Bronze→Silver→Gold) unifies IoT sensor logs and SAP asset data. Condition-Based Monitoring via ISO 10816 vibration thresholds triggers a GenAI agent that queries SAP Bill of Materials and RAG-indexed OEM manuals to draft digital Job Cards. Impact: maintenance planning cycle cut from 3 days to 30 minutes.

---

## Streaming Platform Recommendation Engine
**Client:** Major streaming platform with 3.2M+ profiles (name confidential)
**Technologies:** ALS, Collaborative Filtering, Redshift, Kubeflow, AWS, Parquet, Python

Production-scale recommendation engine serving 3.2M+ user profiles. Implicit feedback confidence scores combine watch coverage, episode completion, and recency decay. Hybrid scoring: 70% personalised ALS collaborative filtering + 30% cluster-based popularity. Guaranteed 20 recommendations per profile across new/returning/top catalogue buckets. No-drop QA across 330 parquet shards. Weekly Kubeflow pipeline on AWS.

---

## Antipodes: Multi-Agent Financial System
**Technologies:** LangGraph, VADER, Pydantic, Backtesting, OpenAI, Streamlit, Python

Debate-style multi-agent system where specialised agents (valuation, momentum, sentiment, fundamental analysis) propose, critique, and reconcile trade ideas. Built on a LangGraph state machine with deterministic execution. Features leakage-proof as_of_date filtering, Pydantic-enforced schemas, and 90-day backtesting with Sharpe proxy. Rolling A/B experiments with LLM-powered performance reports.

---

## BNPL Re-engagement Engine
**Client:** Fintech / Buy Now Pay Later provider (name confidential)
**Technologies:** XGBoost, SVD, VADER, Survival Analysis, sklearn, Pandas, Python

Customer analytics platform reframing dormancy as a habit problem, not a credit problem — bureau scores are nearly identical across dormant vs engaged segments. Stack: XGBoost dormancy prediction (AUC 0.9923), Kaplan-Meier survival analysis for intervention timing, VADER sentiment diagnosis on transaction notes, SVD merchant recommender, CLV scoring with responsible lending gates, and a Next Best Action framework. Stratified A/B holdout design with projected $132K+/month base-case uplift.

---

## StreamFit: Conversation Intelligence
**Client:** Fitness/streaming service (name confidential)
**Technologies:** LangGraph, Pydantic, Azure, Databricks, Delta Lake, Streamlit, Python

LangGraph extraction pipeline for customer support conversations — a 6-node graph: loader → summarizer → extractor → validator → scorer → persister. Pydantic models mirror TARGET_SCHEMA. Deterministic quality scoring (no LLM in the scoring step). Production architecture: Azure Blob → Service Bus → Container Apps → Databricks Delta Lake (medallion) → Power BI. Demo cost: $0.12 for 24 interactions. Production cost: ~$280/month for 10K interactions.

---

## Autonomous Time-Series Forecasting Agent
**Technologies:** LangGraph, Prophet, LSTM / GRU, ARIMA, SARIMA, Pandas, Python

Autonomous ML orchestrator that cleans data, builds forecasts, evaluates MAPE, and iterates with human-readable plans. Compared ARIMA, SARIMA, GRU/LSTM, and Prophet across 3 real datasets. Prophet + lag/rolling regressors achieved 3.71% MAPE on financial data — a 37% improvement over base Prophet. LangGraph self-healing debugger captures Python tracebacks and rewrites code without human intervention.
