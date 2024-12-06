import { useState, useRef, useEffect, useMemo } from "react";
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { FileDrop } from 'react-file-drop'
import { CodeBlock, dracula } from "react-code-blocks";
import {v4 as generateId} from 'uuid';

import { downloadJSONData } from "~helpers";

import '~styles/DevReport.scss';

const PAGINATION_COUNT = 25;

const EVENT_TYPES = [
  'OPEN_PLATFORM_IN_TAB',
  'CLOSE_PLATFORM_IN_TAB',
  'BLUR_TAB',
  'FOCUS_TAB',
  'FOCUS_ON_REACTION_INPUT',
  'BLUR_ON_REACTION_INPUT',
  'POINTER_ACTIVITY_RECORD',
  'BROWSE_VIEW',
  'CHAT_ACTIVITY_RECORD'
]

function DevReport() {
  const fileInputRef = useRef(null);
  // const [activity = []] = useStorage("stream-selfie-activity");
  const [activity = [], setActivity] = useStorage({
    key: "stream-selfie-activity",
    instance: new Storage({
      area: "local"
    })
  });
  const [hiddenTypes, setHiddenTypes] = useState(
    EVENT_TYPES.filter(e => e !== 'BROWSE_VIEW')
  );
  const [reverseOrder, setReverseOrder] = useState(false);
  const [uploadMode, setUploadMode] = useState('prepend');
  const [currentDataPage, setCurrentDataPage] = useState(0);

  useEffect(() => {
    setCurrentDataPage(0);
  }, [activity, reverseOrder])
  const onFileInputChange = (event) => {
    const { files } = event.target;
    const [file] = files;
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      () => {
        const str = reader.result.toString();
        try {
          const data = JSON.parse(str);
          console.log('uploaded data', data);
          if (Array.isArray(data)) {
            let newActivity;
            switch (uploadMode) {
              case 'prepend':
                newActivity = [...data, ...activity];
                break;
              case 'append':
                newActivity = [...activity, ...data]
                break;
              case 'replace':
                const confirmed = confirm('L\'entièreté de l\'historique d\'activité actuel va être écrasé et remplacé par celui du fichier versé. Confirmer ?');
                if (confirmed) {
                  newActivity = data;
                }
                break;
              default:
                break;
            }
            if (newActivity) {
              const storage = new Storage({
                area: "local",
              });
              console.info('set activity');
              storage.set('stream-selfie-activity', newActivity);
            }
          } else {
            console.error('Not a lore selfie record');
            alert('Le fichier versé n\'est un historique de lore selfie');
          }
        } catch (e) {
          console.log(e);
          alert('Impossible à parser !')
        }
        fileInputRef.current.value = null;
      },
      false,
    );

    if (file) {
      reader.readAsText(file);
    }
  }
  const onTargetClick = () => {
    fileInputRef.current.click()
  }
  const filteredActivity = useMemo(() => {
    return (activity || []).filter((event) => !hiddenTypes.includes(event.type));
  }, [activity, hiddenTypes]);

  const visibleActivity = useMemo(() => {
    const ordered = reverseOrder ? (filteredActivity || []).reverse() : filteredActivity;
    const sliced = ordered.slice(currentDataPage * PAGINATION_COUNT, (currentDataPage + 1) * PAGINATION_COUNT)
    return sliced;
  }, [reverseOrder, filteredActivity, currentDataPage, PAGINATION_COUNT]);

  const paginations = useMemo(() => {
    const numberOfPages = Math.floor((filteredActivity || []).length / PAGINATION_COUNT);
    let pages = [];
    for (let i = 0; i <= numberOfPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [filteredActivity, PAGINATION_COUNT]);

  const handleDuplicateTodayForPastDays = async (numberOfDays = 100) => {
    if (!confirm(`Vous allez définitivement modifier l'historique en multipliant sa taille par ${numberOfDays} dans le cadre du test de charge. Continuer ?`)) {
      return;
    }
    const todaySlug = new Date().toJSON().split('T')[0];
    const todayEvents = activity.filter(event => {
      const daySlug = new Date(event.date).toJSON().split('T')[0];
      return todaySlug === daySlug;
    });
    const injectionIds = Array.from(new Set(todayEvents.map(e => e.injectionId)));
    let newEvents = [...todayEvents];
    for (let i = 1 ; i < numberOfDays ; i++) {
      const injectionIdMap = injectionIds.reduce((temp, id) => {
        return {
          ...temp,
          [id]: generateId()
        }
      }, {});
      // console.log(injectionIdMap);
      const DAY = 3600 * 24 * 1000;
      const thatDayEvents = todayEvents.map(event => {
        return {
          ...event,
          date: new Date(new Date(event.date).getTime() - DAY * i),
          injectionId: injectionIdMap[event.injectionId],
          id: generateId()
        }
      });
      newEvents = [...thatDayEvents, ...newEvents];
    }
    alert('Données prêtes ! accrochez vos ceintures c\'est parti !')
    console.debug('setting activity with %s events', newEvents.length);
    await setActivity(newEvents);
    console.debug('done');
  }
  return (
    <div className="DevReport">
      {/* <h1>Dev report</h1> */}
      <div className="ui">
        <div className="ui-section">
          <button
            onClick={() => downloadJSONData(activity, `stream-selfie-activity-${new Date().toUTCString()}`)}
          >
            Télécharger les données au format JSON
          </button>
          <button
            onClick={() => {

              const confirmed = confirm("Supprimer toutes les données enregistrées par lore selfie ?")
              if (confirmed) {
                const storage = new Storage({
                  area: "local",
                });
                storage.clear();
              }
            }}
          >
            Supprimer toutes les données
          </button>
        </div>
        <div className="ui-section">
          <h2>Tests de charge</h2>
          <div>
          <button
              onClick={() => handleDuplicateTodayForPastDays(10)}
            >
              Dupliquer les données d'aujourd'hui sur les 10 derniers jours
            </button>
          <button
              onClick={() => handleDuplicateTodayForPastDays(100)}
            >
              Dupliquer les données d'aujourd'hui sur les 100 derniers jours
            </button>
            <button
              onClick={() => handleDuplicateTodayForPastDays(1000)}
            >
              Dupliquer les données d'aujourd'hui sur les 1000 derniers jours
            </button>
          </div>
        </div>
        <div className="ui-section">
          <h2>Charger des données existantes</h2>
          <input
            onChange={onFileInputChange}
            ref={fileInputRef}
            type="file"
            className="hidden"
          />
          <FileDrop
            onTargetClick={onTargetClick}
            onDrop={onFileInputChange}
          >
            Charger des données existantes
          </FileDrop>
          <div>
            <p>Mode d'ajout des données : <code>{uploadMode}</code></p>
            <ul>
              <li>
                <button onClick={() => setUploadMode('prepend')}>Ajouter au début</button>
              </li>
              <li>
                <button onClick={() => setUploadMode('append')}>Ajouter à la fin</button>
              </li>
              <li>
                <button onClick={() => setUploadMode('replace')}>Remplacer l'historique</button>
              </li>

            </ul>
          </div>
        </div>
        <div className="ui-section">
          <h2>Cacher les types d'évènements</h2>
          <ul>
            {
              EVENT_TYPES.map(type => {
                const checked = hiddenTypes.includes(type);
                const handleClick = () => {
                  if (checked) {
                    setHiddenTypes(
                      hiddenTypes.filter(t => t !== type)
                    )
                  } else {
                    setHiddenTypes([
                      ...hiddenTypes,
                      type
                    ])
                  }
                }
                return (
                  <li key={type}>
                    <span
                      onClick={handleClick}
                    >
                      <input type="checkbox" checked={checked} readOnly />
                    </span>
                    <span>
                      {type}
                    </span>
                  </li>
                )
              })
            }
          </ul>
          <div>
            <button onClick={() => setHiddenTypes([])}>
              Montrer tout
            </button>
            <button onClick={() => setHiddenTypes([...EVENT_TYPES])}>
              Cacher tout
            </button>
          </div>
        </div>
      </div>
      <div className="data-preview">
        <h2>
          <span>
            Visualisation de {filteredActivity.length} évènements sur {(activity || []).length}
          </span>
          <button style={{ marginLeft: '1rem' }} onClick={() => setReverseOrder(!reverseOrder)}>
            {
              reverseOrder ?
                'Du plus récent au plus ancien'
                :
                'Du plus ancien au plus récent'
            }
          </button>
          {paginations.length > 1 ?
            paginations.map(pageNumber => {
              return (
                <button onClick={() => setCurrentDataPage(pageNumber)} key={pageNumber} className={`pagination ${currentDataPage === pageNumber ? 'active' : ''}`}>
                  {pageNumber + 1}
                </button>
              )
            })
            : null
          }
        </h2>
        <div>

        </div>
        <CodeBlock
          text={JSON.stringify(visibleActivity, null, 2)}
          language={'json'}
          showLineNumbers
          theme={dracula}
        />
        <div>
        {paginations.length > 1 ?
            paginations.map(pageNumber => {
              return (
                <button onClick={() => setCurrentDataPage(pageNumber)} key={pageNumber} className={`pagination ${currentDataPage === pageNumber ? 'active' : ''}`}>
                  {pageNumber + 1}
                </button>
              )
            })
            : null
          }
        </div>
      </div>

    </div>
  )
}

export default DevReport