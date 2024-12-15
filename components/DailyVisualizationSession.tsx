

const Session = ({
  dateExtent,
  browsingEvents,
  activitySpans,
  blurSpans,
  yExtent,
  columnIndex,
  yScale,
  xScale,
  width,
  gutter,
  messageBarWidthScale,
  chatSlices,
}) => {
  const x = xScale(columnIndex);
  const height = yExtent[1] - yExtent[0];
  return (
    <g
      className={`DailyVisualizationSession`}
    >
      <rect
        x={x + gutter}
        y={yExtent[0]}
        width={width - gutter}
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
                  x={gutter}
                  y={0}
                  height={Math.abs(endY - startY)}
                  width={(width) / 2 - gutter}
                  stroke={'white'}
                  strokeWidth={.5}
                />
              </g>
            )
          })
        }
      </g>
      <g className="blur-spans-layer">
        {
          blurSpans.map(({
            startY,
            endY,
            start,
            end
          }) => {
            return (
              <g
                key={startY}
                className={`blur-span`}
                transform={`translate(${x + width / 2}, ${startY})`}
              >
                <rect
                  data-tooltip-id="daily-vis-tooltip"
                  data-tooltip-content={`Sur un autre onglet de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`}
                  x={gutter}
                  y={0}
                  height={Math.abs(endY - startY)}
                  width={(width) / 2 - gutter}
                  stroke={'white'}
                  strokeWidth={.5}
                  fill={`url(#diag-hatch-${startY})`}
                />
                <pattern id={`diag-hatch-${startY}`} patternUnits="userSpaceOnUse" patternTransform={`rotate(45 0 0)`} width={3} height="3">
                  <line
                    x1="0" y1="0" x2="0" y2="10"
                    style={{
                      stroke: 'grey',
                      strokeWidth: 0.5
                    }}
                  />
                </pattern>
              </g>
            )
          })
        }
      </g>
      <g className="chat-slices-layer">
        {
          chatSlices.map(({
            startY,
            endY,
            start,
            end,
            messagesCount,
            platform,
            timeSpan
          }) => {
            const span = (end - start);
            const coeff = span / timeSpan;
            const relativeCount = messagesCount / coeff;
            // console.log({span, timeSpan, coeff, messagesCount, relativeCount})
            return (
              <g
                key={startY}
                className={`chat-slice  ${platform}`}
                transform={`translate(${x + width / 2}, ${startY})`}
              >
                <rect
                  data-tooltip-id="daily-vis-tooltip"
                  data-tooltip-content={`${messagesCount} messages sur le chat de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`}
                  x={gutter}
                  y={0}
                  height={Math.abs(endY - startY - 1)}
                  // width={messageBarWidthScale(messagesCount)}
                  width={messageBarWidthScale(relativeCount)}
                  stroke={'none'}
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
            metadata = {},
            date,
            url,
            viewType,
            endY,
            y
          }) => {
            const label = `${metadata.title} (${viewType} ${platform})`;
            const tooltipHTML = `<ul class="event-tooltip-content">
            ${
              Object.entries(metadata).map(([key, value]) => `
              <li>
                <em>${key}</em><code>${JSON.stringify(value)}</code>
              </li>
              `).join('\n')
            }
            </ul>`
            return (
              <g
                key={id}
                className={`browsing-event ${platform}`}
                transform={`translate(${x + gutter}, ${y})`}
              >
                <line
                  x1={width / 2}
                  x2={width / 2}
                  y1={0}
                  y2={endY - y}
                  className={`browsing-event-duration-line`}
                />
                <circle
                  cx={width / 2}
                  cy={0}
                  r={5}
                  className={`browsing-event-circle`}
                />

                <foreignObject
                  x={0}
                  y={-5}
                  width={(width - gutter) / 2}
                  height={window.innerHeight}
                // style={{pointerEvents: 'none'}}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="event-label"
                    data-tooltip-id={'daily-vis-tooltip'}
                    data-tooltip-html={tooltipHTML}
                  >
                    {label}
                  </div>
                </foreignObject>



                {/* <text
                  textAnchor="start"
                  x={width/2 + 10}
                  y={3}

                >
                  {new Date(date).toLocaleTimeString()}
                </text> */}
              </g>
            )
          })
        }
      </g>

    </g>
  )
}
export default Session;