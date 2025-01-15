import { useMemo, useState, useEffect } from "react";
import 'rc-slider/assets/index.css';

import Measure from 'react-measure';
import { useRef } from 'react';

import DayVisualization from "./DayVisualization"

import "~/styles/Daily.scss";

function Daily({
  displayedDayDate,
  visibleEvents,
  zoomLevel,
  roundDay,
  contentsMap,
  channelsMap,
  spansSettings,
}) {
  let dailyRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(100);
  // console.log('daily ref', dailyRef.current?.scrollTop);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });

  const [prevOffset, setPrevOffset] = useState(offset);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setPrevOffset(offset);
  //   }, 500)
  // }, [offset])

  useEffect(() => {
    const newScrollHeight = dailyRef.current.scrollHeight;

    const ratio = (prevOffset) / scrollHeight;
    if (ratio < 1) {
      const newOffset = ratio * newScrollHeight;
      if (dailyRef.current) {
        dailyRef.current.scrollTo({
          top: newOffset,
        });
      }
    }

  }, [zoomLevel])

  useEffect(() => {
    const onScroll = () => {
      setPrevOffset(offset);
      setOffset(dailyRef.current?.scrollTop);
    }
    // clean up code
    dailyRef.current?.removeEventListener('scroll', onScroll);
    dailyRef.current?.addEventListener('scroll', onScroll, { passive: true });
    return () => dailyRef.current?.removeEventListener('scroll', onScroll);
  }, [dailyRef, offset]);

  useEffect(() => {
    if (dailyRef.current) {
      // console.log('update scroll height', dailyRef.current.scrollHeight)
      setScrollHeight(dailyRef.current.scrollHeight);
    }
  }, [dailyRef, dimensions.height,])

  const currentDaySessions = useMemo(() => {
    if (visibleEvents) {
      const sessions = new Map();
      visibleEvents.forEach(event => {
        const { injectionId } = event;
        if (!sessions.has(injectionId)) {
          sessions.set(injectionId, [event])
        } else {
          sessions.set(injectionId, [...sessions.get(injectionId), event])
        }
      })
      return sessions;
    }
  }, [visibleEvents]);

  // const datesDomain = useMemo(() => {
  //   const date = new Date(displayedDayDate);
  //   let min, max;
  //   if (roundDay) {
  //     const midnight = date;
  //     midnight.setHours(0);
  //     min = midnight.getTime();
  //     let nextDay = midnight.getTime();
  //     nextDay = nextDay + 23 * 3600 * 1000;
  //     // let max = min;
  //     max = nextDay;
  //     for (let events of currentDaySessions.values()) {
  //       events.forEach(({ date }) => {
  //         const dateTime = new Date(date).getTime();
  //         if (dateTime > max) {
  //           max = dateTime;
  //         }
  //       })
  //     }
  //   } else {
  //     min = Infinity;
  //     max = -Infinity;
  //     for (let events of currentDaySessions.values()) {
  //       events.forEach(({ date }) => {
  //         const dateTime = new Date(date).getTime();
  //         if (dateTime > max) {
  //           max = dateTime;
  //         }
  //         if (dateTime < min) {
  //           min = dateTime;
  //         }
  //       })
  //     }
  //     const inferedTickTimeSpan = inferTickTimespan(max - min, zoomLevel);
  //     min = min - min % inferedTickTimeSpan;
  //     max = max - max % inferedTickTimeSpan + inferedTickTimeSpan;
  //   }
  //   return [min, max]
  // }, [displayedDayDate, currentDaySessions, roundDay, zoomLevel]);

  // const scrollScale = useMemo(() => scaleLinear().range(datesDomain).domain([0, scrollHeight]), [datesDomain, scrollHeight]);


  // const [prevZoomLevel, setPrevZoomLevel] = useState(zoomLevel);

  return (
    <Measure
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
      innerRef={dailyRef}
    >
      {({ measureRef }) => {

        return (
          <div ref={measureRef} className="Daily">
            {
              currentDaySessions ?
                <DayVisualization
                  sessions={currentDaySessions}
                  date={new Date(displayedDayDate)}
                  {...{
                    zoomLevel,
                    roundDay,
                    width: dimensions.width,
                    height: dimensions.height,
                    contentsMap, channelsMap,
                    spansSettings
                  }}
                />
                : null
            }

          </div>
        )
      }}
    </Measure>
  )
}

export default Daily;