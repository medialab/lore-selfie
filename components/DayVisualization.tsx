import { useEffect, useMemo, useState } from "react";
import { scaleLinear } from 'd3-scale';
import { extent, max } from 'd3-array';
import { Tooltip } from 'react-tooltip';
import { useInterval } from 'usehooks-ts'
import { inferTickTimespan } from 'helpers';

import 'react-tooltip/dist/react-tooltip.css'

import Session from './DailyVisualizationSession'
import { BLUR_TAB, BROWSE_VIEW, FOCUS_TAB, LIVE_USER_ACTIVITY_RECORD } from "~constants";

function DayVisualization({
  sessions = new Map(),
  date,
  zoomLevel,
  roundDay,
  width,
  height,
  contentsMap, channelsMap,
}) {
  const [nowLineY, setNowLineY] = useState();
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
    return height * 2 * zoomLevel;
  }, [zoomLevel, height]);
  const visualizationWidth = width - 20;
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
      });
      const playingSpans = [];
      let isPlaying = false;
      const focusSpans = [];
      let isFocused = false;
      const activeSpans = [];
      let isActive = false;
      events.forEach(event => {
        switch (event.type) {
          case FOCUS_TAB:
          case BROWSE_VIEW:
            if (!isFocused) {
              isFocused = true;
              focusSpans.push({ start: new Date(event.date) })
            }
            break;
          case BLUR_TAB:
            if (isFocused) {
              isFocused = false;
              if (focusSpans.length) {
                focusSpans[focusSpans.length - 1].end = new Date(event.date);
              }
            }
            break;
          case LIVE_USER_ACTIVITY_RECORD:
            if (event.isPlaying && !isPlaying) {
              isPlaying = true;
              playingSpans.push({ start: new Date(event.date) })
            } else if (!event.isPlaying && isPlaying) {
              isPlaying = false;
              if (playingSpans.length) {
                playingSpans[playingSpans.length - 1].end = new Date(event.date);
              }
            }
            if (event.hasFocus && !isFocused) {
              isFocused = true;
              focusSpans.push({ start: new Date(event.date) })
            } else if (!event.isPlaying && isPlaying) {
              isFocused = false;
              if (focusSpans.length) {
                focusSpans[focusSpans.length - 1].end = new Date(event.date);
              }
            }
            if (event.pointerActivityScore && !isActive) {
              isActive = true;
              activeSpans.push({ start: new Date(event.date) })
            } else if (!event.pointerActivityScore && isActive) {
              isActive = false;
              if (activeSpans.length) {
                activeSpans[activeSpans.length - 1].end = new Date(event.date);
              }
            }
            break;
          default:
            break;
        }
      });
      // browse events
      let browsingEvents = events.filter(event => event.type === BROWSE_VIEW)
        .map(({ platform, metadata, date, url, viewType, id }) => {
          const y = yScale(new Date(date).getTime());
          const computedContents = contentsMap.get(url);
          // console.log('contents', thatContents);
          return {
            platform,
            id,
            metadata,
            computedContents,
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
            platform: event.platform,
            timeSpan: event.timeSpan,

          }
        })

      computed.push({
        id: sessionId,
        dateExtent,
        yExtent: dateExtent.map(d => yScale(d)),
        columnIndex,
        browsingEvents,
        // //
        // activitySpans,
        // blurSpans,
        //
        playingSpans: playingSpans.map(d => ({ ...d, startY: yScale(d.start), endY: yScale(d.end) })),
        focusSpans: focusSpans.map(d => ({ ...d, startY: yScale(d.start), endY: yScale(d.end) })),
        activeSpans: activeSpans.map(d => ({ ...d, startY: yScale(d.start), endY: yScale(d.end) })),
        //
        chatSlices,
      })
    }
    return computed;
  }, [sessions, yScale, contentsMap, channelsMap]);
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
      .range([0, columnWidth - gutter])
  }, [maxChatMessagesNumber, columnWidth]);

  const updateNowLineY = useMemo(() => () => {
    const now = new Date().getTime();
    if (now > datesDomain[0] && now < datesDomain[1]) {
      const nowY = yScale(now);
      setNowLineY(nowY);
    } else if (nowLineY !== undefined) {
      setNowLineY(undefined);
    }
  }, [datesDomain, setNowLineY, yScale, datesDomain]);

  useInterval(
    () => {
      updateNowLineY();
    },
    10000,
  )
  useEffect(() => updateNowLineY(), [datesDomain, yScale])

  const spansSettings = {
    activity: {
      color: 'red',
      markType: 'regular',
      tooltipFn: ({start, end}) => `Était de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    },
    playing: {
      color: 'green',
      markType: 'reverse',
      tooltipFn: ({start, end}) => `A joué le média de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    },
    focus: {
      color: 'blue',
      markType: 'points',
      tooltipFn: ({start, end}) => `Avait l'onglet visible de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    },
  }
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
                    spansSettings,
                  }
                  }
                />
              )
            })
          }
        </g>

        {
          nowLineY ?
            <line
              y1={nowLineY}
              y2={nowLineY}
              x1={gutter * 2}
              x2={visualizationWidth}
              stroke="red"
            />
            : null
        }

        {
          Object.entries(spansSettings).map(([value, {color, markType}], index) => (
            <pattern key={index} id={`diagonalHatch-for-${value}`} patternUnits="userSpaceOnUse" width="4" height="4">
              {
                markType === 'regular' || markType === 'reverse' ?
                <path 
                d={
                  markType === 'regular' ? 
                  `M-1,1 l2,-2
                      M0,4 l4,-4
                      M3,5 l2,-2`
                  : `M1,1 l2,-2
                      M0,4 l4,-4
                      M3,5 l2,-2`}
                style={{ stroke: color, opacity: 1, strokeWidth: 1, transform: markType === 'regular' ? '' : 'scale(1)' }} />
                : 
                <circle  cx={0} cy={0} r={1} fill="transparent"
                style={{ stroke: color, opacity: 1, strokeWidth: 1 }} />
              }
              
            </pattern>
          ))
        }
      </svg>
      <Tooltip id="daily-vis-tooltip" />
    </>
  )
}

export default DayVisualization;