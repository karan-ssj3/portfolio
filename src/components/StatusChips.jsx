import React from 'react'

const CHIPS = [
  { label: 'Pipeline deployed', sub: 'Airflow · dbt · GCP' },
  { label: 'Eval suite passed', sub: 'Hit Rate@K · MRR' },
  { label: 'Job Card drafted', sub: '30 min · was 3 days' },
  { label: 'Self-healing loop closed', sub: 'LangGraph · self-healing debugger' },
  { label: 'Recommendations live', sub: '3.2M+ profiles · AWS · Kubeflow' },
]

export default function StatusChips({ chipRefs }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
      }}
    >
      {CHIPS.map((chip, i) => (
        <li
          key={chip.label}
          ref={chipRefs ? (el) => { chipRefs.current[i] = el } : null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(28, 27, 24, 0.12)',
            backgroundColor: '#F5F3EE',
            color: '#1C1B18',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.875rem',
            lineHeight: 1.5,
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              backgroundColor: '#9C5636',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
          <span>
            <strong style={{ fontWeight: 600 }}>{chip.label}</strong>
            <span style={{ display: 'block', opacity: 0.7, marginTop: '0.125rem' }}>
              {chip.sub}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
