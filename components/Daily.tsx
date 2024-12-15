// import { useStorage } from "@plasmohq/storage/hook"
// import { Storage } from "@plasmohq/storage"
import { usePort } from "@plasmohq/messaging/hook"
import { useMemo, useState, useEffect, useRef } from "react";
import DatePicker from "react-multi-date-picker"
import Slider from 'rc-slider';
import { useInterval } from 'usehooks-ts'
import Measure from 'react-measure';
import { v4 as generateId } from 'uuid';

import DayVisualization from "./DayVisualization"

import 'rc-slider/assets/index.css';

const MIN_ZOOM = .8;

function Daily() {
  const calendarRef = useRef(null);
  const [pendingRequestsIds, setPendingRequestsIds] = useState(new Set())
  const [displayedDayDate, setDisplayedDayDate] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [roundDay, setRoundDay] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [dimensions, setDimensions] = useState({});
  const crudPort = usePort("activitycrud");

  /**
   * Sendings activity cud requests
   */
  const requestFromActivityCrud = useMemo(() => (actionType: string, payload: object) => {
    const requestId = generateId();
    pendingRequestsIds.add(requestId);
    setPendingRequestsIds(pendingRequestsIds);
    crudPort.send({
      actionType,
      payload,
      requestId
    })
  }, [pendingRequestsIds]);
  /**
   * Responses
   */
  crudPort.listen(response => {
    // console.debug('received data : ', response);
    if (!pendingRequestsIds.has(response.requestId)) {
      return;
    }
    if (response.result.status === 'error') {
      console.error('error : ', response);
      return;
    }
    pendingRequestsIds.delete(response.requestId);
    setPendingRequestsIds(pendingRequestsIds);
    const { result: { data = [] } } = response;
    const today = new Date().toJSON().split('T')[0];
    switch (response.actionType) {
      case 'GET_ACTIVITY_EVENTS':
        setVisibleEvents(data);
        break;
      case 'GET_BINNED_ACTIVITY_OUTLINE':
        const formatted = data.map(({ date, eventsCount }) => {
          const key = new Date(date).toJSON().split('T')[0]
          return {
            eventsCount,
            key,
            date: new Date(date),
            label: key == today ? `aujourd'hui` : new Date(date).toLocaleDateString()
          }
        });
        setAvailableDays(formatted);
        if (!displayedDayDate && formatted.length) {
          const latestDay = formatted[formatted.length - 1].key;
          // console.log('set displayed day date to latest day', latestDay)
          setDisplayedDayDate(latestDay);
        }
        break;
      default:
        break;
    }
  })

  useEffect(() => {
    const DAY = 24 * 3600 * 1000;
    requestFromActivityCrud('GET_BINNED_ACTIVITY_OUTLINE', {
      bin: DAY
    })
  }, []);

  useEffect(() => {
    if (displayedDayDate) {
      let from = new Date(displayedDayDate)
      const fromTime = from.getTime();
      const toTime = fromTime + 24 * 3600 * 1000;
      requestFromActivityCrud('GET_ACTIVITY_EVENTS', {
        from: fromTime,
        to: toTime,
      })
      // crudPort.send({
      //   actionType: 'GET_ACTIVITY_EVENTS',
      //   requestId: generateId(),
      //   payload: {
      //     from: fromTime,
      //     to: toTime,
      //   }
      // })
    }
  }, [displayedDayDate])

  const isVisualizingToday = useMemo(() => {
    const today = new Date().toJSON().split('T')[0];
    return today === displayedDayDate
  }, [displayedDayDate])

  useInterval(
    () => {
      if (isVisualizingToday) {
        let from = new Date(displayedDayDate)
        const fromTime = from.getTime();
        const toTime = fromTime + 24 * 3600 * 1000;
        requestFromActivityCrud('GET_ACTIVITY_EVENTS', {
          from: fromTime,
          to: toTime,
        })
        // crudPort.send({
        //   actionType: 'GET_ACTIVITY_EVENTS',
        //   payload: {
        //     from: fromTime,
        //     to: toTime,
        //   }
        // })
      }
    },
    1000,
  )

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
    <div className="Daily">
      <h1>Au jour le jour</h1>


      <div className="ui">
        <div className="date-picker-container">
          <DatePicker
            multiple
            format="DD MMMM YYYY"
            numberOfMonths={3}
            sort
            ref={calendarRef}
            value={(availableDays || []).map(({ date }) => date.getTime())}
            onChange={(dates) => {
              const availableDaysSet = new Set((availableDays || []).map(({ date }) => date.getTime()));
              const datesSet = new Set(dates.map(d => +d.unix * 1000));

              const hasNot = Array.from(availableDaysSet).find(t => {
                const picked = datesSet.has(t);
                return !picked;
              });
              const key = new Date(hasNot).toJSON().split('T')[0];
              setDisplayedDayDate(key);
              calendarRef.current.closeCalendar();
              return false;
            }}

          />
          <ul>
            {
              availableDays === 'undefined' ?
                <div>Chargement</div>
                :
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


      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="visualization-container">
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
                  }}
                />
                : null
            }

          </div>
        )}
      </Measure>

    </div>
  )
}

export default Daily;