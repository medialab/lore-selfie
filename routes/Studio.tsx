import { useEffect, useMemo, useState } from "react"
import { CodeBlock, dracula } from "react-code-blocks"
import { useInterval } from "usehooks-ts"
import { v4 as generateId } from "uuid"

import { usePort } from "@plasmohq/messaging/hook"
// import { TimePicker } from '@vaadin/react-components/TimePicker.js';
import { Storage } from "@plasmohq/storage"

import ChannelsVisibilityEdition from "~components/ChannelsVisibilityEdition"
import Diary from "~components/Diary"
import DatePickerCustom from "~components/FormComponents/DatePicker"
import FilterInputsList from "~components/FormComponents/FilterInputsList"
import TimePicker from "~components/FormComponents/TimePicker"
import WeekdaysPicker from "~components/WeekdaysPicker"
import {
  DAY_IN_MS,
  GET_ACTIVITY_EVENTS,
  GET_ANNOTATIONS,
  GET_BINNED_ACTIVITY_OUTLINE,
  GET_CHANNELS,
  PLATFORMS
} from "~constants"

import "~/styles/Studio.scss"

import InputToValidate from "~components/FormComponents/InputToValidate"
import { buildDateKey, downloadTextfile, JSONArrayToCSVStr } from "~helpers"
import type { Annotations } from "~types/annotations"
import type { CaptureEventsList } from "~types/captureEventsTypes"
import type {
  AvailableChannels,
  ChannelsSettings,
  DaysData
} from "~types/common"

// import type { Settings } from "~types/settings"

interface StudioSettings {
  editionMode: string
  timeSpan: [Date, Date]
  timeOfDaySpan: [string, string]
  daysOfWeek: Array<number>
  platforms: Array<string>
  channelsSettings: ChannelsSettings
  excludedTitlePatterns: Array<string>
  annotationColumnsNames: Array<string>
  editionTitle: string
}
const EDITION_MODES = ["diary", "poster"]
const storage = new Storage({
  area: "local"
  // copiedKeyList: ["shield-modulation"],
})

