import { useMemo, useState } from "react";
import 'rc-slider/assets/index.css';

import Measure from 'react-measure';

import DayVisualization from "./DayVisualization"

import "../styles/Daily.scss";

function Daily({
  displayedDayDate,
  visibleEvents,
  zoomLevel,
  roundDay,
  contentsMap, 
  channelsMap,
  spansSettings,
}) {
  const [dimensions, setDimensions] = useState({width: 100, height: 100});
  
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
  return (
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
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
        )}
      </Measure>
  )
}

export default Daily;