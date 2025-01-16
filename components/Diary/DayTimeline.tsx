import { useMemo } from "react"
import { inferTickTimespan, timeOfDayToMs } from "~helpers"
import { scaleLinear } from 'd3-scale';
import { BROWSE_VIEW, LIVE_USER_ACTIVITY_RECORD, PLATFORMS_COLORS, DAY_IN_MS } from "~constants";
import type { CaptureEventsList } from "~types/captureEventsTypes";
import type { ChannelsMapItem, ContentsMapItem } from "~types/common";

interface DayTimelineProps {
  width: number
  height: number
  timeOfDaySpan: [string, string]
  date: number
  format: string
  imposed: boolean
  channelsMap: Map<string, ChannelsMapItem>
  contentsMap: Map<string, ContentsMapItem>
  annotationColumnsNames: Array<string>
  events: CaptureEventsList
}
export default function DayTimeline({
  width: inputWidth,
  height: inputHeight,
  timeOfDaySpan,
  date,
  format,
  imposed,
  channelsMap,
  contentsMap,
  annotationColumnsNames,
  events,
}: DayTimelineProps) {
  // @todo solve this non-sensical mystery with page dimensions
  const width = imposed ? inputWidth * 1.666 : format === 'A5' ? inputWidth * .8 : inputWidth * 1;
  const height = imposed ? inputHeight * 1.666 : format === 'A5' ? inputHeight * .8 : inputHeight * 1;

  const tickTimespan: number = useMemo(() => {
    const inMs = timeOfDaySpan.map(timeOfDayToMs);
    return inferTickTimespan(Math.abs(inMs[1] - inMs[0]))
  }, [timeOfDaySpan]);
  const { tickValues, minDate, maxDate } = useMemo(() => {
    let [fromTimeInMs, toTimeInMs] = timeOfDaySpan.map(timeOfDayToMs);
    // if end time is smaller than start time add a day

    if (toTimeInMs < fromTimeInMs) {
      toTimeInMs += DAY_IN_MS;
    }
    const realStartInMs = date + fromTimeInMs;
    const realEndInMs = date + toTimeInMs;
    const niceStartInMs = realStartInMs - realStartInMs % tickTimespan;
    const niceEndInMs = realEndInMs % tickTimespan === 0 ? realEndInMs : realEndInMs - realEndInMs % tickTimespan + tickTimespan;
    const ticks = [];
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
  const marginsStart = width - width * annotationColumnsNames.length * .2;
  const vizSpaceX: [number, number] = useMemo(() => [ticksX + gutter * 4, marginsStart], [ticksX, marginsStart, gutter]);

  const yScale = useMemo(() => {
    return scaleLinear()
      .domain([minDate, maxDate])
      .range([topGutter, height - gutter * 7])
  }, [minDate, maxDate, height, topGutter]);

  const vizSequences = useMemo(() => {
    const yTimeSpan = yScale.domain()[1] - yScale.domain()[0];
    const minYDist = yTimeSpan / 20;
    let sequences = [];
    events.forEach(event => {
      if (event.type === BROWSE_VIEW && contentsMap.has(event.url)) {
        sequences.push({
          start: new Date(event.date),
          injectionId: event.injectionId,
          // end: new Date(event.date),
          liveRecords: [],
          contentData: contentsMap.get(event.url)
        })
      } else if (event.type === LIVE_USER_ACTIVITY_RECORD) {
        if (sequences.length && event.injectionId === sequences[sequences.length - 1].injectionId) {
          // console.log('add live record')
          sequences[sequences.length - 1].liveRecords.push(event);
        } else if (sequences.length) {
          // console.log(event.injectionId, sequences[sequences.length - 1].injectionId)
        }
      }
    });
    // compute time spans
    sequences = sequences.map(sequence => {
      const end = sequence.liveRecords.length ? new Date(sequence.liveRecords[sequence.liveRecords.length - 1].date) : sequence.start;
      return {
        ...sequence,
        end,
        dateExtent: [sequence.start, end],
      }
    });
    const computed = [];
    for (let i = 0 ; i < sequences.length ; i++) {
      let columnIndex = 0;
      const thatSequence = sequences[i];
      const {dateExtent} = thatSequence;
      // set column
      computed.forEach(prevComputed => {
        // console.log('prev computed', prevComputed)
        const [prevMin, prevMax] = prevComputed.dateExtent;
        const [min, max] = dateExtent;
        let overlaps = false;
        if (
          // time conditions
          (
            (min < prevMax && max > prevMax) 
            ||
            (min - prevMin < minYDist)
          )
          // same column
          && prevComputed.columnIndex === columnIndex) {
          overlaps = true;
        } else if (min > prevMin && max < prevMax) {
          overlaps = true;
        }
        if (overlaps) {
          columnIndex += 1;
        }
      });
      computed.push({
        ...thatSequence,
        columnIndex,
      })
    }
    return computed;
  }, [events, contentsMap, channelsMap, yScale]);

  const numberOfVizColumns:number = useMemo(() => Math.max(...vizSequences.map(v => v.columnIndex)) + 1, [vizSequences]);
  const xScale = useMemo(() => scaleLinear().domain([0, numberOfVizColumns]).range(vizSpaceX), [numberOfVizColumns, vizSpaceX])
  

  const marginsFields:Array<string> = annotationColumnsNames;
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
    });


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
                    // @ts-ignore
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
      <g className="sequences-container">
        {
          vizSequences.map(({start, end, contentData, columnIndex}, i) => {
            const {index, channel, platform, title, url} = contentData;
            const y1 = yScale(start.getTime());
            const y2 = yScale(end.getTime());
            const x = xScale(columnIndex);
            return (
              <g 
                className="sequence"
                key={i}
                transform={`translate(${x}, ${y1})`}
              >
                <line
                  stroke={'lightgrey'}
                  strokeDasharray={'5 2'}
                  x1={0}
                  x2={vizSpaceX[1] - x}
                  y1={0}
                  y2={0}
                />
                 <line
                  stroke={PLATFORMS_COLORS[platform]}
                  x1={0}
                  x2={0}
                  y1={0}
                  y2={y2 - y1}
                />
                <line
                  stroke={PLATFORMS_COLORS[platform]}
                  x1={-5}
                  x2={5}
                  y1={y2 - y1}
                  y2={y2 - y1}
                />
                <circle
                  fill={PLATFORMS_COLORS[platform]}
                  cx={0}
                  cy={0}
                  r={10}
                />
                <text
                  fill="white"
                  x={0}
                  y={3}
                  fontSize={10}
                  textAnchor="middle"
                >
                  {index}
                </text>
              </g>
            )
          })
        }
      </g>
    </svg>
  )
}