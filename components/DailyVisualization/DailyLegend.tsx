import type { SpansSettings } from "~types/common"

interface DailyLegendProps {
  spansSettings: SpansSettings
}

function DailyLegend({ spansSettings }: DailyLegendProps) {
  return (
    <ul className="legend-container">
      {Object.entries(spansSettings).map(([id, { legendLabel }]) => {
        const markerDimension = 10
        return (
          <li key={id}>
            <svg width={markerDimension} height={markerDimension}>
              <rect
                x={0}
                y={0}
                width={markerDimension}
                height={markerDimension}
                fill={`url(#diagonalHatch-for-${id})`}
              />
              {Object.entries(spansSettings).map(
                ([value, { color, markType }], index) => (
                  <pattern
                    key={index}
                    id={`diagonalHatch-for-${value}`}
                    patternUnits="userSpaceOnUse"
                    width="4"
                    height="4">
                    {markType === "regular" || markType === "reverse" ? (
                      <path
                        d={
                          markType === "regular"
                            ? `M-1,1 l2,-2
                      M0,4 l4,-4
                      M3,5 l2,-2`
                            : `M1,1 l2,-2
                      M0,4 l4,-4
                      M3,5 l2,-2`
                        }
                        style={{
                          stroke: color,
                          opacity: 1,
                          strokeWidth: 1,
                          transform: markType === "regular" ? "" : "scale(1)"
                        }}
                      />
                    ) : (
                      <circle
                        cx={0}
                        cy={0}
                        r={1}
                        fill="transparent"
                        style={{ stroke: color, opacity: 1, strokeWidth: 1 }}
                      />
                    )}
                  </pattern>
                )
              )}
            </svg>
            <div className={"legend-label"}>{legendLabel}</div>
          </li>
        )
      })}
    </ul>
  )
}

export default DailyLegend
