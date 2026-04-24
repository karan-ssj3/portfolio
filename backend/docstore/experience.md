# Work Experience

## Data and AI Consultant — Deloitte (Australia)
**July 2025 – Present**

Leading strategic AI and data initiatives for enterprise clients across financial services and technology sectors. Translating complex technical solutions into actionable business value through client-facing consulting and project management.

### Key Projects

**RapidX Contract Compliance Bot**
Architected a hybrid system combining Generative AI and Computer Vision to automate audits of 50+ page supply chain contracts. Engineered a "Smart Routing" architecture using a Python-based heuristic processor to fan out tasks into parallel pipelines, utilising RAG and GPT-4o for clause verification while targeting high-value execution pages with GPT-4 Vision. Enforced strict structured outputs via Pydantic and JSON schemas to enable real-time visual error overlays. Integrated into a React-based client interface with live API responses.
- Impact: 40% reduction in review time, 5x reduction in API costs through intelligent model tiering.

**Asset Maintenance Intelligence Agent**
Engineered an end-to-end maintenance lifecycle automation system, replacing a 5-person manual planning bottleneck. Designed a Medallion data architecture (Bronze-Silver-Gold) using stored procedures to unify raw IoT sensor logs and SAP asset data. Developed a "Synthetic Gold" strategy to simulate ISO 10816 vibration thresholds, allowing parallel AI pipeline development. The GenAI agent triggers on deterministic alerts, querying SAP Bill of Materials and RAG-based safety protocols to draft structured digital Job Cards.
- Impact: Compressed the maintenance planning cycle from 3 days to 30 minutes.

**Recommendation System**
Architected a production-scale recommendation engine for 3.2M+ profiles using Alternating Least Squares (ALS) collaborative filtering. Fused sparse interaction matrices with a custom hybrid scoring model and SQL-based implicit feedback engineering (weighting recency and duration). Implemented strict business constraints and cold-start fallback routing. Validated performance using Precision@K, Recall@K, and NDCG.

---

## Casual Academic — Statistical Thinking for Data Science, UTS
**August 2025 – December 2025**

Led the "Statistical Thinking for Data Science" curriculum for 200+ students, facilitating workshops and technical consultations to translate complex concepts like probability and regression into practical, code-based applications. Mentored students through real-world project interpretation.

---

## Data Scientist and AI Engineer — Synogize (Data and AI Consulting Services)
**January 2025 – July 2025**

### Key Projects

**Autonomous ML Agent Framework**
Architected a closed-loop Autonomous ML Orchestrator using LangGraph to automate the "0-to-60" phase of data science delivery. Engineered a multi-agent state machine with specialised nodes for data profiling, plan generation, and sandboxed code execution. Key innovation: the Self-Healing Debugger, which captures Python tracebacks from the executor node to iteratively rewrite and fix hallucinated code without human intervention. Implements cyclic feedback loops for feature refinement and model evaluation.
- Reduced time-to-baseline from days to minutes.
- Projected to automate 2,500+ hours of manual data science work annually.

**Hybrid RAG System for Personal Tax Agent**
Architected a dual-path RAG system to mitigate "knowledge cutoff" risks in volatile regulatory environments. Engineered a routing layer that synthesises static "Foundational Truth" (official ATO guidelines in FAISS vector database) with "Dynamic Truth" (real-time legislative updates via SerpAPI). Implemented semantic chunking to preserve context of complex tax clauses. Used LangChain orchestration with strict conflict-resolution logic. Measured retrieval quality (Hit Rate@K, MRR, ANN Recall) and generation fidelity (Faithfulness, Context Utilisation) using LangSmith tracing and LLM-as-a-Judge scoring.
- Deployed as a full-stack Streamlit prototype.

**Data Engineering Infrastructure**
Built end-to-end ELT pipelines using Apache Airflow and dbt Cloud on Google Cloud Platform. Implemented Medallion architecture with star schema design and SCD2 for historical tracking. Integrated data visualisation via business intelligence tools.
