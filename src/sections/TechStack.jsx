import Section from '../components/Section'
import TechTicker from '../components/TechTicker'

// Tool names come from content-draft only. Do not add others here.
const ROW_ONE = [
  'Airflow',
  'dbt Cloud',
  'Kubeflow',
  'Databricks',
  'Delta Lake',
  'AWS',
  'GCP',
  'Azure',
  'SQL',
  'Pandas',
  'Tableau',
  'Power BI',
]

const ROW_TWO = [
  'FAISS',
  'LangGraph',
  'LangSmith',
  'GPT-4o',
  'PyTorch',
  'TensorFlow',
  'Scikit-learn',
  'Pydantic',
  'Streamlit',
  'React',
  'Prophet',
  'LSTM/GRU',
]

export default function TechStack() {
  return (
    <Section id="tech-stack" tone="ink" roundedBottom style={{ padding: '72px 0 96px' }}>
      <p className="eyebrow" style={{ textAlign: 'center', color: '#FFFFEB', margin: '0 0 32px' }}>
        BUILT WITH
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TechTicker items={ROW_ONE} label="Data and platform tools" />
        <TechTicker items={ROW_TWO} reverse label="AI and application tools" />
      </div>
    </Section>
  )
}
