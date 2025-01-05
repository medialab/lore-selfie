import { useState } from "react"



export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  disabled
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <section className={`CollapsibleSection ${isCollapsed || disabled ? 'is-collapsed' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <div className="header" onClick={() => disabled ? undefined : setIsCollapsed(!isCollapsed)}>
        <h2 className="title">{title}</h2>
        <button>
          <span>
          {
            isCollapsed ? '▼' : '▲'
          }
          </span>
        </button>
      </div>
      <div className="body">
        {children}
      </div>
    </section>
  )
}