


export default function TagChip({tag = {}}) {
  const { id, color, description, name } = tag;
  return (
    <div className="TagChip">
      <div className="chip-content">
      <div className="color-marker" style={{ background: color }} />
      <label>{name}</label>
      </div>
    </div>
  )
}