import { useState } from "react"



export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <section className={`CollapsibleSection ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className="header">
        <h2 className="title">{title}</h2>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {
            isCollapsed ? '▼' : '▲'
          }
        </button>
      </div>
      <div className="body">
        {children}
      </div>
    </section>
  )
}