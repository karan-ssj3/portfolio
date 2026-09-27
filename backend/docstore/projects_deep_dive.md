# Project Deep Dives — Karan Bhutani

> This file contains full technical narratives, architecture details, business context, STAR stories, trade-off reasoning, and interview Q&A for each project. Use it to answer detailed questions about how things were built and why.

---

# Project 1: RapidX — Multimodal Contract Assurance Agent

## Executive Summary
RapidX was a Multimodal Contract Assurance Agent built for a major mining client. The system reviewed supply chain contracts where compliance depended on both textual and visual evidence. It combined text-based RAG over contract rules with computer vision verification over execution pages.

The key engineering idea was a Smart Routing Architecture. Instead of sending every page to an expensive vision model, a lightweight Python pre-processor identified high-value pages. Standard text pages went through a cheaper RAG pipeline. Execution pages containing signatures, witness blocks, and physical stamps were routed to vision analysis.

## Business Problem
The client's engineering teams were manually reviewing thousands of supply chain contracts. The review was slow, inconsistent, and high-risk because compliance often depended on visual signals:
- Whether a coloured Site Access stamp was present
- Whether a signature was placed inside the correct execution box
- Whether a witness signature appeared in the correct physical region
- Whether handwritten marks, stamps, or seals existed at all

Impact: 40% reduction in review time, 5x reduction in API costs through intelligent model tiering.

## Architecture
```
Contract PDF → PyMuPDF Heuristic Router → Page Classification
  ↓ Standard Clauses → Azure Search → GPT-4o-mini Clause Verification
  ↓ Execution/Signature Pages → pdf2image → GPT-4 Vision Visual Verification
  ↓ Both paths → Pydantic Structured Output → Backend API → React PDF Viewer Red Box Overlays
```

## Step-by-Step Workflow

### Step 1: Heuristic Router
- PyMuPDF scans PDFs for triggers: "Executed by", "Witness", "Signed for and on behalf of", "Site Access", "Execution page"
- Always flags last two pages (contracts typically place execution blocks there)
- Splits document into Text Pages and Execution Pages

### Step 2: Text Pipeline
- Extracts text from text-classified pages
- Queries Azure Search for golden-source compliance rules
- Uses GPT-4o-mini for clause comparison — cheaper, faster than vision
- Returns structured compliance findings

### Step 3: Vision Pipeline
- Converts flagged pages to high-resolution images with pdf2image
- Sends only high-value pages to GPT-4 Vision
- Checks: stamp presence, signature placement, witness signatures, mandatory fields
- Captures page-level and region-level evidence

### Step 4: Structured Output
```json
{
  "contract_id": "CN-EXAMPLE-001",
  "overall_status": "requires_review",
  "findings": [
    {
      "page_number": 48,
      "error_type": "missing_site_access_stamp",
      "severity": "high",
      "suggested_fix": "Add the approved Site Access stamp before submission.",
      "ui_overlay": {
        "bounding_region_hint": "bottom-right execution block",
        "overlay_label": "Missing Site Access Stamp"
      }
    }
  ]
}
```

## Design Decisions

**Why not send the whole PDF to GPT-4 Vision?**
Unit economics. A 50-page PDF sent to vision would multiply cost and latency for every contract. Most pages do not require visual reasoning. The router reserves expensive vision calls for high-value execution pages only.

**Why use heuristics instead of a classifier?**
Execution pages contain predictable legal phrases and page-position patterns. A heuristic router is fast, cheap, explainable, and good enough for first-pass routing. Deterministic and easy to debug.

**Why Pydantic?**
Converts LLM output from free-form text into a contract between backend and frontend. Enforced required fields, enabled retries if output failed validation, made API responses predictable, allowed frontend overlays.

**Why Azure Search?**
Enterprise-friendly retrieval over approved compliance documents. Fit the client environment and allowed retrieval from the golden source rather than relying on model memory.

## Interview Q&A

Q: Why is this not just OCR plus keyword search?
A: OCR extracts text but does not understand visual placement, stamps, or execution layout. The business issue was multimodal — questions like "is the signature in the correct box?" are not solved by text extraction alone.

Q: What was technically hard?
A: Not calling GPT-4 Vision — deciding when not to call it. The router had to preserve visual accuracy while keeping cost and latency viable. The second hard part was making output structured enough for a frontend PDF viewer.

Q: How did you measure success?
A: Pilot metrics focused on review time reduction, findings detected, reviewer acceptance, false-positive rate, and whether findings contained enough evidence for legal/engineering users to act. Early review-time reduction was around 40%.

---

