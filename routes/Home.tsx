import Daily from "~components/Daily";
import { Link, useParams } from "react-router-dom";
import Measure from 'react-measure';
import { useMemo, useState, useEffect } from "react";
import { usePort } from "@plasmohq/messaging/hook";
import { v4 as generateId } from 'uuid';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import '../styles/Home.scss';
import { BROWSE_VIEW, GET_ACTIVITY_EVENTS, GET_ANNOTATIONS, GET_BINNED_ACTIVITY_OUTLINE } from "~constants";
import { useInterval } from "usehooks-ts";
import DatePicker from "~components/FormComponents/DatePicker";
import { prettyDate, buildDateKey } from "~helpers";

const UPDATE_RATE = 10000;
const MIN_ZOOM = .5;

// 
function Home() {

  const daysMap = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    0: 'Dimanche',
  }

  const monthsMap = {
    0: 'Janvier',
    1: 'Février',
    2: 'Mars',
    3: 'Avril',
    4: 'Mai',
    5: 'Juin',
    6: 'Juillet',
    7: 'Août',
    8: 'Septembre',
    9: 'Octobre',
    10: 'Novembre',
    11: 'Décembre',
  }

  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [pendingRequestsIds, setPendingRequestsIds] = useState(new Set())
  const [displayedDayDate, setDisplayedDayDate] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [roundDay, setRoundDay] = useState(false);
  const [daysData, setDaysData] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const crudPort = usePort("activitycrud");
  const annotationsPort = usePort("annotationscrud");

  const { tab } = useParams();
  const tabs = {
    daily: {
      label: 'Au jour le jour'
    },
    habits: {
      label: 'Mes habitudes'
    },
    // history: {
    //   label: 'Mon historique'
    // }
  };
  const activeTab = useMemo(() => tab in tabs ? tab : Object.keys(tabs)[0], [tab]);


  /**
   * Sendings cud requests
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
  const requestFromAnnotationsCrud = useMemo(() => async (actionType: string, payload: object) => {
    const requestId = generateId();
    pendingRequestsIds.add(requestId);
    setPendingRequestsIds(pendingRequestsIds);
    await annotationsPort.send({
      actionType,
      payload,
      requestId
    })
  }, [pendingRequestsIds, annotationsPort]);
  /**
   * Responses
   */
  [crudPort, annotationsPort]
    .map(thatPort =>
      thatPort
        .listen(response => {
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
          // const today = buildDateKey(new Date());
          switch (response.actionType) {
            case GET_ACTIVITY_EVENTS:
              setVisibleEvents(data);
              break;
            case GET_ANNOTATIONS:
              setAnnotations(data);
              break;
            case GET_BINNED_ACTIVITY_OUTLINE:
              const formatted = data.reduce((cur, { date, eventsCount }) => {
                const key = buildDateKey(date);
                return {
                  ...cur,
                  [key]: {
                    value: eventsCount,
                    key,
                    date: new Date(date),
                  }
                }
              }, {});
              setDaysData(formatted);
              if (!displayedDayDate && Object.entries(formatted).length) {
                const latestDayKey = Object.keys(formatted).pop();
                const latestDay = formatted[latestDayKey].date;
                // console.log('set displayed day date to latest day', latestDay)
                setDisplayedDayDate(latestDay);
              }
              break;
            default:
              break;
          }
        }));

  useEffect(() => {
    const DAY = 24 * 3600 * 1000;
    requestFromActivityCrud(GET_BINNED_ACTIVITY_OUTLINE, {
      bin: DAY
    })
    requestFromAnnotationsCrud(GET_ANNOTATIONS, {});
  }, []);

  useEffect(() => {
    if (displayedDayDate) {
      let from = new Date(displayedDayDate)
      const fromTime = from.getTime();
      const toTime = fromTime + 24 * 3600 * 1000;
      requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
        from: fromTime,
        to: toTime,
      })
    }
  }, [displayedDayDate])

  const isVisualizingToday = useMemo(() => {
    const today = buildDateKey(new Date());
    return displayedDayDate && today === buildDateKey(displayedDayDate)
  }, [displayedDayDate])

  useInterval(
    () => {
      if (isVisualizingToday) {
        let from = new Date(displayedDayDate)
        const fromTime = from.getTime();
        const toTime = fromTime + 24 * 3600 * 1000;
        requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
          from: fromTime,
          to: toTime,
        })
        // crudPort.send({
        //   actionType: GET_ACTIVITY_EVENTS,
        //   payload: {
        //     from: fromTime,
        //     to: toTime,
        //   }
        // })
      }
    },
    UPDATE_RATE,
  );


  const { channelsMap, contentsMap, rowsCount } = useMemo(() => {
    const { creators = {} } = annotations || {};
    const events = visibleEvents;
    const validEvents = events
      .filter(event => event.type === BROWSE_VIEW && event.url && event.metadata.title

        && ['live', 'video', 'short'].includes(event.viewType)
      );
    const contents = new Map();
    const channels = new Map();
    let index = 0;
    let rCount = 0;
    validEvents.forEach(event => {
      let channel = event.metadata.channelName || event.metadata.channelId;
      const channelSlug = `${event.metadata.channelId}-${event.platform}`;
      const creator = Object.values(creators).find(c => c.channels.includes(channelSlug));
      channel = creator ? creator.name : channel;
      // console.log('creators', creators, channelSlug);
      if (!channels.has(channel)) {
        channels.set(channel, new Map());
        rCount++;
      }
      const uniqueContents = channels.get(channel);// || new Map();
      if (!uniqueContents.has(event.url)) {
        index++;
        rCount++;
        uniqueContents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
        contents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
      }
      channels.set(channel, uniqueContents)
    })
    return {
      contentsMap: contents,
      channelsMap: channels,
      rowsCount: rCount
    }
  }, [visibleEvents, annotations]);

  return (
    <div className="contents-wrapper Home">
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="contents width-limited-contents">
            <div className="ui-container">
              <div className="tabs-container">
                <ul>
                  {
                    Object.entries(tabs).map(([id, { label }]) => {
                      return (
                        <li className={`tab ${activeTab === id ? 'active' : ''}`} key={id}>
                          <h2>
                            <Link to={`/${id}`}>
                              {label}
                            </Link>
                          </h2>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
              <div className="tab-content">
                <h2>
                  {isVisualizingToday ? `Aujourd'hui` : displayedDayDate ? prettyDate(displayedDayDate, daysMap, monthsMap) : 'chargement'}
                </h2>
                <DatePicker
                  value={displayedDayDate}
                  onChange={(date) => {
                    const key = buildDateKey(date);
                    if (daysData[key]) {
                      setDisplayedDayDate(date);
                    }
                  }}
                  daysData={daysData}
                  range={false}
                  disableDatalessDays={true}
                />
                <div className="contents-container">
                  <h3>Contenus consultés</h3>
                  <div className="contents-list-container">
                    {
                      Array.from(channelsMap.entries())
                        .map(([channel, contents]) => {
                          return (
                            <div
                              key={channel}
                              className="channel"
                            >
                              <h4 className="channel-title">{channel}</h4>
                              <ul className="contents-list">
                                {
                                  Array.from(contents.values())
                                    .map(({
                                      url,
                                      title,
                                      channel,
                                      platform,
                                      index,
                                    }) => {
                                      return (
                                        <li key={url} className="contents-item">
                                          <a
                                            target="blank"
                                            href={url}
                                          >
                                            <div className="platform-marker-container">
                                              <div className={`platform-marker ${platform}`}>
                                                <span>{index}</span>
                                              </div>
                                            </div>
                                            <div className="metadata-container">
                                              <h3 className={'title'}>{title}</h3>
                                              {/* <h4 className="channel">{channel ? `${channel} - ${platform}` : platform}</h4> */}
                                            </div>
                                          </a>
                                        </li>
                                      );
                                    })
                                }
                              </ul>
                            </div>
                          )
                        })
                    }
                  </div>
                </div>
              </div>

            </div>
            <div className="visualization-column">
              <div className={`visualization-container ${activeTab}-container`}>
                {
                  activeTab === 'daily' ?
                    <Daily
                      {
                      ...{
                        displayedDayDate,
                        visibleEvents,
                        zoomLevel,
                        roundDay,
                        contentsMap, channelsMap,
                      }
                      }
                    />
                    : null
                }
              </div>
              <div className="visualization-footer">

                <div className="row">
                  Légende
                </div>
                <div className="row">
                  <span className="group">
                    <span>Zoom</span>
                  </span>
                  <span className="group">

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
                    }}>par défaut</button>
                  </span>
                  <div
                    className="slider-container"
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
                <div className="row">
                  <div className="stretched-buttons">
                    <button
                      className={`${roundDay ? '' : 'active'}`}
                      onClick={() => setRoundDay(false)}
                    >
                      visualiser uniquement les créneaux de la journée actifs
                    </button>
                    <button
                      className={`${roundDay ? 'active' : ''}`}
                      onClick={() => setRoundDay(true)}
                    >
                      visualiser toute la journée
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Measure>
    </div>
  )
}
export default Home;