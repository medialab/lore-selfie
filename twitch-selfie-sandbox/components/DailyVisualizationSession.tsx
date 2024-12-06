

const Session = ({
  dateExtent,
  browsingEvents,
  activitySpans,
  yExtent,
  columnIndex,
  yScale,
  xScale,
  width
}) => {
  const x = xScale(columnIndex);
  const height = yExtent[1] - yExtent[0];
  return (
    <g
      className="DailyVisualizationSession"
    >
      <rect
        x={x}
        y={yExtent[0]}
        width={width}
        height={height}
        className="session-background"
      />
      <g className="activity-spans-layer">
        {
          activitySpans.map(({
            startY,
            endY,
            start,
            end
          }) => {
            return (
              <g
                key={startY}
                className={`activity-span`}
                transform={`translate(${x + width / 2}, ${startY})`}
              >
                <rect
                  data-tooltip-id="daily-vis-tooltip"
                  data-tooltip-content={`Actif de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`}
                  x={0}
                  y={0}
                  height={Math.abs(endY - startY)}
                  width={width / 2}
                  stroke={'white'}
                  strokeWidth={.5}
                />
              </g>
            )
          })
        }
      </g>
      <g className="browing-events-layer">
        {
          browsingEvents.map(({
            platform,
            id,
            metadata,
            date,
            url,
            viewType,
            y
          }) => {
            return (
              <g
                key={id}
                className={`browsing-event ${platform}`}
                transform={`translate(${x + width / 2}, ${y})`}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={5}
                  className={`browsing-event-circle`}
                />
                <text
                  textAnchor="end"
                  x={-10}
                  y={3}

                >
                  {metadata.title} ({viewType})
                </text>
                <text
                  textAnchor="start"
                  x={10}
                  y={3}

                >
                  {new Date(date).toLocaleTimeString()}
                </text>
              </g>
            )
          })
        }
      </g>

    </g>
  )
}
export default Session;