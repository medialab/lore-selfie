import { GET_SETTINGS, PLATFORMS, SERIALIZE_ALL_DATA, SET_SETTING } from "~constants";

import { formatNumber, lengthInUtf8Bytes } from "~helpers";
import { v4 as generateId } from 'uuid';
import { usePort } from "~node_modules/@plasmohq/messaging/dist/hook";
import { useEffect, useMemo, useState } from "react";
import InputToValidate from "~components/FormComponents/InputToValidate";
import { Handle } from "~types/settings";

function HandleEditor({
  handle: inputHandle,
  onChange,
  onDelete,
}) {
  const [handle, setHandle] = useState(inputHandle);
  useEffect(() => {
    setHandle(inputHandle);
  }, [inputHandle]);

  const {
    platform,
    internalId,
    id,
    alias
  } = handle;
  return (
    <li className="Handle card">
      <form className="card-content" onSubmit={(e) => {
        e.preventDefault();
        onChange(handle)
      }}>
        <div className="card-body fields">
          <div className="input-group">
            <label>Identifiant sur la plateforme (utilisé pour repérer vos commentaires et messages de chat)</label>
            <input placeholder="identifiant" type="text" id="id" value={handle.id} onChange={e => setHandle({ ...handle, id: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Alias pour les visualisations du plugin (optionnel)</label>
            <input placeholder="alias" type="text" id="alias" value={handle.alias} onChange={e => setHandle({ ...handle, alias: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Plateforme</label>
            <select value={platform} onChange={p => setHandle({ ...handle, platform: p.target.value })}>

              {
                PLATFORMS.map(p => {
                  return (
                    <option key={p} value={p}>{p}</option>
                  )
                })
              }
            </select>
          </div>
        </div>
        <div className="card-actions">
          <button onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}>
            Supprimer
          </button>
          <button disabled={JSON.stringify(inputHandle) === JSON.stringify(handle)} role="submit">
            Valider
          </button>
        </div>


      </form>
    </li>
  )
}
function HandlesManager({
  handles = [],
  onChange
}) {
  const handleCreate = () => {
    const newHandle = {
      platform: PLATFORMS[0],
      id: '',
      internalId: generateId(),
      alias: ''
    }
    const newHandles = [...handles, newHandle];
    onChange(newHandles);
  }
  return (
    <ul className="HandlesManager cards-list">
      {
        handles.map((handle) => {
          const handleChange = (newHandle) => {
            const newHandles = handles.map(h => {
              if (h.internalId === handle.internalId) {
                return newHandle;
              }
              return h;
            });
            onChange(newHandles);
          }
          const handleDelete = () => {
            console.log('handle delete');
            const newHandles = handles.filter(h => {
              return h.internalId !== handle.internalId;
            });
            onChange(newHandles);
          }
          return (
            <HandleEditor onDelete={handleDelete} handle={handle} onChange={handleChange} key={handle.internalId} />
          )
        })
      }
      <li>
        <button onClick={handleCreate}>
          Ajouter
        </button>
      </li>
    </ul>
  )
}
function Settings() {
  const [sizeInMb, setSizeInMb]: [number | undefined, Function] = useState(undefined);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settings, setSettings] = useState(undefined);
  const crudPort = usePort("activitycrud")
  const settingsPort = usePort("settingscrud")


  useEffect(() => {
    crudPort.send({ actionType: SERIALIZE_ALL_DATA })
    settingsPort.send({ actionType: GET_SETTINGS })
  }, []);

  crudPort.listen(data => {
    if (data.actionType === SERIALIZE_ALL_DATA && data.result.status === 'success') {
      const str = data.result.data;
      const size = lengthInUtf8Bytes(str);
      setSizeInMb(size / 1048576);
    } else {
      console.error(data);
    }
  })
  settingsPort.listen(data => {
    if (data.result.status === 'success') {
      switch (data.actionType) {
        case GET_SETTINGS:
          setIsLoadingSettings(false);
          setSettings(data.result.data);
          break;
        case SET_SETTING:
          console.log('set setting result', data)
          setSettings(data.result.data);
          break;
        default:
          break;
      }
    } else {
      console.error(data);
    }
  })
  console.log('settings', settings);
  return (
    <div className="contents-wrapper Settings scrollable">
      <div className="contents width-limited-contents">
        <h1>Paramètres</h1>
        {
          isLoadingSettings ?
            <div>Chargement ...</div>
            :
            <div className="settings-container">
              <div className="settings-group">
                <h2>
                  Mes pseudos
                </h2>
                <p>
                  L'enregistrement de vos pseudos permet de rajouter des emphases sur vos interventions dans les chats et commentaires dans les visualisations de l'extension.
                </p>
                <HandlesManager
                  handles={settings.handles}
                  onChange={
                    (handles: Array<Handle>) => {
                      console.log('should send new handles', handles);
                      settingsPort.send({
                        actionType: SET_SETTING,
                        payload: { key: 'handles', value: handles }
                      })
                    }
                  }
                />
              </div>
              <div className="settings-group">
                <h2>Paramètres d'enregistrement de votre activité</h2>
                
                <div className="settings-subgroup">
                  <p>Portée de l'enregistrement</p>
                  <ul>
                    {
                      [
                      { key: 'recordActivity', label: 'enregistrer votre activité avec l\'extension' },
                      { key: 'recordTabs', label: 'enregistrer les changements de tabulation', disabled: !settings.recordActivity },
                      { key: 'recordMouse', label: 'enregistrer le taux d\'activité de la souris', disabled: !settings.recordActivity },
                      { key: 'recordChat', label: 'enregistrer le chat et/ou les commentaires', disabled: !settings.recordActivity }
                      ]
                        .map(({ key, label, disabled }) => {
                          const isChecked = !!settings[key];
                          const handleClick = (e) => {
                            e.stopPropagation();
                            settingsPort.send({ actionType: SET_SETTING, payload: { key, value: !isChecked } })
                          }
                          return (
                            <li style={{opacity: disabled ? .5 : 1, pointerEvents: disabled ? 'none' : 'all'}} onClick={handleClick} key={key}>
                              <input type="radio" checked={!!settings[key] && !disabled} readOnly />
                              <label>{label}</label>
                            </li>
                          )
                        })
                    }
                  </ul>
                </div>
                <div className="settings-subgroup">
                  <p>Enregistrer l'activité sur les plateformes</p>
                  <ul>
                    {
                      PLATFORMS.map(platform => {
                        const isIncluded = settings.recordOnPlatforms.includes(platform);
                        const handleChange = () => {
                          let newPlatforms;
                          if (isIncluded) {
                            newPlatforms = settings.recordOnPlatforms.filter(p => p !== platform);
                          } else {
                            newPlatforms = [...settings.recordOnPlatforms, platform]
                          }
                          settingsPort.send({ actionType: SET_SETTING, payload: { key: 'recordOnPlatforms', value: newPlatforms } })
                        }
                        return (
                          <li style={{opacity: !settings.recordActivity ? .5 : 1, pointerEvents: !settings.recordActivity ? 'none' : 'all'}} onClick={handleChange} key={platform}>
                            <input type="radio" checked={isIncluded && settings.recordActivity} readOnly />
                            <label>{platform}</label>
                          </li>
                        )
                      })
                    }
                  </ul>
                </div>
                <div className="settings-subgroup">
                  <p>Fréquence de l'enregistrement de l'activité (en milisecondes)</p>
                  <InputToValidate placeholderFn={val => val + ' milisecondes'} onRemove={undefined} value={+settings.liveRecordingInterval} type="number" onChange={val => {
                    if (!isNaN(+val) && val >= 1000) {
                      settingsPort.send({ actionType: SET_SETTING, payload: { key: 'liveRecordingInterval', value: val } })
                    } else {
                      alert('Valeur incorrecte : elle doit être d\'au moins 1000 ms (1 seconde)')
                    }
                  }} />
                </div>
              </div>

              <div className="settings-group">
                <h2>
                  Informations
                </h2>
                <ul>
                  <li>Taille des données d'enregistrement de l'activité sur le disque : {sizeInMb === undefined ? 'chargement ...' : formatNumber(sizeInMb.toFixed(1)) + ' Mo'}</li>
                  <li>
                    <button
                      onClick={() => {
                        chrome.tabs.create({
                          url: "./tabs/dev-dashboard.html"
                        })
                      }}>
                      Ouvrir le dashboard de développement
                    </button>
                  </li>
                </ul>
              </div>
            </div>
        }

      </div>
    </div>
  )
}
export default Settings;