# Project 2: AI Tax Assistant — Hybrid Regulatory Intelligence System

## Executive Summary
A Hybrid RAG Tax Assistant designed to solve data staleness in regulatory AI. Standard RAG systems are static — if an ATO document is indexed today and a new ruling appears tomorrow, the system becomes obsolete. The assistant used dual-path retrieval:
1. Static Truth: FAISS vector database containing official ATO guidelines
2. Dynamic Truth: Real-time web search through SerpAPI for recent updates

## Business Problem
Consulting firms need to answer tax questions using accurate and current regulatory information. Regulation changes frequently. A normal RAG bot can only answer from what has already been embedded. If the indexed corpus is stale, the answer may be wrong even if retrieval works perfectly.

Key risk areas: tax law amendments, superannuation contribution changes, ATO guidance updates, edge cases where a new ruling overrides old guidance.

## Architecture
```
User Tax Question → LangChain Router
  → Static Retrieval: FAISS (official ATO PDFs)
  → Dynamic Retrieval: SerpAPI (real-time web search)
  → Evidence Assembly → LLM Synthesis → Answer with Citations → Streamlit UI
```

## Conflict Resolution Logic
1. Prioritise official ATO documents for definitions and stable rules
2. Use real-time web search for recency and amendments
3. If recent official web result conflicts with older indexed PDF, treat recent official as more current
4. Never present uncited tax advice as definitive
5. If evidence conflicts, explain the conflict and recommend checking latest official ATO page

## Why FAISS?
Lightweight, local, fast for prototyping, cost-effective. In production could be replaced with Azure AI Search, Pinecone, Weaviate, pgvector, or Databricks Vector Search.

## Why SerpAPI?
Provides dynamic retrieval path — captures recent amendments, ATO announcements, government press releases, and updates not yet in the indexed PDF corpus.

## Measurement
Retrieval quality: Hit Rate@K, MRR, ANN Recall vs. exact search. Generation fidelity: Faithfulness, Context Utilisation using LangSmith tracing and LLM-as-a-Judge scoring with synthetic gold datasets.

## Interview Q&A

Q: Why not just re-index the vector database every day?
A: Daily re-indexing helps but doesn't fully solve it. Regulatory changes can appear first as web announcements before being incorporated into stable PDFs. A dynamic path gives a recency check that complements the static corpus.

Q: How do you prevent random web results from overriding official guidance?
A: Synthesis prompt and ranking logic distinguish official sources from generic web snippets. Official ATO and government sources get priority. Non-official results can trigger caution but should not override official guidance unless corroborated.

---

# Project 3: Asset Maintenance Intelligence Agent

## Executive Summary
End-to-end maintenance lifecycle automation system replacing a 5-person manual planning bottleneck. Designed Medallion data architecture (Bronze-Silver-Gold) using stored procedures to unify raw IoT sensor logs and SAP asset data. Impact: maintenance planning cycle from 3 days to 30 minutes.

## Business Problem
**Before:** IoT sensors alert → engineer diagnoses → mechanic gets verbal instruction → handwritten Job Card → 5-person data entry team manually types notes into SAP → 3-day lag, errors, missed parts orders.

**After:** IoT data hits threshold → GenAI Agent instantly drafts digital Job Card with SAP Bill of Materials pre-filled and safety procedures from OEM manuals → mechanic confirms on tablet → parts ordered automatically.

## The Synthetic Gold Strategy
The client's live IoT feed was delayed by security protocols. Solution: obtained the schema for IoT and SAP tables, wrote a Python script generating "Synthetic Gold Data" mimicking failure modes (spiking temperature every 100 rows). This allowed building dashboards and the AI agent in parallel while the backend team fixed the data pipes.

## Medallion Architecture (Stored Procedures)
- **Bronze (Raw):** Chaotic stream of sensor logs (JSON/CSV)
- **Silver (Cleaned):** Standardised units, joined Sensor ID to Asset ID from SAP, MERGE INTO pattern
- **Gold (Asset Health Table):** Asset_ID, Current_Vibration, Current_Temp, Risk_Score, Last_Maintenance_Date, Zone_Status

## Condition-Based Monitoring (ISO 10816)
- Zone A (Green): Vibration < 2.5 mm/s — Good
- Zone B (Yellow): Vibration 2.5–4.5 mm/s — Warning
- Zone C (Red): Vibration > 4.5 mm/s — CRITICAL, trigger agent

No traditional ML needed. Deterministic condition monitoring is often better because it is explainable, transparent, and defensible.

