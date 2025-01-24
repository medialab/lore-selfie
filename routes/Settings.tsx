import { useEffect, useState } from "react"

import InputToValidate from "~components/FormComponents/InputToValidate"
import HandlesManager from "~components/HandlesManager"
import {
  GET_SETTINGS,
  PLATFORMS,
  SERIALIZE_ALL_DATA,
  SET_SETTING
} from "~constants"
import { formatNumber, lengthInUtf8Bytes } from "~helpers"
import { usePort } from "~node_modules/@plasmohq/messaging/dist/hook"
import type { Handle, Settings } from "~types/settings"

function SettingsView() {
  const [sizeInMb, setSizeInMb] = useState<number>(undefined)
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true)
  const [settings, setSettings] = useState<Settings>(undefined)
  const settingsPort = usePort("settingscrud")
  const ioPort = usePort("io")

  useEffect(() => {
    ioPort.send({ actionType: SERIALIZE_ALL_DATA })
    settingsPort.send({ actionType: GET_SETTINGS })
  }, [])

  ioPort.listen((data) => {
    if (
      data.actionType === SERIALIZE_ALL_DATA &&
      data.result.status === "success"
    ) {
      const str = data.result.data
      const size = lengthInUtf8Bytes(str)
      setSizeInMb(size / 1048576)
    } else {
      console.error(data)
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
  // console.log('settings', settings);
  return (
    <div className="contents-wrapper Settings scrollable">
      <div className="contents width-limited-contents">
        <h1>Paramètres</h1>
        {isLoadingSettings ? (
          <div>Chargement ...</div>
        ) : (
          <div className="settings-container">
            <div className="settings-group">
              <h2>Mes pseudos</h2>
              <p>
                L'enregistrement de vos pseudos permet de rajouter des emphases
                sur vos interventions dans les chats et commentaires dans les
                visualisations de l'extension.
              </p>
              <HandlesManager
                handles={settings.handles}
                onChange={(handles: Array<Handle>) => {
                  console.log("should send new handles", handles)
                  settingsPort.send({
                    actionType: SET_SETTING,
                    payload: { key: "handles", value: handles }
                  })
                }}
              />
            </div>
            <div className="settings-group">
              <h2>Paramètres d'enregistrement de votre activité</h2>

              <div className="settings-subgroup">
                <p>Portée de l'enregistrement</p>
                <ul>
                  {[
                    {
                      key: "recordActivity",
                      label: "enregistrer votre activité avec l'extension"
                    },
                    {
                      key: "recordTabs",
                      label: "enregistrer les changements de tabulation",
                      disabled: !settings.recordActivity
                    },
                    {
                      key: "recordMouse",
                      label: "enregistrer le taux d'activité de la souris",
                      disabled: !settings.recordActivity
                    },
                    {
                      key: "recordChat",
                      label: "enregistrer le chat et/ou les commentaires",
                      disabled: !settings.recordActivity
                    }
                  ].map(({ key, label, disabled }) => {
                    const isChecked = !!settings[key]
                    const handleClick = (e) => {
                      e.stopPropagation()
                      settingsPort.send({
                        actionType: SET_SETTING,
                        payload: { key, value: !isChecked }
                      })
                    }
                    return (
                      <li
                        style={{
                          opacity: disabled ? 0.5 : 1,
                          pointerEvents: disabled ? "none" : "all"
                        }}
                        onClick={handleClick}
                        key={key}>
                        <button
                          className={`${key === "recordActivity" ? "important-button" : ""} ${!!settings[key] && !disabled ? "active" : ""}`}
                          disabled={
                            key !== "recordActivity" && !settings.recordActivity
                          }>
                          {label}
                        </button>
                        {/* <input type="radio" checked={!!settings[key] && !disabled} readOnly /> */}
                        {/* <label>{label}</label> */}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="settings-subgroup">
                <p>Enregistrer l'activité sur les plateformes</p>
                <ul>
                  {PLATFORMS.map((platform) => {
                    const isIncluded =
                      settings.recordOnPlatforms.includes(platform)
                    const handleChange = () => {
                      let newPlatforms
                      if (isIncluded) {
                        newPlatforms = settings.recordOnPlatforms.filter(
                          (p) => p !== platform
                        )
                      } else {
                        newPlatforms = [...settings.recordOnPlatforms, platform]
                      }
                      settingsPort.send({
                        actionType: SET_SETTING,
                        payload: {
                          key: "recordOnPlatforms",
                          value: newPlatforms
                        }
                      })
                    }
                    return (
                      <li
                        style={{
                          opacity: !settings.recordActivity ? 0.5 : 1,
                          pointerEvents: !settings.recordActivity
                            ? "none"
                            : "all"
                        }}
                        onClick={handleChange}
                        key={platform}>
                        <button
                          className={
                            isIncluded && settings.recordActivity
                              ? "active"
                              : ""
                          }
                          disabled={!settings.recordActivity}>
                          {platform}
                        </button>
                        {/* <input type="radio" checked={isIncluded && settings.recordActivity} readOnly />
                            <label>{platform}</label> */}
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="settings-subgroup">
                <p>
                  Fréquence de l'enregistrement de l'activité (en milisecondes)
                </p>
                <InputToValidate
                  placeholderFn={(val) => formatNumber(val) + " milisecondes"}
                  onRemove={undefined}
                  value={+settings.liveRecordingInterval}
                  type="number"
                  onChange={(val) => {
                    if (!isNaN(+val) && +val >= 1000) {
                      settingsPort.send({
                        actionType: SET_SETTING,
                        payload: { key: "liveRecordingInterval", value: val }
                      })
                    } else {
                      alert(
                        "Valeur incorrecte : elle doit être d'au moins 1000 ms (1 seconde)"
                      )
                    }
                  }}
                />
              </div>
            </div>

            <div className="settings-group">
              <h2>Informations</h2>
              <ul>
                <li>
                  Taille des données stockées par l'extension sur le disque dur
                  :{" "}
                  {sizeInMb === undefined
                    ? "chargement ..."
                    : formatNumber(+sizeInMb.toFixed(1)) + " Mo"}
                </li>
                {/* <li>
                    <button
                      onClick={() => {
                        chrome.tabs.create({
                          url: "./tabs/dev-dashboard.html"
                        })
                      }}>
                      Ouvrir le dashboard de développement
                    </button>
                  </li> */}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default SettingsView
