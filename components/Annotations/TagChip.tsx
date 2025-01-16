import type { Tag } from "~types/annotations"

interface TagChipProps {
  tag: Tag
}
export default function TagChip({
  tag = { id: "", color: "black", name: "", description: "" }
}: TagChipProps) {
  const { id, color, description, name } = tag
  return (
    <div className="TagChip">
      <div className="chip-content">
        <div className="color-marker" style={{ background: color }} />
        <label>{name}</label>
      </div>
    </div>
  )
}
