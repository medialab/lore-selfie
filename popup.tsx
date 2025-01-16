import { useEffect, useState } from "react"

import { usePort } from "@plasmohq/messaging/hook"

import "styles/Popup.scss"

import { v4 as generateId } from "uuid"

import VersionCheckBtn from "~components/VersionCheckBtn"
import {
  BROWSE_VIEW,
  GET_ACTIVITY_EVENTS,
  GET_SETTINGS,
  SERIALIZE_ALL_DATA,
  SET_SETTING
} from "~constants"
import { downloadTextfile } from "~helpers"

function Popup() {
  // const [activity] = useStorage("lore-selfie-activity");
  const ioPort = usePort("io")
  const settingsPort = usePort("settingscrud")
  const activityPort = usePort("activitycrud")
  const [isDownloading, setIsDownloading] = useState(false)
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [recentContents, setRecentContents] = useState([])
  const [settings, setSettings] = useState()

  useEffect(() => {
    settingsPort.send({ actionType: GET_SETTINGS })
    const toTime = new Date().getTime()
    const fromTime = toTime - +24 * 3600 * 1000 * 2
    const requestId = generateId()
    activityPort.send({
      actionType: GET_ACTIVITY_EVENTS,
      payload: {
        from: fromTime,
        to: toTime
      },
      requestId
    })
  }, [])

  activityPort.listen((response) => {
    if (response.result.status === "success") {
      // console.log(response.result.data)
      const validEvents = response.result.data.filter(
        (event) =>
          event.type === BROWSE_VIEW && event.url && event.metadata.title
      )
      const uniqueContents = new Map()
      validEvents.forEach((event) => {
        if (!uniqueContents.has(event.url)) {
          uniqueContents.set(event.url, {
            url: event.url,
            title: event.metadata.title,
            channel: event.metadata.channelName || event.metadata.channelId,
            platform: event.platform
          })
        }
      })
      setRecentContents(Array.from(uniqueContents.values()).reverse())
      setIsLoadingActivity(false)
    }
  })

  ioPort.listen((data) => {
    if (
      data.actionType === SERIALIZE_ALL_DATA &&
      data.result.status === "success" &&
      isDownloading
    ) {
      downloadTextfile(
        data.result.data,
        `lore-selfie-activity-${new Date().toUTCstring()}.json`,
        "application/json"
      )
      setIsDownloading(false)
    }
  })

  settingsPort.listen((data) => {
    if (data.result.status === "success") {
      switch (data.actionType) {
        case GET_SETTINGS:
          setIsLoadingSettings(false)
          setSettings(data.result.data)
          break
        case SET_SETTING:
          setSettings(data.result.data)
          break
        default:
          break
      }
    } else {
      console.error(data)
    }
  })

  return (
    <div className="Popup">
      <div className="header">
        <h1>
          <button
            onClick={() => {
              chrome.tabs.create({
                url: "./tabs/app.html"
              })
            }}>
            <span className="title">lore selfie</span>
            <span className="version">alpha</span>
          </button>
        </h1>
        <div className="actions">
          {isLoadingSettings ? null : (
            <>
              <span className="indicator">
                enregistrement {settings.recordActivity ? "actif" : "en pause"}
              </span>
              <button
                onClick={() => {
                  if (settings.recordActivity) {
                    alert(
                      `L'enregistrement réalisé par l'extension lore selfie va être mis en pause ! veuillez rafraîchir les onglets youtube, twitch etc. déjà ouverts pour que votre activité sur ces derniers ne soit plus enregistrée (note : ceci sera géré automatiquement dans une prochaine version).`
                    )
                  } else {
                    alert(
                      `L'enregistrement réalisé par l'extension lore selfie va être repris ! veuillez rafraîchir les onglets youtube, twitch etc. déjà ouverts pour que votre activité sur ces derniers soit enregistrée (note : ceci sera géré automatiquement dans une prochaine version).`
                    )
                  }
                  settingsPort.send({
                    actionType: SET_SETTING,
                    payload: {
                      key: "recordActivity",
                      value: !settings.recordActivity
                    }
                  })
                }}>
                {settings.recordActivity ? "désactiver" : "activer"}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="body">
        <h2>Contenus visionnés ces dernières 48 heures</h2>
        <div className="contents">
          {isLoadingActivity ? (
            <div className="loading-activity-container">
              <div>Chargement ...</div>
            </div>
          ) : (
            <ul className="recent-contents-list">
              {recentContents.map(({ url, title, channel, platform }) => {
                return (
                  <li className="recent-contents-item" key={url}>
                    <a
                      target="blank"
                      href={url}
                      className="recent-contents-item-contents">
                      <div className="platform-marker-container">
                        <div className={`platform-marker ${platform}`} />
                      </div>
                      <div className="metadata-container">
                        <h3 className={"title"}>{title}</h3>
                        <h4 className="channel">
                          {channel ? `${channel} - ${platform}` : platform}
                        </h4>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="footer">
        <button
          className="primary"
          onClick={() => {
            chrome.tabs.create({
              url: "./tabs/app.html"
            })
          }}>
          ouvrir l'application
        </button>
        <VersionCheckBtn />
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            ioPort.send({ actionType: SERIALIZE_ALL_DATA })
            setIsDownloading(true)
          }}>
          sauvegarder les données
        </button>

        <button
          className="special"
          onClick={() => {
            chrome.tabs.create({
              url: "./tabs/dev-dashboard.html"
            })
          }}>
          ouvrir le dashboard de développement
        </button>
      </div>
      <div className={`loading-container ${isDownloading ? "active" : ""}`}>
        <div>Chargement ...</div>
      </div>
    </div>
  )
}

export default Popup
