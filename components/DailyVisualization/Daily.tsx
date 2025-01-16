import { useMemo, useState, useEffect } from "react";
import Measure from 'react-measure';
import { useRef } from 'react';

import DayVisualization from "./DayVisualization"

import 'rc-slider/assets/index.css';
import "~/styles/Daily.scss";
import type { CaptureEventsList } from "~types/captureEventsTypes";
import type { Dimensions, ChannelsMapItem, ContentsMapItem, SpansSettings } from "~types/common";

interface DailyProps {
  displayedDayDate: Date
  visibleEvents: CaptureEventsList
  zoomLevel: number
  roundDay: boolean
  contentsMap: Map<string, ContentsMapItem>
  channelsMap: Map<string, ChannelsMapItem>
  spansSettings: SpansSettings
}

function Daily({
  displayedDayDate,
  visibleEvents,
  zoomLevel,
  roundDay,
  contentsMap,
  channelsMap,
  spansSettings,
}: DailyProps) {
  let dailyRef = useRef(null);
  const [offset, setOffset] = useState<number>(0);
  const [scrollHeight, setScrollHeight] = useState<number>(100);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 100, height: 100 });
  const [prevOffset, setPrevOffset] = useState<number>(offset);

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

  const currentDaySessions: Map<string, CaptureEventsList> = useMemo(() => {
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
                    contentsMap, 
                    channelsMap,
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