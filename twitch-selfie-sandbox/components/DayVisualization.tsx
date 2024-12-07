import { useMemo, useState } from "react";
import { scaleLinear } from 'd3-scale';
import { extent, max } from 'd3-array';
import { Tooltip } from 'react-tooltip';

import 'react-tooltip/dist/react-tooltip.css'

import Session from './DailyVisualizationSession'

const MIN_ZOOM = .8;

function inferTickTimespan(timeSpan, zoomLevel) {
  const scale = timeSpan / zoomLevel;
  let span;
  if (scale < 150000) {
    span = 15000;
  } else if (scale < 300000) {
    span = 30000;
  }
  else if (scale < 300000) {
    span = 30000;
  } else if (scale < 600000) {
    span = 60000;
  } else if (scale < 1000000) {
    span = 60000 * 2;
  } else if (scale < 2000000) {
    span = 60000 * 5;
  } else if (scale < 5000000) {
    span = 60000 * 10;
  } else if (scale < 10000000) {
    span = 60000 * 15;
  } else if (scale < 100000000) {
    span = 3600 * 1000;
  } else {
    span = 3600 * 1000 * 3;
  }
  return span;
}

function DayVisualization({
  sessions = new Map(),
  date,
  zoomLevel,
  roundDay
}) {
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
      const inferedTickTimeSpan = inferTickTimespan(max - min, zoomLevel);
      min = min - min % inferedTickTimeSpan;
      max = max - max % inferedTickTimeSpan + inferedTickTimeSpan;

    }

    return [min, max]
  }, [date, sessions, roundDay, zoomLevel]);
  const tickTimeSpan = useMemo(() => inferTickTimespan(datesDomain[1] - datesDomain[0], zoomLevel), [datesDomain, zoomLevel]);
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

  const timeTicks = useMemo(() => {
    // const hour = 3600 * 1000;
    const ticks = [];
    for (let t = datesDomain[0]; t <= datesDomain[1] + tickTimeSpan; t += tickTimeSpan) {
      ticks.push({
        date: t,
        label: new Date(t).toLocaleTimeString(),
        y: yScale(t)
      })
    }
    return ticks;
  }, [datesDomain, yScale, tickTimeSpan]);
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
        } else if (min > prevMin && max < prevMax) {
          overlaps = true;
        }
        if (overlaps) {
          columnIndex += 1;
        }
      })
      // focused spans
      const tabFocusEvents = events.filter(event => event.type === 'FOCUS_TAB' || event.type === 'BLUR_TAB');
      let blurSpans = tabFocusEvents.reduce((current, event) => {
        if (event.type === 'BLUR_TAB') {
          if (!current.length || current[current.length - 1].end !== undefined) {
            const start = new Date(event.date).getTime();
            return [...current, { start }]
          }
        } else if (event.type === 'FOCUS_TAB' && current.length && current[current.length - 1].end === undefined) {
          current[current.length - 1].end = new Date(event.date).getTime();
          return current;
        }
        return current;
      }, []);
      if (blurSpans.length && !blurSpans[blurSpans.length - 1].end) {
        blurSpans[blurSpans.length - 1].end = dateExtent[1]
      }
      blurSpans = blurSpans.map(({ start, end }) => ({
        start,
        end,
        startY: yScale(start),
        endY: yScale(end),
      }))
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
      let browsingEvents = events.filter(event => event.type === 'BROWSE_VIEW')
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
      browsingEvents = browsingEvents
        .map((event, eventIndex) => {
          const next = eventIndex < browsingEvents.length - 1 ? browsingEvents[eventIndex + 1] : undefined;
          if (next) {
            return {
              ...event,
              endDate: next.date,
              endY: next.y
            }
          } else {
            return {
              ...event,
              endDate: dateExtent[1],
              endY: yScale(dateExtent[1])
            }
          }
        });
      let chatSlices = events.filter(event => event.type === 'CHAT_ACTIVITY_RECORD')
      chatSlices = chatSlices
        .map((event, index) => {
          const prev = index > 0 ? chatSlices[index - 1] : undefined;
          const end = new Date(event.date).getTime();
          // const start = end - event.timeSpan;
          const start = prev && prev.url === event.url ? new Date(prev.date).getTime() : end - event.timeSpan;
          return {
            start,
            end,
            startY: yScale(start),
            endY: yScale(end),
            messagesCount: event.messagesCount || event.messages?.length || 0,
            platform: event.platform
          }
        })

      computed.push({
        id: sessionId,
        dateExtent,
        yExtent: dateExtent.map(d => yScale(d)),
        columnIndex,
        browsingEvents,
        activitySpans,
        blurSpans,
        chatSlices,
      })
    }
    return computed;
  }, [sessions, yScale]);
  const maxChatMessagesNumber = useMemo(() => {
    return max(
      computedSessions.reduce((allCounts, session) => [...allCounts, ...session.chatSlices.map(m => m.messagesCount)], [])
    )
  }, [computedSessions]);

  const maxColumnIndex = useMemo(() => max(computedSessions.map(c => c.columnIndex)), [computedSessions]);
  const columnsRange = useMemo(() => [gutter * 2, visualizationWidth - gutter], [visualizationWidth, gutter]);
  const columnWidth = useMemo(() => (columnsRange[1] - columnsRange[0]) / (maxColumnIndex + 1), [columnsRange, maxColumnIndex]);
  const xScale = useMemo(() => {
    return maxColumnIndex === 0 ?
      () => columnsRange[0]
      : scaleLinear()
        .domain([0, maxColumnIndex + 1])
        .range(columnsRange)
  }, [visualizationWidth, gutter, maxColumnIndex, columnsRange]);
  const messageBarWidthScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxChatMessagesNumber])
      .range([0, columnWidth / 2 - gutter])
  }, [maxChatMessagesNumber, columnWidth])

  return (
    <>
      <svg className="DayVisualization" width={visualizationWidth} height={visualizationHeight}>
        {/* <rect x={0} y={0} width={visualizationWidth} height={visualizationHeight} fill="lightgrey" /> */}
        <g className="time-ticks">
          {
            timeTicks.map(({ date, label, y }, tickIndex) => {
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
                    width: columnWidth,
                    gutter,
                    messageBarWidthScale,
                  }
                  }
                />
              )
            })
          }
        </g>

      </svg>
      <Tooltip id="daily-vis-tooltip" />
    </>
  )
}

export default DayVisualization;