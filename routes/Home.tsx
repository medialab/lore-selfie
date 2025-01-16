import Slider from "rc-slider"
import { useEffect, useMemo, useState } from "react"
import Measure from "react-measure"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { v4 as generateId } from "uuid"

import { usePort } from "@plasmohq/messaging/hook"

import Daily from "~components/DailyVisualization/Daily"

import "rc-slider/assets/index.css"
import "~/styles/Home.scss"

import { useInterval } from "usehooks-ts"

import DailyLegend from "~components/DailyVisualization/DailyLegend"
import DatePicker from "~components/FormComponents/DatePicker"
import Habits from "~components/HabitsVisualization/Habits"
import HabitsLegend from "~components/HabitsVisualization/HabitsLegend"
import {
  BROWSE_VIEW,
  DAY_IN_MS,
  GET_ACTIVITY_EVENTS,
  GET_ANNOTATIONS,
  GET_BINNED_ACTIVITY_OUTLINE,
  GET_HABITS_DATA,
  PLATFORMS_COLORS
} from "~constants"
import { buildDateKey, prettyDate } from "~helpers"
import { useBuildStructuredContentsList } from "~hooks"
import type { Annotations } from "~types/annotations"
import type {
  BrowseViewEvent,
  CaptureEventsList
} from "~types/captureEventsTypes"
import type {
  ChannelsMapItem,
  ContentsMapItem,
  DaysData,
  Dimensions,
  HabitsData
} from "~types/common"

const UPDATE_RATE = 10000
const MIN_ZOOM = 0.5

