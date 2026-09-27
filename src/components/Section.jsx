// Slab section primitive. Tones map to the Wispr-derived palette; depth comes
// only from slabs overlapping (no shadows, no gradients). `data-tone` lets
// children style against the slab they sit on.
const TONES = {
  cream: { background: '#FFFFEB', color: '#1A1A1A' },
  ink: { background: '#1A1A1A', color: '#FFFFEB' },
  teal: { background: '#034F46', color: '#FFFFEB' },
  greige: { background: '#E4E4D0', color: '#1A1A1A' },
}

export default function Section({
  id,
  children,
  className = '',
  as: Component = 'section',
  tone = 'cream',
  overlapTop = false,
  roundedBottom = false,
  style,
  ...rest
}) {
  const palette = TONES[tone] || TONES.cream
  const toneKey = TONES[tone] ? tone : 'cream'

  const slabStyle = {
    position: 'relative',
    backgroundColor: palette.background,
    color: palette.color,
    boxShadow: 'none',
    backgroundImage: 'none',
  }

  if (overlapTop) {
    slabStyle.marginTop = '-48px'
    slabStyle.borderTopLeftRadius = 'var(--radius-slab)'
    slabStyle.borderTopRightRadius = 'var(--radius-slab)'
    slabStyle.zIndex = 1
  }

  if (roundedBottom) {
    slabStyle.borderBottomLeftRadius = 'var(--radius-slab)'
    slabStyle.borderBottomRightRadius = 'var(--radius-slab)'
    // Keep the rounded bottom above whatever follows.
    if (slabStyle.zIndex === undefined) slabStyle.zIndex = 1
  }

  const classes = [
    'section',
    `section--${toneKey}`,
    overlapTop ? 'section--overlap-top' : '',
    roundedBottom ? 'section--rounded-bottom' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      id={id}
      className={classes}
      data-tone={toneKey}
      style={{ ...slabStyle, ...style }}
      {...rest}
    >
      {children}
    </Component>
  )
}
