// Capability roles and bullets from content-draft section 3.
// Per the site text rule, em dashes in the source copy are replaced with
// colons or commas; all other wording is unchanged.
export const CAPABILITIES = [
  {
    role: 'Data Analyst',
    bullets: [
      'Run hypothesis testing, A/B testing, and causal inference to separate signal from noise',
      'Diagnose customer behaviour with survival analysis (Kaplan-Meier) and sentiment scoring (VADER)',
      'Build operational and executive dashboards in Tableau and Power BI',
      'Interrogate data with expert SQL and Python (Pandas)',
      'Design stratified A/B holdouts that measure uplift honestly',
      'Explain results in plain language to non-technical audiences',
    ],
  },
  {
    role: 'Business Analyst',
    bullets: [
      'Translate stakeholder requirements into production-ready technical scope',
      'Quantify impact in business terms: review time, API cost, planning cycle, uplift',
      'Facilitate learning at scale: led the Statistical Thinking for Data Science curriculum for 200+ students at UTS',
      'Reframe problems commercially, e.g. dormancy as a habit problem rather than a credit problem',
      'Manage delivery with Agile project management',
      'Define success metrics before build, tied to decisions rather than accuracy alone',
    ],
  },
  {
    role: 'Solution Architect',
    bullets: [
      'Design end-to-end AI architectures, from raw ingestion to client-facing interface',
      'Apply Medallion architecture (Bronze-Silver-Gold), star schemas, and SCD2 history',
      'Route each task to the cheapest capable model, tiering that cut API costs 5×',
      'Enforce system contracts with Pydantic and JSON schemas',
      'Blend static and live knowledge behind one conflict-resolving retrieval layer',
      'Plan deployment across AWS, GCP, and Azure: Kubeflow, Composer, Databricks, Blob Storage',
    ],
  },
  {
    role: 'AI Engineer',
    bullets: [
      'Build RAG systems on FAISS with semantic chunking and conflict-resolution logic',
      'Orchestrate multi-agent systems as LangGraph state machines with deterministic execution',
      'Close failures autonomously with a self-healing debugger that rewrites its own code',
      'Evaluate generative output with LangSmith tracing, LLM-as-a-Judge, Hit Rate@K, MRR, and faithfulness',
      'Integrate GPT-4o and GPT-4 Vision behind routing layers and structured outputs',
      'Prototype full-stack in Streamlit and wire live API responses into React interfaces',
    ],
  },
  {
    role: 'ML Engineer',
    bullets: [
      'Train and tune regression, classification, and clustering models (Scikit-learn, PyTorch, TensorFlow)',
      'Build ALS collaborative filtering engines at 3.2M+ profile scale',
      'Engineer implicit feedback, recency, duration, completion, into hybrid scoring with cold-start fallbacks',
      'Validate ranking with Precision@K, Recall@K, and NDCG',
      'Benchmark ARIMA, SARIMA, Prophet, and LSTM/GRU forecasters on MAPE',
      'Run leakage-proof backtests and rolling A/B experiments before trusting a model',
    ],
  },
  {
    role: 'Data Engineer',
    bullets: [
      'Build ELT pipelines with Apache Airflow and dbt Cloud on GCP',
      'Unify messy sources, IoT sensor logs, SAP asset data, transaction notes, via stored procedures',
      'Model warehouses with star schemas and SCD2 for historical tracking',
      'Orchestrate weekly production pipelines on Kubeflow (AWS)',
      'Land data into Databricks Delta Lake medallion layers',
      'QA at shard scale: no-drop checks across 330 parquet shards',
    ],
  },
]

// Substrings that carry a real figure or metric name. Each appears verbatim
// inside exactly one bullet above.
export const CAPABILITY_HIGHLIGHTS = [
  '200+ students',
  '5×',
  '3.2M+ profile scale',
  'Precision@K, Recall@K, and NDCG',
  'MAPE',
  'Hit Rate@K, MRR',
  '330 parquet shards',
  'Bronze-Silver-Gold',
]

// Returns the highlight substrings contained in a given bullet.
export function getHighlights(bullet) {
  return CAPABILITY_HIGHLIGHTS.filter((h) => bullet.includes(h))
}

export default CAPABILITIES
