import { useEffect, useRef, useState } from 'react'

const CAPABILITIES = [
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
      'Quantify impact in business terms — review time, API cost, planning cycle, uplift',
      'Facilitate learning at scale — led the Statistical Thinking for Data Science curriculum for 200+ students at UTS',
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
      'Route each task to the cheapest capable model — tiering that cut API costs 5×',
      'Enforce system contracts with Pydantic and JSON schemas',
      'Blend static and live knowledge behind one conflict-resolving retrieval layer',
      'Plan deployment across AWS, GCP, and Azure — Kubeflow, Composer, Databricks, Blob Storage',
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
      'Engineer implicit feedback — recency, duration, completion — into hybrid scoring with cold-start fallbacks',
      'Validate ranking with Precision@K, Recall@K, and NDCG',
      'Benchmark ARIMA, SARIMA, Prophet, and LSTM/GRU forecasters on MAPE',
      'Run leakage-proof backtests and rolling A/B experiments before trusting a model',
    ],
  },
  {
    role: 'Data Engineer',
    bullets: [
      'Build ELT pipelines with Apache Airflow and dbt Cloud on GCP',
      'Unify messy sources — IoT sensor logs, SAP asset data, transaction notes — via stored procedures',
      'Model warehouses with star schemas and SCD2 for historical tracking',
      'Orchestrate weekly production pipelines on Kubeflow (AWS)',
      'Land data into Databricks Delta Lake medallion layers',
      'QA at shard scale — no-drop checks across 330 parquet shards',
    ],
  },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function useInView(ref, threshold = 0.1) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}

function SplitText({ text, visible = false, stagger = 30, baseDelay = 0, className = '' }) {
  const parts = text.split(/\s+/)

  return parts.map((part, index) => (
    <span key={index} className="inline-block overflow-hidden align-bottom">
      <span
        className={`inline-block transition-all duration-500 ease-out ${className} ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{ transitionDelay: `${baseDelay + index * stagger}ms` }}
      >
        {part}
      </span>
      {index < parts.length - 1 ? '\u00A0' : ''}
    </span>
  ))
}

export default function CapabilityMorph() {
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef(null)
  const visible = useInView(containerRef, 0.1)

  return (
    <div ref={containerRef} className="space-y-14">
      {CAPABILITIES.map((capability, capabilityIndex) => {
        const roleDelay = capabilityIndex * 180

        return (
          <article
            key={capability.role}
            className="border-t border-[#1C1B18]/10 pt-6"
          >
            <h3 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-medium text-[#1C1B18] mb-5">
              {reduced ? (
                capability.role
              ) : (
                <SplitText
                  text={capability.role}
                  visible={visible}
                  stagger={40}
                  baseDelay={roleDelay}
                />
              )}
            </h3>
            <ul className="space-y-3">
              {capability.bullets.map((bullet, bulletIndex) => (
                <li
                  key={bulletIndex}
                  className="flex gap-3 font-['Inter'] text-base leading-relaxed text-[#1C1B18]/80"
                >
                  <span className="text-[#9C5636] mt-1.5 shrink-0" aria-hidden="true">
                    —
                  </span>
                  <span>
                    {reduced ? (
                      bullet
                    ) : (
                      <SplitText
                        text={bullet}
                        visible={visible}
                        stagger={18}
                        baseDelay={roleDelay + 120 + bulletIndex * 90}
                      />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
