// Horizontal pill marquee. Items render twice (the second copy is aria-hidden)
// so translating the track by -50% lands exactly on the start of the copy,
// giving a seamless loop. Under reduced motion the track is static and wraps.
const TICKER_CSS = `
.tech-ticker {
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  outline-offset: 4px;
}
.tech-ticker:focus-visible { outline: 3px solid var(--dawn); }
.tech-ticker__track {
  display: flex;
  width: max-content;
  animation: tech-ticker-scroll var(--ticker-speed, 40s) linear infinite;
  will-change: transform;
}
.tech-ticker--reverse .tech-ticker__track { animation-direction: reverse; }
.tech-ticker:hover .tech-ticker__track,
.tech-ticker:focus-within .tech-ticker__track { animation-play-state: paused; }
.tech-ticker__group {
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  padding-right: 12px;
  margin: 0;
  list-style: none;
  padding-left: 0;
}
.tech-ticker__pill {
  display: inline-block;
  white-space: nowrap;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 235, 0.2);
  border-radius: 999px;
  font-family: 'Figtree', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.4;
  color: #FFFFEB;
}
.tech-ticker__pill--signal {
  border-color: #FFA946;
  color: #FFA946;
}
@keyframes tech-ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .tech-ticker {
    mask-image: none;
    -webkit-mask-image: none;
  }
  .tech-ticker__track {
    animation: none;
    width: auto;
    transform: none;
  }
  .tech-ticker__group {
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 1;
    width: 100%;
    padding-inline: clamp(20px, 4vw, 48px);
  }
  .tech-ticker__group[aria-hidden='true'] { display: none; }
}
`

function PillGroup({ items, hidden = false }) {
  return (
    <ul className="tech-ticker__group" aria-hidden={hidden ? 'true' : undefined}>
      {items.map((item, index) => {
        const signal = index % 5 === 4
        return (
          <li
            key={`${item}-${index}`}
            className={`tech-ticker__pill${signal ? ' tech-ticker__pill--signal' : ''}`}
          >
            {item}
          </li>
        )
      })}
    </ul>
  )
}

export default function TechTicker({ items, techs, reverse = false, speed = 40, label = 'Tech stack' }) {
  const list = items ?? techs ?? []
  if (list.length === 0) return null

  return (
    <>
      <style>{TICKER_CSS}</style>
      <div
        className={`tech-ticker${reverse ? ' tech-ticker--reverse' : ''}`}
        style={{ '--ticker-speed': `${speed}s` }}
        role="group"
        aria-label={label}
        tabIndex={0}
      >
        <div className="tech-ticker__track">
          <PillGroup items={list} />
          <PillGroup items={list} hidden />
        </div>
      </div>
    </>
  )
}
