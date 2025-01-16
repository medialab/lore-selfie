import { useState } from "react"

import type { ReactChildren } from "~types/common"

interface CollapsibleSectionProps {
  title: string
  children: ReactChildren
  defaultCollapsed?: boolean
  disabled?: boolean
}
export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  disabled = false
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
  return (
    <section
      className={`CollapsibleSection ${isCollapsed || disabled ? "is-collapsed" : ""} ${disabled ? "is-disabled" : ""}`}>
      <div
        className="header"
        onClick={() => (disabled ? undefined : setIsCollapsed(!isCollapsed))}>
        <h2 className="title">{title}</h2>
        <button>
          <span>{isCollapsed ? "▼" : "▲"}</span>
        </button>
      </div>
      <div className="body">{children}</div>
    </section>
  )
}
