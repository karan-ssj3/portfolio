export default function Section({ id, children, className = '', as: Component = 'section' }) {
  return (
    <Component id={id} className={`section ${className}`.trim()}>
      {children}
    </Component>
  )
}
