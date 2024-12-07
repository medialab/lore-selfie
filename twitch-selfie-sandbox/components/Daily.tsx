import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { useMemo, useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker"
import Slider from 'rc-slider';

import DayVisualization from "./DayVisualization"

import 'rc-slider/assets/index.css';

const MIN_ZOOM = .8;

function Daily() {
  const calendarRef = useRef(null);
  const [displayedDayDate, setDisplayedDayDate] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [roundDay, setRoundDay] = useState(false);

  const [activity = []] = useStorage({
    key: "lore-selfie-activity",
    instance: new Storage({
      area: "local"
    })
  });
  const sessionsMap = useMemo(() => {
    const currentMap = new Map();
    activity.forEach(event => {
      const { injectionId } = event;
      if (currentMap.has(injectionId)) {
        const prev = currentMap.get(injectionId);
        currentMap.set(injectionId, [...prev, event]);
      } else {
        currentMap.set(injectionId, [event]);
      }
    })
    return currentMap;
  }, [activity]);
  const daysMap = useMemo(() => {
    const currentMap = new Map();
    for (let [injectionId, events] of sessionsMap.entries()) {
      if (events.length) {
        const dateOfFirstEvent = new Date(events[0].date).toJSON().split('T')[0];
        if (!currentMap.has(dateOfFirstEvent)) {
          currentMap.set(dateOfFirstEvent, new Set([injectionId]));
        } else {
          const existing = currentMap.get(dateOfFirstEvent);
          existing.add(injectionId);
          currentMap.set(dateOfFirstEvent, existing);
        }
      }
    }
    return currentMap;
  }, [sessionsMap]);
  useEffect(() => {
    if (!displayedDayDate && activity.length) {
      const keys = Array.from(daysMap.keys()).sort();
      const latestDay = keys.pop();
      setDisplayedDayDate(latestDay);
    } else if (!activity.length) {
      setDisplayedDayDate(undefined);
    }
  }, [daysMap, sessionsMap, activity]);
  const availableDays = useMemo(() => {
    const dates = Array.from(daysMap.keys()).map(d => ({ key: d, date: new Date(d) }));
    const today = new Date().toJSON().split('T')[0];
    return dates.map(({ key, date }) => {
      return {
        key,
        date,
        label: key == today ? `aujourd'hui` : date.toLocaleDateString()
      }
    })
  }, [daysMap]);
  const currentDaySessions = useMemo(() => {
    if (displayedDayDate) {
      const sessionsIds = Array.from(daysMap.get(displayedDayDate));
      const sessions = new Map();
      sessionsIds.forEach((sessionId) => {
        sessions.set(sessionId, sessionsMap.get(sessionId));
      });
      return sessions;
    }
  }, [displayedDayDate, daysMap]);
  return (
    <div className="Daily">
      <h1>Au jour le jour</h1>

    
      <div className="ui">
      <div className="date-picker-container">
        <DatePicker
          multiple
          format="DD MMMM YYYY"
          sort
          ref={calendarRef}
          value={availableDays.map(({ date }) => date.getTime())}
          onChange={(dates) => {
            const availableDaysSet = new Set(availableDays.map(({ date }) => date.getTime()));
            const datesSet = new Set(dates.map(d => +d.unix * 1000));

            const hasNot = Array.from(availableDaysSet).find(t => {
              const picked = datesSet.has(t);
              return !picked;
            });
            const key = new Date(hasNot).toJSON().split('T')[0];
            setDisplayedDayDate(key);
            // console.log(key, Array.from(availableDaysSet), Array.from(datesSet));
            calendarRef.current.closeCalendar();
            return false;
          }}

        />
        <ul>
          {
            availableDays
              .filter(({ key }) => key === displayedDayDate)
              .map(({ key, date, label }) => {
                const handleClick = () => {
                  // setDisplayedDayDate(key);
                  calendarRef.current.openCalendar();

                }
                return (
                  <li key={key} >
                    <h3> {label}</h3>
                    <button
                      // className={`available-day ${key === displayedDayDate ? 'active' : ''}`}
                      onClick={handleClick}
                    >
                      Changer de jour
                    </button>
                  </li>
                )
              })
          }
        </ul>
      </div>
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
              max={50}
              onChange={(value: number) => {
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

      <div className="visualization-container">
        {
          currentDaySessions ?
            <DayVisualization
              sessions={currentDaySessions}
              date={new Date(displayedDayDate)}
              {...{
                zoomLevel,
                roundDay
              }}
            />
            : null
        }

      </div>
    </div>
  )
}

export default Daily;