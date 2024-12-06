import { useState, useRef, useEffect, useMemo } from "react";
import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { FileDrop } from 'react-file-drop'
import { CodeBlock, dracula } from "react-code-blocks";

import { downloadJSONData } from "~helpers";

import '~styles/DevReport.scss';

const PAGINATION_COUNT = 25;

const EVENT_TYPES = [
  'OPEN_PLATFORM_IN_TAB',
  'CLOSE_PLATFORM_IN_TAB',
  'UNFOCUS_TAB',
  'FOCUS_TAB',
  'POINTER_ACTIVITY_RECORD',
  'BROWSE_VIEW',
  'CHAT_ACTIVITY_RECORD'
]

function DevReport() {
  const fileInputRef = useRef(null);
  // const [activity = []] = useStorage("stream-selfie-activity");
  const [activity = []] = useStorage({
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