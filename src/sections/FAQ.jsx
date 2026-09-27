import * as Accordion from '@radix-ui/react-accordion'

const FAQS = [
  {
    q: 'What does Karan actually do?',
    a: 'He is a full-stack data scientist and ML engineer who builds production-grade AI systems, autonomous agent frameworks, and data engineering pipelines for enterprise clients. The work runs end to end — raw data, pipelines, models, evaluation, deployment.',
  },
  {
    q: 'Where does he work right now?',
    a: 'He is a Data and AI Consultant at Deloitte in Sydney (July 2025 – present), leading strategic AI and data initiatives for enterprise clients across financial services and technology. He also led the Statistical Thinking for Data Science curriculum at UTS for 200+ students.',
  },
  {
    q: 'What has he shipped at scale?',
    a: 'A recommendation engine serving 3.2M+ profiles on a weekly Kubeflow pipeline, a multimodal contract compliance system that cut review time by 40%, and a GenAI maintenance agent that compressed planning from 3 days to 30 minutes. At Synogize he built an autonomous ML agent framework and a hybrid RAG tax advisory system.',
  },
  {
    q: 'How does he prove a system works?',
    a: 'Every system ships with its own evaluation — retrieval quality (Hit Rate@K, MRR), ranking (Precision@K, Recall@K, NDCG), forecasting (MAPE), classification (AUC), and LLM-as-a-Judge with LangSmith tracing for generative output. Impact is then measured against a baseline, such as 40% faster contract review.',
  },
  {
    q: 'What is his education?',
    a: "He holds a Master of Data Science and Innovation from UTS — High Distinction in Advanced NLP (88%) and Reinforcement Learning (85%) — plus a Postgraduate Diploma in Computer Science & AI from IIIT-Delhi and a Bachelor of Commerce (Honours) from the University of Delhi. His master's research centred on autonomous ML agents and modular agent frameworks built with LangGraph and OpenAI.",
  },
  {
    q: 'Is he available, and what are his rates?',
    a: 'He is based in Sydney and open to conversations about AI systems, data strategy, consulting engagements, and collaboration.',
  },
]

const STYLES = `
.faq {
  background: #F5F3EE;
  color: #1C1B18;
  padding: 6rem 1.5rem;
  font-family: 'Inter', system-ui, sans-serif;
}
.faq-inner {
  max-width: 48rem;
  margin: 0 auto;
}
.faq-eyebrow {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 0.8125rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #9C5636;
  margin: 0 0 0.75rem;
}
.faq-title {
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 2.5rem;
}
.faq-item {
  border-bottom: 1px solid rgba(28, 27, 24, 0.12);
}
.faq-item:first-child {
  border-top: 1px solid rgba(28, 27, 24, 0.12);
}
.faq-trigger {
  all: unset;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0.25rem;
  cursor: pointer;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  font-size: 1.0625rem;
  font-weight: 500;
  color: #1C1B18;
}
.faq-trigger:hover {
  color: #9C5636;
}
.faq-trigger:focus-visible {
  outline: 2px solid #9C5636;
  outline-offset: 2px;
}
.faq-icon {
  flex: none;
  color: #9C5636;
  transition: transform 200ms ease;
}
.faq-item[data-state="open"] .faq-icon {
  transform: rotate(45deg);
}
.faq-content {
  overflow: hidden;
}
.faq-content-inner {
  padding: 0 0.25rem 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #1C1B18;
  max-width: 42rem;
}
@media (prefers-reduced-motion: reduce) {
  .faq-icon { transition: none; }
}
`

export default function FAQ() {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <style>{STYLES}</style>
      <div className="faq-inner">
        <p className="faq-eyebrow">FAQ</p>
        <h2 className="faq-title" id="faq-title">
          Questions, answered
        </h2>
        <Accordion.Root type="single" defaultValue="faq-0" collapsible>
          {FAQS.map(({ q, a }, i) => (
            <Accordion.Item className="faq-item" value={`faq-${i}`} key={q}>
              <Accordion.Header>
                <Accordion.Trigger className="faq-trigger">
                  {q}
                  <svg
                    className="faq-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="faq-content">
                <p className="faq-content-inner">{a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
