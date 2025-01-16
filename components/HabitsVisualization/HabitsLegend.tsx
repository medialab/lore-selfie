import { PLATFORMS_COLORS } from "~constants"

function HabitsLegend() {
  return (
    <ul className="legend-container">
      {Object.entries(PLATFORMS_COLORS).map(([id, color]) => {
        const markerDimension = 10
        return (
          <li key={id}>
            <svg width={markerDimension} height={markerDimension}>
              <rect
                x={0}
                y={0}
                width={markerDimension}
                height={markerDimension}
                fill={color}
              />
            </svg>
            <div className={"legend-label"}>{id}</div>
          </li>
        )
      })}
    </ul>
  )
}

export default HabitsLegend