## Agent Workflow
1. Stored Procedure detects Zone C violation → inserts row into Alerts_Queue
2. Agent reads queue
3. RAG retrieval: fetches SAP BOM for asset + OEM manual repair sections
4. LLM drafts Job Card with specific bearing part numbers and LOTO safety procedures
5. Output: structured JSON Job Card ready for mechanic approval

---

# Project 4: Streaming Platform Recommendation Engine

## Executive Summary
Production-scale recommendation engine for a major streaming platform (3.2M+ user profiles). ALS collaborative filtering with confidence-weighted implicit feedback, hybrid scoring, catalogue bucket constraints, and no-drop QA guarantee. Deployed on Kubeflow with weekly scheduling on AWS/Redshift.

## Why ALS Over Deep Learning
- **Implicit feedback native:** Users watch, not rate. ALS with confidence weighting was designed for this exact signal.
- **Scale:** ALS on sparse matrices is embarrassingly parallelisable. 3.2M profiles × large catalogue would need GPUs and long training with deep learning.
- **Interpretability:** ALS gives user factors and item factors. Score = user_vector · item_vector. Deep learning is a black box.
- **Debuggability:** When recommendations look wrong, you can inspect the factors.
- **Time to production:** Weeks, not months.

## Confidence Score Design
```
confidence_score =
    0.30 * watch_coverage     (depth — how much of the show they watched)
  + 0.25 * episode_coverage   (breadth — fraction of episodes watched)
  + 0.30 * avg_completion     (quality — finishing episodes = genuine interest)
  + 0.15 * recency_boost      (1 / (1 + days_since_watch / 180))
```

Filtering: effective_play_duration ≥ 300,000ms (5+ minutes), completion_rate ≥ 0.10, last 12 months only.