function Home() {
  // @todo handle with internationalization
  const daysMap = {
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi",
    0: "Dimanche"
  }

  const monthsMap = {
    0: "Janvier",
    1: "Février",
    2: "Mars",
    3: "Avril",
    4: "Mai",
    5: "Juin",
    6: "Juillet",
    7: "Août",
    8: "Septembre",
    9: "Octobre",
    10: "Novembre",
    11: "Décembre"
  }

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 1000,
    height: 1000
  })
  const [pendingRequestsIds, setPendingRequestsIds] = useState<Set<string>>(
    new Set()
  )
  const [displayedDayDate, setDisplayedDayDate] = useState<Date>()
  const [habitsTimespan, setHabitsTimespan] = useState<[Date, Date]>()
  const [habitsBinDuration, setHabitsBinDuration] = useState<number>(
    3600 * 3 * 1000
  )
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [roundDay, setRoundDay] = useState<boolean>(false)

  const [daysData, setDaysData] = useState<DaysData>({})
  const [visibleEvents, setVisibleEvents] = useState<CaptureEventsList>([])
  const [habitsData, setHabitsData] = useState<HabitsData>()
  const [annotations, setAnnotations] = useState<Annotations>()
  const crudPort = usePort("activitycrud")
  const annotationsPort = usePort("annotationscrud")

  // const { tab } = useParams();
  const [searchParams, setSearchParams] = useSearchParams()
  const tabs = {
    daily: {
      label: "Au jour le jour"
    },
    habits: {
      label: "Mes habitudes"
    }
    // history: {
    //   label: 'Mon historique'
    // }
  }
  const activeTab = useMemo(
    () =>
      searchParams.has("tab") ? searchParams.get("tab") : Object.keys(tabs)[0],
    [searchParams.get("tab")]
  )

  /**
   * Sendings cud requests
   */
  const requestFromActivityCrud = useMemo(
    () => (actionType: string, payload: object) => {
      const requestId = generateId()
      pendingRequestsIds.add(requestId)
      setPendingRequestsIds(pendingRequestsIds)
      crudPort.send({
        actionType,
        payload,
        requestId
      })
    },
    [pendingRequestsIds]
  )
  const requestFromAnnotationsCrud = useMemo(
    () => async (actionType: string, payload: object) => {
      const requestId = generateId()
      pendingRequestsIds.add(requestId)
      setPendingRequestsIds(pendingRequestsIds)
      await annotationsPort.send({
        actionType,
        payload,
        requestId
      })
    },
    [pendingRequestsIds, annotationsPort]
  )
  /**
   * Responses
   */
  ;[crudPort, annotationsPort].map((thatPort) =>
    thatPort.listen((response) => {
      // console.debug('received data : ', response);
      if (!pendingRequestsIds.has(response.requestId)) {
        return
      }
      if (response.result.status === "error") {
        console.error("error : ", response)
        return
      }
      pendingRequestsIds.delete(response.requestId)
      setPendingRequestsIds(pendingRequestsIds)
      const {
        result: { data = [] },
        payload
      } = response
      // const today = buildDateKey(new Date());
      switch (response.actionType) {
        case GET_ACTIVITY_EVENTS:
          setVisibleEvents(data)
          break
        case GET_ANNOTATIONS:
          setAnnotations(data)
          break
        case GET_BINNED_ACTIVITY_OUTLINE:
          const formatted = data.reduce((cur, { date, eventsCount }) => {
            const key = buildDateKey(date)
            return {
              ...cur,
              [key]: {
                value: eventsCount,
                key,
                date: new Date(date)
              }
            }
          }, {})
          setDaysData(formatted)
          if (!displayedDayDate && Object.entries(formatted).length) {
            const latestDayKey = Object.keys(formatted).pop()
            const latestDay = formatted[latestDayKey].date
            latestDay.setHours(0)
            // console.log('set displayed day date to latest day', latestDay)
            setDisplayedDayDate(latestDay)
          }
          break
        case GET_HABITS_DATA:
          setHabitsData(data)
          break
        default:
          break
      }
    })
  )

  useEffect(() => {
    requestFromActivityCrud(GET_BINNED_ACTIVITY_OUTLINE, {
      bin: DAY_IN_MS,
      tag: "daily"
    })
    requestFromAnnotationsCrud(GET_ANNOTATIONS, {})
  }, [])

  useEffect(() => {
    if (habitsTimespan) {
      // console.log('request habits data', habitsTimespan)
      requestFromActivityCrud(GET_HABITS_DATA, {
        bin: habitsBinDuration,
        from: habitsTimespan[0].getTime(),
        to: habitsTimespan[1].getTime() + DAY_IN_MS - 1,
        tag: "habits-data"
      })
    }
  }, [habitsBinDuration, habitsTimespan])

  useEffect(() => {
    if (displayedDayDate) {
      const from = new Date(displayedDayDate)
      const fromTime = from.getTime()
      const toTime = fromTime + 24 * 3600 * 1000
      requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
        from: fromTime,
        to: toTime
      })
    }
  }, [displayedDayDate])

  useEffect(() => {
    // console.log('got days data', daysData, habitsTimespan)
    if (!habitsTimespan && Object.keys(daysData).length) {
      const dates = Object.keys(daysData).map((key) => {
        const d = new Date(key)
        d.setHours(0)
        return d.getTime()
      })
      const extent = [Math.min(...dates), Math.max(...dates) + DAY_IN_MS - 1]
      setHabitsTimespan([new Date(extent[0]), new Date(extent[1])])
      // console.log('dates', dates);
    }
  }, [daysData])

  const isVisualizingToday = useMemo(() => {
    const today = buildDateKey(new Date())
    if (displayedDayDate) {
      const temp = new Date(displayedDayDate)
      temp.setHours(1)
      return temp && today === buildDateKey(temp)
    }
  }, [displayedDayDate])

  useInterval(() => {
    if (isVisualizingToday) {
      // console.log('request live update', new Date())
      const from = new Date(displayedDayDate)
      const fromTime = from.getTime()
      const toTime = fromTime + 24 * 3600 * 1000
      requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
        from: fromTime,
        to: toTime
      })
      // crudPort.send({
      //   actionType: GET_ACTIVITY_EVENTS,
      //   payload: {
      //     from: fromTime,
      //     to: toTime,
      //   }
      // })
    }
  }, UPDATE_RATE)

  useInterval(() => {
    if (habitsTimespan) {
      // console.log('request habits data', habitsTimespan, new Date())
      requestFromActivityCrud(GET_HABITS_DATA, {
        bin: habitsBinDuration,
        from: habitsTimespan[0].getTime(),
        to: habitsTimespan[1].getTime(),
        tag: "habits-data"
      })
    }
  }, UPDATE_RATE * 2)

  const { channelsMap, contentsMap, rowsCount } =
    useBuildStructuredContentsList(visibleEvents, annotations?.creators)

  // const { channelsMap, contentsMap, rowsCount }: tempDataType = useMemo(() => {
  //   const { creators = {} } = annotations || {};
  //   const events = visibleEvents;
  //   const validEvents = events
  //     .filter(event => event.type === BROWSE_VIEW && event.url && event.metadata.title
  //       && ['live', 'video', 'short'].includes(event.viewType)
  //     );
  //   const contents = new Map();
  //   const channels = new Map();
  //   let index = 0;
  //   let rCount = 0;
  //   validEvents.forEach((event: BrowseViewEvent) => {
  //     let channel = event.metadata.channelName || event.metadata.channelId;
  //     const channelSlug = `${event.metadata.channelId}-${event.platform}`;
  //     const creator = Object.values(creators).find(c => c.channels.includes(channelSlug));
  //     channel = creator ? creator.name : channel;
  //     // console.log('creators', creators, channelSlug);
  //     if (!channels.has(channel)) {
  //       channels.set(channel, new Map());
  //       rCount++;
  //     }
  //     const uniqueContents = channels.get(channel);// || new Map();
  //     if (!uniqueContents.has(event.url)) {
  //       index++;
  //       rCount++;
  //       uniqueContents.set(event.url, {
  //         url: event.url,
  //         title: event.metadata.title,
  //         channel,
  //         platform: event.platform,
  //         index
  //       })
  //       contents.set(event.url, {
  //         url: event.url,
  //         title: event.metadata.title,
  //         channel,
  //         platform: event.platform,
  //         index
  //       })
  //     }
  //     channels.set(channel, uniqueContents)
  //   })
  //   return {
  //     contentsMap: contents,
  //     channelsMap: channels,
  //     rowsCount: rCount
  //   }
  // }, [visibleEvents, annotations]);

  const spansSettings = {
    activity: {
      color: "red",
      markType: "regular",
      legendLabel: "Le média est joué",
      tooltipFn: ({ start, end }) =>
        `j'étais active/actif sur l'onglet de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    },
    playing: {
      color: "green",
      markType: "reverse",
      legendLabel: `La souris est active`,
      tooltipFn: ({ start, end }) =>
        `j'ai joué le média de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    },
    focus: {
      color: "blue",
      markType: "points",
      legendLabel: `L'onglet est visible`,
      tooltipFn: ({ start, end }) =>
        `j'avais l'onglet visible de ${new Date(start).toLocaleTimeString()} à ${new Date(end).toLocaleTimeString()}`
    }
  }

  return (
    <div className="contents-wrapper Home">
      <Measure
        bounds
        onResize={(contentRect) => {
          setDimensions(contentRect.bounds)
        }}>
        {({ measureRef }) => (
          <div ref={measureRef} className="contents width-limited-contents">
            <div className="ui-container">
              <div className="tabs-container">
                <ul>
                  {Object.entries(tabs).map(([id, { label }]) => {
                    return (
                      <li
                        className={`tab ${activeTab === id ? "active" : ""}`}
                        key={id}>
                        <h2>
                          <a
                            onClick={() => {
                              searchParams.set("tab", id)
                              setSearchParams(searchParams)
                            }}>
                            {label}
                          </a>
                          {/* <Link to={`/${id}`}>
                              {label}
                            </Link> */}
                        </h2>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="tab-content">
                <h2
                  dangerouslySetInnerHTML={{
                    __html:
                      activeTab === "daily"
                        ? isVisualizingToday
                          ? `Aujourd'hui`
                          : displayedDayDate
                            ? prettyDate(displayedDayDate, daysMap, monthsMap)
                            : "chargement"
                        : habitsTimespan
                          ? `Du ${prettyDate(habitsTimespan[0], daysMap, monthsMap)} au ${prettyDate(habitsTimespan[1], daysMap, monthsMap)}`
                          : "chargement"
                  }}
                />
                <DatePicker
                  value={
                    activeTab === "daily"
                      ? displayedDayDate
                      : habitsTimespan || [new Date(), new Date()]
                  }
                  onChange={(val) => {
                    if (activeTab === "daily") {
                      const temp = new Date(val)
                      temp.setHours(1)
                      const key = buildDateKey(temp)
                      if (daysData[key]) {
                        setDisplayedDayDate(val)
                      }
                    } else {
                      setHabitsTimespan(val)
                    }
                  }}
                  daysData={daysData}
                  range={activeTab !== "daily"}
                  disableDatalessDays={activeTab === "daily"}
                />
                {activeTab === "habits" ? (
                  <>
                    <div className="ui-group">
                      <h5>Taille des tranches horaires</h5>
                      <ul className="buttons-row">
                        {[
                          {
                            label: "1h",
                            value: 1 * 3600 * 1000
                          },
                          {
                            label: "3h",
                            value: 3 * 3600 * 1000
                          },
                          {
                            label: "6h",
                            value: 6 * 3600 * 1000
                          }
                        ].map(({ label, value }) => {
                          return (
                            <li key={value}>
                              <button
                                className={
                                  value === habitsBinDuration ? "active" : ""
                                }
                                onClick={() => {
                                  setHabitsBinDuration(value)
                                }}>
                                {label}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </>
                ) : null}
                {activeTab === "daily" ? (
                  <div className="contents-container">
                    <h3>Contenus consultés</h3>
                    <div className="contents-list-container">
                      {Array.from(channelsMap.entries()).map(
                        ([channel, contents]) => {
                          return (
                            <div key={channel} className="channel">
                              <h4 className="channel-title">{channel}</h4>
                              <ul className="contents-list">
                                {Array.from(contents.values()).map(
                                  ({
                                    url,
                                    title,
                                    channel,
                                    platform,
                                    index
                                  }) => {
                                    return (
                                      <li key={url} className="contents-item">
                                        <a target="blank" href={url}>
                                          <div className="platform-marker-container">
                                            <div
                                              className={`platform-marker ${platform}`}>
                                              <span>{index}</span>
                                            </div>
                                          </div>
                                          <div className="metadata-container">
                                            <h3 className={"title"}>{title}</h3>
                                            {/* <h4 className="channel">{channel ? `${channel} - ${platform}` : platform}</h4> */}
                                          </div>
                                        </a>
                                      </li>
                                    )
                                  }
                                )}
                              </ul>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="visualization-column">
              <div className={`visualization-container ${activeTab}-container`}>
                {activeTab === "daily" ? (
                  <Daily
                    {...{
                      displayedDayDate,
                      visibleEvents,
                      zoomLevel,
                      roundDay,
                      contentsMap,
                      channelsMap,
                      spansSettings
                    }}
                  />
                ) : null}
                {activeTab === "habits" ? (
                  <Habits
                    {...{
                      habitsTimespan,
                      habitsBinDuration,
                      data: habitsData
                      // displayedDayDate,
                      // visibleEvents,
                      // zoomLevel,
                      // roundDay,
                      // contentsMap, channelsMap,
                      // spansSettings,
                    }}
                  />
                ) : null}
              </div>
              <div className="visualization-footer">
                <div className="row legend-row">
                  <h5>Légende</h5>
                  {activeTab === "daily" ? (
                    <DailyLegend {...{ spansSettings }} />
                  ) : (
                    <HabitsLegend />
                  )}
                </div>
                {activeTab === "daily" ? (
                  <>
                    <div className="row">
                      <div className="group">
                        <h5>Zoom</h5>
                      </div>
                      <span className="group">
                        <button
                          disabled={zoomLevel === MIN_ZOOM}
                          onMouseDown={() => {
                            let newZoomLevel = zoomLevel / 1.05
                            if (newZoomLevel < MIN_ZOOM) {
                              newZoomLevel = MIN_ZOOM
                            }
                            setZoomLevel(newZoomLevel)
                          }}>
                          -
                        </button>
                        <button
                          onMouseDown={() => {
                            setZoomLevel(zoomLevel * 1.05)
                          }}>
                          +
                        </button>
                        <button
                          onMouseDown={() => {
                            setZoomLevel(1)
                          }}>
                          par défaut
                        </button>
                      </span>
                      <div className="slider-container">
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
                          className={`${roundDay ? "" : "active"}`}
                          onClick={() => setRoundDay(false)}>
                          visualiser uniquement les créneaux de la journée
                          actifs
                        </button>
                        <button
                          className={`${roundDay ? "active" : ""}`}
                          onClick={() => setRoundDay(true)}>
                          visualiser toute la journée
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Measure>
    </div>
  )
}
export default Home