function Studio() {
  const [visibleEvents, setVisibleEvents] = useState<CaptureEventsList>([])
  const [pendingRequestsIds, setPendingRequestsIds] = useState<Set<string>>(
    new Set()
  )
  const [annotations, setAnnotations] = useState<Annotations>()
  const [daysData, setDaysData] = useState<DaysData>()
  const crudPort = usePort("activitycrud")
  const annotationsPort = usePort("annotationscrud")

  const defaultSettings = useMemo((): StudioSettings => {
    const today = new Date().getTime()
    const maxTime = today - (today % DAY_IN_MS) + DAY_IN_MS
    const minTime = maxTime - DAY_IN_MS * 15
    return {
      editionMode: EDITION_MODES[0],
      timeSpan: [new Date(minTime), new Date(maxTime)],
      timeOfDaySpan: ["07:00", "23:00"],
      daysOfWeek: [0, 1, 2, 3, 4],
      platforms: PLATFORMS,
      channelsSettings: {},
      excludedTitlePatterns: [],
      annotationColumnsNames: ["moments", "ressentis", "projections"],
      editionTitle: "lore selfie"
    }
  }, [])

  const [settings, setSettings] = useState<StudioSettings>(defaultSettings)
  const [availableChannels, setAvailableChannels] = useState<AvailableChannels>(
    []
  )
  const settingsWithoutChannelsstringified = useMemo((): string => {
    console.log("update settings without channels")
    return JSON.stringify({
      ...settings,
      channelsSettings: undefined
    })
  }, [settings])
  useEffect(() => {
    storage
      .get<object>("lore-selfie-studio-settings")
      .then((storedSettings: StudioSettings) => {
        console.debug("got stored settings", storedSettings)
        if (storedSettings) {
          setSettings(storedSettings)
        } else {
          setSettings(defaultSettings)
        }
      })
  }, [])

  useEffect(() => {
    storage.set("lore-selfie-studio-settings", settings)
  }, [settings])

  const {
    editionMode,
    timeSpan,
    timeOfDaySpan,
    daysOfWeek,
    platforms,
    channelsSettings,
    excludedTitlePatterns,
    annotationColumnsNames,
    editionTitle = "lore selfie"
  } = settings

  const onUpdateSettings = async (key, value) => {
    // setRenderValue({
    setSettings({
      ...settings,
      [key]: value
    })
  }

  // const setEditionMode = (value) => onUpdateSettings("editionMode", value)
  const setTimespan = (value) => onUpdateSettings("timeSpan", value)
  const setTimeOfDaySpan = (value) => onUpdateSettings("timeOfDaySpan", value)
  const setDaysOfWeek = (value) => onUpdateSettings("daysOfWeek", value)
  const setPlatforms = (value) => onUpdateSettings("platforms", value)
  const setChannelsSettings = (value) =>
    onUpdateSettings("channelsSettings", value)
  const setExcludedTitlePatterns = (value) =>
    onUpdateSettings("excludedTitlePatterns", value)
  const setAnnotationsColumnsNames = (value) =>
    onUpdateSettings("annotationColumnsNames", value)
  const setEditionTitle = (value) => onUpdateSettings("editionTitle", value)

  /**
   * Sendings activity cud requests
   */
  const requestFromActivityCrud = useMemo(
    () => async (actionType: string, payload: object) => {
      const requestId = generateId()
      pendingRequestsIds.add(requestId)
      setPendingRequestsIds(pendingRequestsIds)
      await crudPort.send({
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

  const requestBinnedData = useMemo(
    () => () => {
      const DAY_IN_MS = 3600 * 24 * 1000
      if (
        timeSpan &&
        timeSpan?.length === 2 &&
        daysOfWeek.length > 0 &&
        timeSpan.map((d) => d).length
      ) {
        const [fromSpan, toSpan] = timeSpan
        const from = new Date(fromSpan).getTime()
        const to = new Date(
          new Date(toSpan).getTime() + DAY_IN_MS - 1
        ).getTime()
        requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
          from,
          to,
          ...settings
        })
      }
      // @todo also query filtered events according to other settings
      requestFromActivityCrud(GET_BINNED_ACTIVITY_OUTLINE, {
        bin: DAY_IN_MS
      })
    },
    [settings, timeSpan, daysOfWeek, requestFromActivityCrud]
  )

  useEffect(() => {
    requestBinnedData()
  }, [settings])

  useEffect(() => {
    requestFromAnnotationsCrud(GET_ANNOTATIONS, {})
  }, [])

  // update data in live
  useInterval(() => {
    requestBinnedData()
    requestFromAnnotationsCrud(GET_ANNOTATIONS, {})
    // console.debug('request get channels in interval', JSON.parse(settingsWithoutChannelsstringified))
    requestFromActivityCrud(
      GET_CHANNELS,
      JSON.parse(settingsWithoutChannelsstringified)
    )
  }, 10000)

  useEffect(() => {
    // console.debug('request get channels', JSON.parse(settingsWithoutChannelsstringified))
    requestFromActivityCrud(
      GET_CHANNELS,
      JSON.parse(settingsWithoutChannelsstringified)
    )
  }, [settingsWithoutChannelsstringified])

  useEffect(() => {
    ;[annotationsPort, crudPort].forEach((thatPort) =>
      thatPort.listen((response) => {
        // console.debug('received data : ', response.actionType, response?.result?.data?.length);
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
          result: { data = [] }
        } = response

        let formattedBinnedActivityOutline

        switch (response.actionType) {
          case GET_CHANNELS:
            setAvailableChannels(data)
            break
          case GET_ACTIVITY_EVENTS:
            setVisibleEvents(data)
            break
          case GET_ANNOTATIONS:
            setAnnotations(data)
            break
          case GET_BINNED_ACTIVITY_OUTLINE:
            formattedBinnedActivityOutline = data.reduce(
              (cur, { date, eventsCount }) => {
                const key = buildDateKey(date)
                return {
                  ...cur,
                  [key]: {
                    value: eventsCount,
                    key,
                    date: new Date(date)
                  }
                }
              },
              {}
            )
            setDaysData(formattedBinnedActivityOutline)
            break
          default:
            break
        }
      })
    )
  }, [settings])

  useEffect(() => {
    const { channelsSettings = {} } = settings
    const newChannelsSettings = { ...channelsSettings }
    availableChannels.forEach(({ channelId, channelName, platform, id }) => {
      if (!newChannelsSettings[id]) {
        newChannelsSettings[id] = {
          label: channelName || channelId,
          status: "visible",
          platform
        }
      }
    })
    setChannelsSettings(newChannelsSettings)
  }, [availableChannels])

  return (
    <div className="Studio contents-wrapper">
      <div className="contents width-limited-contents">
        <div className="ui-container">
          <div className="header">
            <h2>Exporter votre selfie</h2>
            {/* <h2>Choisir un type d'édition</h2> */}
            {/* <select value={editionMode} onChange={e => setEditionMode(e.target.value)}>
              {
                EDITION_MODES.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))
              }
            </select> */}
          </div>
          <div className="body">
            <div className="form-group">
              <h3>Dates de début et de fin</h3>
              {/* <DatePicker
                value={timeSpan}
                onChange={dates => setTimespan(dates.map(formatDatepickerDate))}
                range
                // numberOfMonths={3}
                rangeHover
              /> */}
              <DatePickerCustom
                value={[new Date(timeSpan[0]), new Date(timeSpan[1])]}
                onChange={(dates) => setTimespan(dates)}
                daysData={daysData}
                range
              />
            </div>
            <div className="form-group">
              <h3>Plages horaires de la journée à prendre en compte</h3>
              <div className="row">
                <TimePicker
                  label="début"
                  value={timeOfDaySpan[0]}
                  onChange={(val) => {
                    const newVal = [val, timeOfDaySpan[1]]
                    // const newVal = [val, timeOfDaySpan[1]].sort();
                    setTimeOfDaySpan(newVal)
                  }}
                />
                <TimePicker
                  label="fin"
                  value={timeOfDaySpan[1]}
                  onChange={(val) => {
                    const newVal = [timeOfDaySpan[0], val]
                    // const newVal = [timeOfDaySpan[0], val].sort();
                    setTimeOfDaySpan(newVal)
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <h3>Jours de la semaine à prendre en compte</h3>
              <WeekdaysPicker state={daysOfWeek} setState={setDaysOfWeek} />
            </div>
            <div className="form-group">
              <h3>Plateformes à prendre en compte</h3>
              <ul className="tags-list">
                {PLATFORMS.map((platform) => {
                  const selected = platforms.includes(platform)
                  const onChange = () => {
                    if (platforms.includes(platform)) {
                      setPlatforms(platforms.filter((p) => p !== platform))
                    } else {
                      setPlatforms([...platforms, platform])
                    }
                  }
                  return (
                    <li key={platform} onClick={onChange}>
                      <button
                        onClick={onChange}
                        className={selected ? "active" : ""}>
                        {platform}
                      </button>
                      {/* <input type="radio" checked={selected} readOnly />
                      <span>
                        {platform}
                      </span> */}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="form-group">
              <h3>Visibilité des chaînes</h3>
              <ChannelsVisibilityEdition
                channels={channelsSettings}
                onChange={setChannelsSettings}
              />
            </div>
            <div className="form-group">
              <h3>
                Exclure l'activité associée à certaines vidéos (par leurs
                titres)
              </h3>
              <FilterInputsList
                value={excludedTitlePatterns}
                onChange={setExcludedTitlePatterns}
                messages={{
                  newItem: "Ajouter un titre (ou morceau de titre) à exclure"
                }}
              />
            </div>
            <div className="form-group">
              <h3>Nom des colonnes d'annotation du journal</h3>
              <FilterInputsList
                value={annotationColumnsNames}
                onChange={setAnnotationsColumnsNames}
                messages={{
                  newItem: "Ajouter une colonne"
                }}
              />
            </div>
            <div className="form-group">
              <h3>Titre de l'édition</h3>
              <InputToValidate
                value={settings.editionTitle}
                onChange={setEditionTitle}
                placeholderFn={() => settings.editionTitle}
              />
            </div>
          </div>
          <div className="footer">
            <ul>
              <li>
                <button
                  onClick={() => {
                    downloadTextfile(
                      JSONArrayToCSVStr(visibleEvents),
                      `lore-selfie-edition-data-${new Date().toISOString()}.csv`,
                      "text/csv"
                    )
                  }}
                  className="important-button">
                  Télécharger au format CSV
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    downloadTextfile(
                      JSON.stringify(visibleEvents, null, 2),
                      `lore-selfie-edition-data-${new Date().toISOString()}.json`
                    )
                  }
                  className="important-button">
                  Télécharger au format JSON
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="preview-container">
          {editionMode === "diary" ? (
            <Diary
              {...{
                timeSpan,
                timeOfDaySpan,
                daysOfWeek,
                platforms,
                channelsSettings,
                excludedTitlePatterns,
                visibleEvents,
                annotations,
                annotationColumnsNames,
                editionTitle
              }}
            />
          ) : null}
          {editionMode === "poster" ? (
            <CodeBlock
              text={
                visibleEvents.length +
                ` events\n\n` +
                JSON.stringify(
                  visibleEvents.filter((e) => e.type === "BROWSE_VIEW"),
                  null,
                  2
                )
              }
              language={"json"}
              showLineNumbers
              theme={dracula}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Studio