## Hybrid Scoring
```
hybrid_score = 0.7 * cf_scaled + 0.3 * pop_user_show
```
70% personalised collaborative filtering + 30% cluster popularity (not global — within the user's taste cluster). Gives robustness for sparse users while keeping personalisation dominant.

## Catalogue Buckets
- **new:** 5 recs — discovery, recently added content
- **returning:** 5 recs — shows they've engaged with before
- **top:** 10 recs — broad appeal crowd pleasers
- **Total: 20 recommendations per profile, always guaranteed**

## No-Drop Guarantee
Hard business requirement: profiles_missing == 0. Every profile in input must appear in output with 20 recommendations. Enforced via per-shard and aggregated QA checks across 330 parquet shards.

## Fallback Ladder
1. CF candidates (hybrid scored) — best case
2. Cluster popularity — similar users like this
3. Global bucket popularity — everyone likes this
4. Deterministic fallback — last resort from valid catalogue

## Deployment
Kubeflow pipeline on AWS. Weekly cron schedule. Redshift for data extraction, S3 for outputs. Each stage is idempotent — if it fails mid-run, it resumes from last checkpoint.

---

# Project 5: Antipodes — Multi-Agent Financial Decision System

## Executive Summary
Debate-style multi-agent system where specialised agents propose, critique, and reconcile trade ideas. LangGraph state machine with deterministic execution, leakage-proof as_of_date filtering, Pydantic-enforced schemas, and 90-day backtesting.

## Agent Architecture
- **Valuation Agent:** Risk-adjusted momentum (20d return / 60d vol), percentile-normalised
- **Sentiment Agent:** VADER with 0.9^days recency decay over curated headlines
- **Fundamental Agent:** Composite quality across growth, profitability, leverage, efficiency
- **Debate Coordinator:** Single conservative moderation round when an agent is isolated
- **Coordinator:** Weighted voting over agent ratings with thresholds → BUY/HOLD/SELL

## LangGraph State
Workflow: data_loader → valuation_agent → sentiment_agent → fundamental_agent → debate_coordinator → coordinator → backtester → output_generator. Errors captured into state["errors"] without crashing downstream steps.

## Data Integrity and Leakage Prevention
- Strict as_of_date filtering for prices and news
- Backtest uses forward prices not seen by agents
- Pydantic models enforce schema constraints throughout
- 90-day forward window from as_of_date, equal-weight BUYs, equal-weight benchmark

## Outputs
- picks.csv — per-ticker ratings and final decision
- performance.csv — key metrics including portfolio, benchmark, active return, simple Sharpe proxy
- chart.png — portfolio vs benchmark bars
- attribution.csv — per-ticker forward returns and contributions

---

# Project 6: BNPL Re-engagement Engine

## Executive Summary
End-to-end customer analytics platform for a fintech BNPL client. The headline finding: dormancy is a habit problem, not a credit problem (bureau scores nearly identical across dormant vs engaged segments — 7-point difference, statistically negligible). Re-engagement should use personalised merchant recommendations, not hardship offers.

## The Headline Finding
- Dormant customers: mean bureau score = 775.4
- Engaged customers: mean bureau score = 768.3
- Difference: ~7 points — statistically negligible
- App sessions L90D: Engaged users are in the app 2.7× more than dormant users

This reframes the entire marketing playbook — from hardship comms to personalised re-activation.

## System Architecture (6 Phases)

### Phase 1: Dormancy Risk Prediction (XGBoost)
Key engineered features:
- session_drop: L1D sessions / (L90D sessions / 90) — trajectory, not level
- repayment_drop: 30D repayment / 60D repayment — declining repayments signal disengagement
- utilization_rate: NET_BALANCE / CREDIT_LIMIT_NEW
- days_since_last_order: most direct recency signal
- scale_pos_weight = 2.14 — penalises missing dormant customer 2.14× harder

Result: ROC-AUC 0.9923 on held-out test set.

### Phase 1b: Survival Analysis (Kaplan-Meier)
Predicts when customers will churn, not just if. Stratified by session activity groups (Low/Medium/High). Cox Proportional Hazards dropped due to collinearity between session features. Intervention timing: outreach ~20 days before median survival time crossing.

### Phase 2: NLP Sentiment Diagnosis (VADER)
Themes from survey data:
- app_friction → "We've improved the app" push campaign
- rewards → Merchant coupon, tangible value hook
- credit_limit → CLV top-up if responsible lending gate passes
- personalisation → Recommender output answers their exact complaint
- promo_fatigue → Back off, flag for low-frequency channel
- financial_concern → Repayment flexibility messaging

### Phase 3: Merchant Recommender (SVD)
273 raw merchant categories → 12 macro-categories (reduces sparsity). SVD collaborative filtering generates top-3 unseen category recommendations per account. Seasonality boost ×1.3 for in-season categories.

### Phase 4: CLV + Responsible Lending Gate
Responsible lending gate (ASIC compliance consideration):
- utilization_rate < 85%
- repayment_drop < 40%
- BUREAU_SCORE > 550
- Recent session activity present

### Phase 5: Next Best Action Framework
One decision per customer: App Skeptic (push), Value Hunter (email coupon), Financial Watcher (SMS), Loyalty Candidate (in-app banner), Write-Off (do not contact).

### Phase 6: ROI + A/B Design
Stratified 85/15 holdout split. Base case: 20% re-engagement rate → ~$132,800/month from combined re-engagement + cross-sell. Conservative: $27,400/month. Upside: $82,300/month.

---

# Project 7: StreamFit — Customer Support Intelligence Platform

## Executive Summary
Structured LLM extraction pipeline for customer support conversations. LangGraph graph with 6 nodes, Pydantic models mirroring TARGET_SCHEMA, and deterministic quality scoring. Demo in Streamlit; production architecture uses Azure + Databricks Delta Lake.

## LangGraph Pipeline (6 Nodes)
1. **Loader:** Read file, detect channel type (phone/chat/email), strip noise
2. **Summarizer:** Fast LLM call — 2-sentence hover summary, cached after first call
3. **Extractor:** Full LLM call — system prompt + TARGET_SCHEMA → raw JSON
4. **Validator:** Pydantic validation, retry up to 2× on failure, flag low-confidence if all retries fail
5. **Scorer:** Deterministic scoring from validated Pydantic model (no LLM call)
6. **Persister:** Write to /extracted/ or Azure Data Lake in production

## Scoring Logic (Deterministic, No LLM)

**Agent Quality Score (0–10):**
- Resolution: resolved=3.5, partially_resolved=1.8, escalated=1.2, unresolved=0.0 (max 3.5)
- Interaction Quality: clean=2.5, minor_issues=1.5 (max 2.5)
- Empathy: handled_well=2.0 (max 2.0)
- Action Follow-through: completed/total × 2.0 (max 2.0)

**Conversation Quality Score (0–10):**
- Extraction Confidence: high=4.0, medium=2.5, low=1.0 (max 4.0)
- Schema Completeness: filled_sections/4 × 3.0 (max 3.0)
- Sentiment Trajectory: improving=3.0, stable=2.0, declining=1.0 (max 3.0)

## Production Architecture
```
CRM/Email/Chat → Azure Blob Storage → Azure Event Grid → Azure Service Bus
→ Azure Functions → Azure Container Apps (LangGraph Workers, auto-scale 1–20)
→ Azure OpenAI (GPT-4o) → Pydantic Validation
→ Azure Data Lake Gen2 → Databricks Auto Loader
→ Bronze (raw JSON) → Silver (flattened) → Gold (aggregations) → Power BI
```

Cost at scale: ~$280/month for 10,000 interactions/month.

---

# Project 8: Autonomous Time-Series Forecasting Agent

## Executive Summary
Autonomous ML orchestrator that cleans data, builds forecasts, evaluates MAPE, and iterates with human-readable plans. Tested across 3 real datasets. Prophet + custom lag/rolling regressors achieved 3.71% MAPE on financial data.

## Model Evolution

### ARIMA: Failed on Seasonal Data
- ADF test p > 0.05 → non-stationary → differenced once (d=1)
- Could not capture seasonality → MAPE 1698% on benchmark

### SARIMA: Improved but Rigid
- Added seasonal terms P,D,Q,m
- Requires careful tuning of 7 parameters
- Struggled with multiple seasonalities and changepoints

### LSTM/GRU: Overfit on Small Datasets
- GRU had lowest RMSE (6.96) but MAPE 59.57% vs Prophet's 39.94%
- Small dataset (514–1511 rows) — neural nets need thousands to generalise
- Training time 267–376 seconds vs Prophet's 43 seconds

### Prophet + Custom Regressors: Winner
```
y(t) = g(t) + s(t) + h(t) + β₁·lag_1 + β₂·lag_7 + β₃·rolling_mean + ε(t)
```
- Trend modelled explicitly with piecewise linear function and changepoint detection
- Seasonality via Fourier series — no manual encoding needed
- Regressors: lag_1, lag_7, rolling_mean_7
- Without regressors: MAPE 5.89% → With regressors: MAPE 3.71% (~37% relative improvement)

## Dataset Results
| Dataset | Iterations | Final MAPE |
|---|---|---|
| Microsoft stock (1511 rows) | 2 | 3.71% |
| Sales (514 rows) | 3 | 5.005% |
| Transaction (high variance) | 3 | 91.76% |

Transaction dataset acknowledged as hard problem — metric improvement doesn't always mean better real-world utility; qualitative diagnostics matter.

## LangGraph Agent Workflow
Plan generation node → code execution node → evaluation node → self-healing debugger node (captures Python tracebacks, rewrites code without human intervention) → cyclic feedback loop for model refinement.

---

# Cross-Project Interview Q&A

## "Tell me about your strongest AI architecture project."
Use RapidX. Lead with the business problem (visual compliance, not just text), the smart routing idea (unit economics), and the Pydantic-structured output that enabled React overlays. The architecture decision was knowing when NOT to use the expensive model.

## "How do you handle hallucination in RAG systems?"
Ground answers in retrieved evidence. Use official/golden-source documents. Preserve source metadata. Force structured output where schema matters. Use recency-aware retrieval for domains where information changes. State uncertainty if evidence conflicts. The AI Tax Assistant solved this with dual-path retrieval and conflict resolution logic.

## "How do you think about cost and latency in GenAI systems?"
Route work by complexity and modality. Use cheap deterministic preprocessing before model calls. Reserve vision models for pages where visual reasoning is necessary. Measure cost per document and latency per page. RapidX achieved 5× API cost reduction through this approach.

## "What does structured output mean and why does it matter?"
Structured output means the model returns machine-readable fields rather than conversational prose. In enterprise systems, a frontend, workflow engine, or API needs predictable fields. RapidX needed page_number, error_type, suggested_fix for React overlays. StreamFit needed Pydantic models mirroring TARGET_SCHEMA so extracted intelligence could flow into dashboards and deterministic scoring.

## "What is your best ML production story?"
The streaming platform recommendation engine. 3.2M+ profiles, implicit feedback confidence scores, ALS collaborative filtering, 330 parquet shards, hybrid scoring, guaranteed 20 recs per profile, no-drop QA, Kubeflow weekly deployment.

## "Why not deep learning?"
ALS was native to implicit feedback, scalable, interpretable, and debuggable at Foxtel's scale. For time-series, GRU/LSTM overfit because the dataset was small (514–1511 rows) and Prophet handled trend, seasonality, missing data, and changepoints better. Choose the simplest model that fits the data, constraints, and stakeholder need.

## "What makes you different from someone who just uses LangChain?"
The value is in system design: routing, retrieval design, schemas, validation, QA gates, scoring logic, deployment, and business integration. RapidX is not impressive because it calls a vision model — it is impressive because it routes only the right pages to vision and returns structured outputs a frontend can use. Foxtel is not a notebook recommender — it is a sharded production-style pipeline with bucket constraints and no-drop QA.
