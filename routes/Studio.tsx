import { useEffect, useRef, useState, useMemo } from "react";
import DatePicker from "react-multi-date-picker"
import { TimePicker } from '@vaadin/react-components/TimePicker.js';
import { Storage } from "@plasmohq/storage"
import { usePort } from "@plasmohq/messaging/hook"
import { v4 as generateId } from 'uuid';
import { CodeBlock, dracula } from "react-code-blocks";

import ChannelsVisibilityEdition from "~components/ChannelsVisibilityEdition";
import FilterInputsList from "~components/FormComponents/FilterInputsList";
import WeekdaysPicker from "~components/WeekdaysPicker";
import Diary from "~components/Diary";
import { GET_ACTIVITY_EVENTS, GET_CHANNELS, PLATFORMS } from "~constants";


interface Settings {
  editionMode: string
  timeSpan: Array<Date | number>
  timeOfDaySpan: Array<string>
  daysOfWeek: Array<number>
  platforms: Array<string>
  channelsSettings: Array<Object>
  excludedTitlePatterns: Array<Object>
}
const EDITION_MODES = [
  'diary',
  'poster'
]
const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

const formatDatepickerDate = d => {
  const formatted = new Date(+d.unix * 1000);
  formatted.setHours(0);
  formatted.setMinutes(0);
  formatted.setSeconds(0);
  formatted.setMilliseconds(0);
  return formatted;
}

