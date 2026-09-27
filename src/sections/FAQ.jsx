import * as Accordion from '@radix-ui/react-accordion'
import Section from '../components/Section'

// Copy from content-draft §4 (Q1 to Q6). Dash punctuation is replaced with
// colons/commas per the site text rule; wording is otherwise unchanged.
const FAQS = [
  {
    q: 'What does Karan actually do?',
    a: 'He is a full-stack data scientist and ML engineer who builds production-grade AI systems, autonomous agent frameworks, and data engineering pipelines for enterprise clients. The work runs end to end: raw data, pipelines, models, evaluation, deployment.',
  },
  {
    q: 'Where does he work right now?',
    a: 'He is an AI Engineer at Neilson Financial Services in Sydney (since June 2026), building Databricks apps, compliance agents, and an LLM extraction pipeline that processes 60,000 calls per day. Previously he was a Data and AI Consultant at Deloitte (July 2025 to June 2026), leading strategic AI and data initiatives for enterprise clients across financial services and technology. He also led the Statistical Thinking for Data Science curriculum at UTS for 200+ students.',
  },
  {
    q: 'What has he shipped at scale?',
    a: 'A recommendation engine serving 3.2M+ profiles on a weekly Kubeflow pipeline, a multimodal contract compliance system that cut review time by 40%, and a GenAI maintenance agent that compressed planning from 3 days to 30 minutes. At Synogize he built an autonomous ML agent framework and a hybrid RAG tax advisory system.',
  },
  {
    q: 'How does he prove a system works?',
    a: 'Every system ships with its own evaluation: retrieval quality (Hit Rate@K, MRR), ranking (Precision@K, Recall@K, NDCG), forecasting (MAPE), classification (AUC), and LLM-as-a-Judge with LangSmith tracing for generative output. Impact is then measured against a baseline, such as 40% faster contract review.',
  },
  {
    q: 'What is his education?',
    a: "He holds a Master of Data Science and Innovation from UTS, High Distinction in Advanced NLP (88%) and Reinforcement Learning (85%), plus a Postgraduate Diploma in Computer Science & AI from IIIT-Delhi and a Bachelor of Commerce (Honours) from the University of Delhi. His master's research centred on autonomous ML agents and modular agent frameworks built with LangGraph and OpenAI.",
  },
  {
    q: 'Is he available, and what are his rates?',
    // TODO(Karan): confirm availability/rates copy
    a: 'He is based in Sydney and open to conversations about AI systems, data strategy, consulting engagements, and collaboration.',
  },
]

const STYLES = `
.faq {
  padding: 120px 0 144px;
}
.faq-inner {
  max-width: 880px;
  margin: 0 auto;
  padding-inline: clamp(20px, 4vw, 48px);
}
.faq-eyebrow {
  margin: 0 0 16px;
}
.faq-title {
  margin: 0 0 48px;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  position: relative;
  overflow: hidden;
  background: #E4E4D0;
  color: #1A1A1A;
  border-radius: var(--radius-card, 24px);
}
.faq-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #FF6C4C;
  opacity: 0;
  transition: opacity 240ms var(--ease-inout);
}
.faq-item[data-state="open"]::before {
  opacity: 1;
}
.faq-header {
  margin: 0;
}
.faq-trigger {
  all: unset;
  box-sizing: border-box;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  cursor: pointer;
  font-family: 'EB Garamond', Georgia, serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: #1A1A1A;
  border-radius: var(--radius-card, 24px);
}
.faq-trigger:focus-visible {
  outline: 3px solid #034F46;
  outline-offset: -3px;
}
.faq-icon {
  flex: none;
  transition: transform 240ms var(--ease-inout);
}
.faq-item[data-state="open"] .faq-icon {
  transform: rotate(45deg);
}
.faq-content {
  overflow: hidden;
}
.faq-content[data-state="open"] {
  animation: faq-open 240ms var(--ease-inout);
}
.faq-content[data-state="closed"] {
  animation: faq-close 240ms var(--ease-inout);
}
.faq-answer {
  margin: 0;
  padding: 0 28px 28px;
  max-width: 44rem;
  font-family: 'Figtree', system-ui, sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: rgba(26, 26, 26, 0.8);
}
@keyframes faq-open {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
@keyframes faq-close {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
@media (max-width: 640px) {
  .faq { padding: 88px 0 112px; }
  .faq-trigger { font-size: 21px; padding: 20px 22px; }
  .faq-answer { padding: 0 22px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .faq-content[data-state="open"],
  .faq-content[data-state="closed"] { animation: none; }
  .faq-icon,
  .faq-item::before { transition: none; }
}
`

export default function FAQ() {
  return (
    <Section id="faq" tone="cream" className="faq" aria-labelledby="faq-title">
      <style>{STYLES}</style>
      <div className="faq-inner">
        <p className="eyebrow faq-eyebrow">FAQ</p>
        <h2 className="display d-64 faq-title" id="faq-title">
          Good <em>questions.</em>
        </h2>
        <Accordion.Root
          className="faq-list"
          type="single"
          defaultValue="faq-0"
          collapsible
        >
          {FAQS.map(({ q, a }, i) => (
            <Accordion.Item className="faq-item" value={`faq-${i}`} key={q}>
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">
                  <span>{q}</span>
                  <svg
                    className="faq-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="faq-content">
                <p className="faq-answer">{a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </Section>
  )
}
