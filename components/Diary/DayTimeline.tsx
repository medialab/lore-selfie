import { useMemo } from "react"
import { inferTickTimespan, timeOfDayToMs } from "~helpers"
import { scaleLinear } from 'd3-scale';
import Measure from 'react-measure';

const DAY = 24 * 3600 * 1000;

export default function DayTimeline({
  width: inputWidth,
  height: inputHeight,
  timeOfDaySpan,
  date,
  format,
  imposed,
}) {
  // @todo solve this non-sensical mystery
  const width = imposed ? inputWidth * 1.666 : format === 'A5' ? inputWidth * .8 : inputWidth * 1;
  const height = imposed ? inputHeight * 1.666 : format === 'A5' ? inputHeight * .8 : inputHeight * 1;
  const tickTimespan = useMemo(() => {
    const inMs = timeOfDaySpan.map(timeOfDayToMs);
    return inferTickTimespan(Math.abs(inMs[1] - inMs[0]))
  }, [timeOfDaySpan]);
  const { tickValues, minDate, maxDate } = useMemo(() => {
    let [fromTimeInMs, toTimeInMs] = timeOfDaySpan.map(timeOfDayToMs);
    // if end time is smaller than start time add a day

    if (toTimeInMs < fromTimeInMs) {
      toTimeInMs += DAY;
    }
    const realStartInMs = date + fromTimeInMs;
    const realEndInMs = date + toTimeInMs;
    const niceStartInMs = realStartInMs - realStartInMs % tickTimespan;
    const niceEndInMs = realEndInMs % tickTimespan === 0 ? realEndInMs : realEndInMs - realEndInMs % tickTimespan + tickTimespan;
    let ticks = [];
    for (let t = niceStartInMs; t <= niceEndInMs + 1; t += tickTimespan) {
      ticks.push(t);
    }
    return {
      tickValues: ticks.map(t => {
        const d = new Date(t);
        return {
          date: d,
          value: t,
          label: d.toLocaleTimeString().split(':').slice(0, 2).join(':')
        }
      }),
      minDate: niceStartInMs,
      maxDate: niceEndInMs
    }
  }, [date, timeOfDaySpan, tickTimespan]);

  const topGutter = 50;
  const gutter = 5;
  const ticksX = 40;
  const marginsStart = width * .4;
  const vizSpaceX = [ticksX, marginsStart];

  const marginsFields = ['moments', 'sentiments', 'projections']
  const marginsData = marginsFields
    .map((label, index) => {
      const totalWidth = width - marginsStart;
      const displacement = index * (totalWidth / marginsFields.length);
      const x = marginsStart + displacement;
      return {
        x,
        label,
        width: totalWidth / marginsFields.length
      }
    })

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([minDate, maxDate])
      .range([topGutter, height - gutter * 7])
  }, [minDate, maxDate, height, topGutter]);


  // console.log('tick timespan', tickValues.map(t => t.label))
  return (
    <svg
      className="DayTimeline"

      width={width}
      height={height}

      viewBox={`"0 0 ${width} ${height}`}

    >
      {/* <rect
        fill="blue"
        x={0}
        y={0}
        width={width}
        height={height}
      /> */}
      <g className="ticks y-ticks">
        {
          tickValues.map(({ value, label }) => {
            const y = yScale(value);
            return (
              <g className="tick-group y-tick-group"
                key={value}
                transform={`translate(0, ${y})`}
              >
                <text x={ticksX} y={gutter - 1} fontSize={gutter * 2} textAnchor={'end'}>
                  {label}
                </text>
                <line
                  x1={ticksX + gutter}
                  x2={width}
                  y1={0}
                  y2={0}
                />
              </g>
            )
          })
        }
      </g>
      <g className="margins">
        {
          marginsData.map(({ x, label, width: columnWidth }, index) => {
            return (
              <g
                key={label}
                className="margins-group"
                transform={`translate(${x}, 0)`}
              >
                <foreignObject
                  x={0}
                  y={0}
                  width={columnWidth}
                  height={topGutter}
                // style={{pointerEvents: 'none'}}
                >
                  <h4
                    xmlns="http://www.w3.org/1999/xhtml"
                  >
                    <span>
                    {label}
                    </span>
                  </h4>
                </foreignObject>
                <line
                  stroke="black"
                  x1={0}
                  x2={0}
                  y1={gutter * 4}
                  y2={yScale.range()[1]}
                />
                {
                  index === marginsData.length - 1 ?
                    <line
                      stroke="black"
                      x1={columnWidth}
                      x2={columnWidth}
                      y1={gutter * 4}
                      y2={yScale.range()[1]}
                    />
                    : null
                }
              </g>
            )
          })
        }
      </g>
    </svg>
  )
}