function Studio({
}) {
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [pendingRequestsIds, setPendingRequestsIds] = useState(new Set())

  const crudPort = usePort("activitycrud");


  const defaultSettings = useMemo(() => {
    const DAY = 24 * 3600 * 1000;
    const today = new Date().getTime();
    const maxTime = today - today % DAY + DAY;
    const minTime = maxTime - DAY * 15;
    return {
      editionMode: EDITION_MODES[0],
      timeSpan: [new Date(minTime), new Date(maxTime)],
      timeOfDaySpan: ['07:00', '23:00'],
      daysOfWeek: [0, 1, 2, 3, 4],
      platforms: PLATFORMS,
      channelsSettings: {},
      excludedTitlePatterns: []
    }
  }, []);

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [availableChannels, setAvailableChannels] = useState([]);
  const settingsWithoutChannelsStringified = useMemo(() => {
    // console.log('update settings without channels')
    return JSON.stringify({
      ...settings,
      channelsSettings: undefined
    })
  }, [settings])
  useEffect(() => {
    storage.get('lore-selfie-studio-settings')
      .then((storedSettings) => {
        if (storedSettings) {
          setSettings(storedSettings);
        } else {
          setSettings(defaultSettings)
        }

      })
  }, []);

  useEffect(() => {
    storage.set('lore-selfie-studio-settings', settings)
  }, [settings])

  const {
    editionMode,
    timeSpan,
    timeOfDaySpan,
    daysOfWeek,
    platforms,
    channelsSettings,
    excludedTitlePatterns,
  } = settings;

  useEffect(() => {
    if (timeSpan && timeSpan?.length === 2 && daysOfWeek.length > 0 && timeSpan.map(d => d).length) {
      const [fromSpan, toSpan] = timeSpan;
      const DAY = 3600 * 24 * 1000;
      const from = new Date(fromSpan).getTime();
      const to = new Date(new Date(toSpan).getTime() + DAY - 1).getTime();
      requestFromActivityCrud(GET_ACTIVITY_EVENTS, {
        from,
        to,
        ...settings,
      })
    }
  }, [settings])
  useEffect(() => {
    requestFromActivityCrud(GET_CHANNELS, JSON.parse(settingsWithoutChannelsStringified));
  }, [settingsWithoutChannelsStringified])



  const onUpdateSettings = async (key, value) => {
    // setRenderValue({
    setSettings({
      ...settings,
      [key]: value
    })
  }

  const setEditionMode = value => onUpdateSettings('editionMode', value);
  const setTimespan = value => onUpdateSettings('timeSpan', value);
  const setTimeOfDaySpan = value => onUpdateSettings('timeOfDaySpan', value);
  const setDaysOfWeek = value => onUpdateSettings('daysOfWeek', value);
  const setPlatforms = value => onUpdateSettings('platforms', value);
  const setChannelsSettings = value => onUpdateSettings('channelsSettings', value);
  const setExcludedTitlePatterns = value => onUpdateSettings('excludedTitlePatterns', value);

  /**
  * Sendings activity cud requests
  */
  const requestFromActivityCrud = useMemo(() => async (actionType: string, payload: object) => {
    const requestId = generateId();
    pendingRequestsIds.add(requestId);
    setPendingRequestsIds(pendingRequestsIds);
    await crudPort.send({
      actionType,
      payload,
      requestId
    })
  }, [pendingRequestsIds]);

  useEffect(() => {
    crudPort.listen(response => {
      // console.debug('received data : ', response.actionType, response?.result?.data?.length);
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
      // const today = new Date().toJSON().split('T')[0];
      switch (response.actionType) {
        case GET_CHANNELS:
          setAvailableChannels(data);
          break;
        case GET_ACTIVITY_EVENTS:
          setVisibleEvents(data);
          break;
        default:
          break;
      }
    })
  }, [settings])

  useEffect(() => {
    const { channelsSettings = {} } = settings;
    const newChannelsSettings = { ...channelsSettings };
    availableChannels.forEach(({ channelId, channelName, platform, id }) => {
      if (!newChannelsSettings[id]) {
        newChannelsSettings[id] = {
          label: channelName || channelId,
          status: 'visible',
          platform
        }
      }
    })
    setChannelsSettings(newChannelsSettings);
  }, [availableChannels])

  // console.log('availableChannels', availableChannels)
  // console.log('visible events', visibleEvents.length, 'settings', settings);
  return (
    <div className="Studio contents-wrapper">
      <div className="contents width-limited-contents">
        <div className="ui-container">
          <div className="header">
            <h2>Choisir un type d'édition</h2>
            <select value={editionMode} onChange={e => setEditionMode(e.target.value)}>
              {
                EDITION_MODES.map(mode => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))
              }
            </select>
          </div>
          <div className="body">
            <div className="form-group">
              <h3>
                Dates de début et de fin
              </h3>
              <DatePicker
                value={timeSpan}
                onChange={dates => setTimespan(dates.map(formatDatepickerDate))}
                range
                // numberOfMonths={3}
                rangeHover
              />
            </div>
            <div className="form-group">
              <h3>
                Plages horaires de la journée
              </h3>
              <TimePicker
                label="Début"
                value={timeOfDaySpan[0]}
                onValueChanged={(event) => {
                  const val = event.detail.value;
                  const newVal = [val, timeOfDaySpan[1]].sort();
                  setTimeOfDaySpan(newVal)
                }}
              />
              <TimePicker
                label="Fin"
                value={timeOfDaySpan[1]}
                onValueChanged={(event) => {
                  const val = event.detail.value;
                  const newVal = [timeOfDaySpan[0], val].sort();
                  setTimeOfDaySpan(newVal)
                }}
              />
            </div>
            <div className="form-group">
              <h3>
                Jours de la semaine
              </h3>
              <WeekdaysPicker
                state={daysOfWeek}
                setState={setDaysOfWeek}
              />
            </div>
            <div className="form-group">
              <h3>
                Plateformes
              </h3>
              <ul className="tags-list">
                {
                  PLATFORMS.map(platform => {
                    const selected = platforms.includes(platform)
                    const onChange = () => {
                      if (platforms.includes(platform)) {
                        setPlatforms(platforms.filter(p => p !== platform))
                      } else {
                        setPlatforms([...platforms, platform])
                      }
                    }
                    return (
                      <li key={platform} onClick={onChange}>
                        <button onClick={onChange} className={selected ? 'active' : ''}>
                          {platform}
                        </button>
                        {/* <input type="radio" checked={selected} readOnly />
                      <span>
                        {platform}
                      </span> */}
                      </li>
                    )
                  })
                }
              </ul>
            </div>
            <div className="form-group">
              <h3>
                Visibilité des chaînes
              </h3>
              <ChannelsVisibilityEdition
                channels={channelsSettings}
                onChange={setChannelsSettings}
              />
            </div>
            <div className="form-group">
              <h3>
                Exclure l'activité associée à certaines vidéos (par leurs titres)
              </h3>
              <FilterInputsList
                value={excludedTitlePatterns}
                onChange={setExcludedTitlePatterns}
              />
            </div>
          </div>
          <div className="footer">
            <ul>
              <li>
                <button className="action-button">
                  Télécharger au format CSV
                </button>
              </li>
              <li>
                <button className="action-button">
                  Télécharger au format JSON
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="preview-container">
          {
            editionMode === 'diary' ?
              <Diary
                {
                ...{
                  timeSpan,
                  timeOfDaySpan,
                  daysOfWeek,
                  platforms,
                  channelsSettings,
                  excludedTitlePatterns,
                  visibleEvents,
                }
                }
              />
              : null
          }
          {
            editionMode === 'poster' ?
              <CodeBlock
                text={visibleEvents.length + ` events\n\n` + JSON.stringify(visibleEvents.filter(e => e.type === 'BROWSE_VIEW'), null, 2)}
                language={'json'}
                showLineNumbers
                theme={dracula}
              />
              : null
          }

        </div>
      </div>
    </div>
  )
}

export default Studio;