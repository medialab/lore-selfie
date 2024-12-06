import { useMemo, useState } from "react";
import { scaleLinear } from 'd3-scale';
import { extent, max } from 'd3-array';
import Slider from 'rc-slider';
import { Tooltip } from 'react-tooltip';

import 'react-tooltip/dist/react-tooltip.css'
import 'rc-slider/assets/index.css';

import Session from './DailyVisualizationSession'

const MIN_ZOOM = .8;

function DayVisualization({
  sessions = new Map(),
  date,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [roundDay, setRoundDay] = useState(false);
  const datesDomain = useMemo(() => {
    let min, max;
    if (roundDay) {
      const midnight = date;
      midnight.setHours(0);
      min = midnight.getTime();
      let nextDay = midnight.getTime();
      nextDay = nextDay + 23 * 3600 * 1000;
      // let max = min;
      max = nextDay;
      for (let events of sessions.values()) {
        events.forEach(({ date }) => {
          const dateTime = new Date(date).getTime();
          if (dateTime > max) {
            max = dateTime;
          }
        })
      }
    } else {
      min = Infinity;
      max = -Infinity;
      for (let events of sessions.values()) {
        events.forEach(({ date }) => {
          const dateTime = new Date(date).getTime();
          if (dateTime > max) {
            max = dateTime;
          }
          if (dateTime < min) {
            min = dateTime;
          }
        })
      }
      min = new Date(min)
      min.setMinutes(0);
      min.setSeconds(0);

      max = new Date(max)
      max.setHours(max.getHours() + 1);
      max.setMinutes(0);
      max.setSeconds(0);

      min = min.getTime();
      max = max.getTime();
    }

    return [min, max]
  }, [date, sessions, roundDay]);
  const visualizationHeight = useMemo(() => {
    return window.innerHeight * zoomLevel;
  }, [zoomLevel, window.innerHeight]);
  const visualizationWidth = window.innerWidth - 20;
  const gutter = 50;
  const yScale = useMemo(() => {
    return scaleLinear()
      .domain(datesDomain)
      .range([gutter, visualizationHeight - gutter])
  }, [datesDomain, gutter, visualizationHeight]);

  const hoursTicks = useMemo(() => {
    const hour = 3600 * 1000;
    const ticks = [];
    for (let t = datesDomain[0]; t <= datesDomain[1] + hour; t += hour) {
      ticks.push({
        date: t,
        label: new Date(t).toLocaleTimeString(),
        y: yScale(t)
      })
    }
    return ticks;
  }, [datesDomain, yScale]);
  const computedSessions = useMemo(() => {
    const computed = [];
    for (let [sessionId, events] of sessions.entries()) {
      const dateExtent = extent(events.map(e => new Date(e.date).getTime()));
      // set column
      let columnIndex = 0;
      computed.forEach(prevComputed => {
        const [prevMin, prevMax] = prevComputed.dateExtent;
        const [min, max] = dateExtent;
        let overlaps = false;
        if (min < prevMax && max > prevMax && prevComputed.columnIndex === columnIndex) {
          overlaps = true;
        }
        if (overlaps) {
          columnIndex += 1;
        }
      })
      // focused spans
      // activity spans
      const activityEvents = events.filter(event => event.type === 'POINTER_ACTIVITY_RECORD' && event.activityScore === 1);
      const activitySpans = activityEvents.reduce((current, activityEvent) => {
        const end = new Date(activityEvent.date).getTime();
        const start = end - activityEvent.timeSpan;
        // return [...current, {start, end}]
        if (!current.length) {
          return [{ start, end }]
        } else if (start > current[current.length - 1].start && start <= current[current.length - 1].end) {
          current[current.length - 1].end = end;
          return current;
        } else {
          return [...current, { start, end }]
        }
      }, [])
        .map(({ start, end }) => ({
          start,
          end,
          startY: yScale(start),
          endY: yScale(end),
        }))
      // browse events
      const browsingEvents = events.filter(event => event.type === 'BROWSE_VIEW')
        .map(({ platform, metadata, date, url, viewType, id }) => {
          const y = yScale(new Date(date).getTime());
          return {
            platform,
            id,
            metadata,
            date,
            url,
            viewType,
            y
          }
        })
      computed.push({
        id: sessionId,
        dateExtent,
        yExtent: dateExtent.map(d => yScale(d)),
        columnIndex,
        browsingEvents,
        activitySpans,
      })
    }
    return computed;
  }, [sessions, yScale]);

  const maxColumnIndex = useMemo(() => max(computedSessions.map(c => c.columnIndex)), [computedSessions]);
  const columnsRange = useMemo(() => [gutter * 2, visualizationWidth - gutter], [visualizationWidth, gutter]);
  const columnWidth = useMemo(() => (columnsRange[1] - columnsRange[0]) / (maxColumnIndex + 1), [columnsRange, maxColumnIndex]);
  const xScale = useMemo(() => {
    return maxColumnIndex === 0 ?
      () => columnsRange[0]
      : scaleLinear()
        .domain([0, maxColumnIndex])
        .range(columnsRange)
  }, [visualizationWidth, gutter, maxColumnIndex, columnsRange]);

  return (
    <div className="DayVisualization">
      <div className="ui">
        <div>
          <span>Zoom</span>
          <button disabled={zoomLevel === MIN_ZOOM} onMouseDown={() => {
            let newZoomLevel = zoomLevel / 1.05;
            if (newZoomLevel < MIN_ZOOM) {
              newZoomLevel = MIN_ZOOM;
            }
            setZoomLevel(newZoomLevel)
          }}>-</button>
          <button onMouseDown={() => {
            setZoomLevel(zoomLevel * 1.05)
          }}>+</button>
          <button onMouseDown={() => {
            setZoomLevel(1)
          }}>reset</button>
          <div
            style={{
              position: 'relative',
              width: '50%'
            }}
          >
            <Slider
              step={0.5}
              min={0.5}
              max={10}
              onChange={(value) => {
                setZoomLevel(value)
              }}
              value={zoomLevel}
            />
          </div>

        </div>
        <div>
          <span>Visualiser</span>
          <button
            className={`${roundDay ? '' : 'active'}`}
            onClick={() => setRoundDay(false)}
          >
            Sur les créneaux de la journée enregistrés uniquement
          </button>
          <button
            className={`${roundDay ? 'active' : ''}`}
            onClick={() => setRoundDay(true)}
          >
            Sur toute la journée
          </button>
        </div>
      </div>
      <svg width={visualizationWidth} height={visualizationHeight}>
        {/* <rect x={0} y={0} width={visualizationWidth} height={visualizationHeight} fill="lightgrey" /> */}
        <g className="time-ticks">
          {
            hoursTicks.map(({ date, label, y }, tickIndex) => {
              return (
                <g className="tick-group"
                  key={tickIndex}
                  transform={`translate(0, ${y})`}
                >
                  <line
                    stroke="grey"
                    x1={gutter * 2}
                    x2={visualizationWidth}
                    y1={0}
                    y2={0}
                    strokeDasharray={'5,5'}
                  />
                  <text
                    textAnchor="end"
                    x={gutter * 1.5}
                    y={0}
                  >
                    {label}
                  </text>
                </g>
              )
            })
          }
        </g>
        <g className="sessions-container">
          {
            computedSessions.map(session => {
              return (
                <Session
                  key={session.id}
                  {...{
                    ...session,
                    yScale,
                    xScale,
                    width: columnWidth
                  }
                  }
                />
              )
            })
          }
        </g>
      </svg>
      <Tooltip id="daily-vis-tooltip" />
    </div>
  )
}

export default DayVisualization;