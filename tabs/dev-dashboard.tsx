import { useState, useRef, useEffect, useMemo } from "react";
// import { useStorage } from "@plasmohq/storage/hook"
import { usePort } from "@plasmohq/messaging/hook"
// import { Storage } from "@plasmohq/storage"
import { FileDrop } from 'react-file-drop'
import { CodeBlock, dracula } from "react-code-blocks";

import { downloadTextfile, formatNumber, buildDateKey } from "~helpers";

import '~styles/DevDashboard.scss';
import { EVENT_TYPES, ACTION_END, ACTION_PROGRESS, APPEND_ACTIVITY_EVENTS, DELETE_ALL_DATA, DUPLICATE_DAY_DATA, PREPEND_ACTIVITY_EVENTS, REPLACE_ACTIVITY_EVENTS, SERIALIZE_ALL_DATA, SET_SETTINGS, SET_ANNOTATIONS, GET_SETTINGS, GET_ANNOTATIONS } from "~constants";
// import { useInterval } from "usehooks-ts";

const PAGINATION_COUNT = 25;

// const EVENT_TYPES = [
//   'OPEN_PLATFORM_IN_TAB',
//   'CLOSE_PLATFORM_IN_TAB',
//   'BLUR_TAB',
//   'FOCUS_TAB',
//   'FOCUS_ON_REACTION_INPUT',
//   'BLUR_ON_REACTION_INPUT',
//   // 'POINTER_ACTIVITY_RECORD',
//   'BROWSE_VIEW',
//   'CHAT_ACTIVITY_RECORD',
//   // 'IS_PLAYING_ACTIVITY_RECORD',
//   'LIVE_USER_ACTIVITY_RECORD',
// ]

type DashboardRequestBody = {
  types: Array<String>
  reverseOrder: Boolean
  page: number
  itemsPerPage: number
}

type DashboardResponseBody = {
  types: Array<String>
  items: Array<Object>
  page: number
  filteredCount: number
  totalCount: number
  pagesCount: number
}

function DevDashboard() {
  const dashboardPort = usePort<DashboardRequestBody, DashboardResponseBody>("devdashboard")
  const ioPort = usePort('io');
  const activitiesPort = usePort("activitycrud")
  const annotationsPort = usePort("annotationscrud")
  const settingsPort = usePort("settingscrud")

  const fileInputRef = useRef(null);
  // const [activity = [], setActivity] = useStorage({
  //   key: "lore-selfie-activity",
  //   instance: new Storage({
  //     area: "local"
  //   })
  // });
  const [visibleTypes, setVisibleTypes] = useState(
    ['BROWSE_VIEW']
  );
  const [reverseOrder, setReverseOrder] = useState(false);
  // const [uploadMode, setUploadMode] = useState('prepend');
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState();
  const [numberOfPages, setNumberOfPages] = useState();
  const [totalCount, setTotalCount] = useState();
  const [filteredCount, setFilteredCount] = useState();
  const [previewedItems, setPreviewedItems] = useState();
  const [appSettings, setAppSettings] = useState();
  const [appAnnotations, setAppAnnotations] = useState();

  const [isWorking, setIsWorking] = useState(false);
  const [isWorkingShareStatus, setIsWorkingShareStatus] = useState({current: 0, total: 0});
  const [pendingForDownload, setPendingForDownload] = useState(false);

  const requestPreviewUpdate = () => {
    const payload = {
      types: visibleTypes,
      reverseOrder,
      page: currentPreviewPage,
      itemsPerPage: PAGINATION_COUNT
    }
    setIsLoadingPreview(true);
    // console.debug('send dashboard preview request', payload);
    dashboardPort.send(payload)
  }

  useEffect(() => {
    settingsPort.send({ actionType: GET_SETTINGS })
    annotationsPort.send({ actionType: GET_ANNOTATIONS })
  }, [])

  // useInterval(() => requestPreviewUpdate(), 2000);

  useEffect(() => {
    requestPreviewUpdate();
  }, [reverseOrder, currentPreviewPage, visibleTypes])

  settingsPort.listen(data => {
    if (data.actionType === GET_SETTINGS && data.result.status === 'success') {
      setAppSettings(data.result.data);
    }
  })
  annotationsPort.listen(data => {
    if (data.actionType === GET_ANNOTATIONS && data.result.status === 'success') {
      setAppAnnotations(data.result.data);
    }
  })

  ioPort.listen(data => {
    if (data.actionType === SERIALIZE_ALL_DATA && data.result.status === 'success' && pendingForDownload) {
      downloadTextfile(data.result.data, `lore-selfie-activity-${new Date().toUTCString()}.json`, 'application/json')
      setPendingForDownload(false);
    }
    if (data.actionType === DELETE_ALL_DATA && data.result.status === 'success') {
      setIsWorking(false)
      requestPreviewUpdate();
    }
  })
  activitiesPort.listen(data => {
    if (data.responseType === ACTION_END) {
      setIsWorking(false);
      setIsWorkingShareStatus(undefined);
      requestPreviewUpdate();
    } else if (data.responseType === ACTION_PROGRESS) {
      setIsWorkingShareStatus({
        current: data.current,
        total: data.total
      });
    }
  })

  dashboardPort.listen(data => {
    // console.log('mailport data', data)
    if (data) {
      const {
        items,
        page,
        pagesCount,
        totalCount,
        filteredCount,
        // types
      } = data;
      setPreviewedItems(items);
      setTotalCount(totalCount);
      setNumberOfPages(pagesCount);
      setFilteredCount(filteredCount);
      setCurrentPreviewPage(page);
      setIsLoadingPreview(false);
    }
  });

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
          // @todo improve that with proper schema-like validation
          const recordKeys = [
            "type",
            "title",
            "date",
            "pluginVersion",
            "learnMoreURL",
            "activities",
            "settings",
            "annotations"
          ];

          if (recordKeys.every(k => k in data)) {
            const confirmed = confirm('L\'entièreté de l\'historique d\'activité, des paramètres et des annotations actuelles va être écrasée et remplacée par les données du fichier versé. Confirmer ?');
            if (confirmed) {
              // newActivity = data;
              setIsWorking(true);
              activitiesPort.send({
                actionType: REPLACE_ACTIVITY_EVENTS,
                payload: {
                  data: data.activities
                }
              })
              settingsPort.send({
                actionType: SET_SETTINGS,
                payload: {
                  data: data.settings
                }
              })
              annotationsPort.send({
                actionType: SET_ANNOTATIONS,
                payload: {
                  value: data.annotations
                }
              })
            }

            // let newActivity;
            // switch (uploadMode) {
            // case 'prepend':
            //   // console.log('send prepend request to cudport', data);
            //   setIsWorking(true);
            //   activitiesPort.send({
            //     actionType: PREPEND_ACTIVITY_EVENTS,
            //     payload: {
            //       data
            //     }
            //   })
            //   break;
            // case 'append':
            //   setIsWorking(true);
            //   activitiesPort.send({
            //     actionType: APPEND_ACTIVITY_EVENTS,
            //     payload: {
            //       data
            //     }
            //   })
            //   break;
            //   case 'replace':
            //     const confirmed = confirm('L\'entièreté de l\'historique d\'activité actuel va être écrasé et remplacé par celui du fichier versé. Confirmer ?');
            //     if (confirmed) {
            //       // newActivity = data;
            //       setIsWorking(true);
            //       activitiesPort.send({
            //         actionType: REPLACE_ACTIVITY_EVENTS,
            //         payload: {
            //           data
            //         }
            //       })
            //     }
            //     break;
            //   default:
            //     break;
            // }
            // if (newActivity) {
            //   const storage = new Storage({
            //     area: "local",
            //   });
            //   console.info('set activity');
            //   storage.set('lore-selfie-activity', newActivity);
            // }
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

  const paginations = useMemo(() => {
    if (!numberOfPages) {
      return [];
    }
    let pages = [];
    for (let i = 0; i < numberOfPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [numberOfPages]);

  const handleDuplicateTodayForPastDays = async (numberOfDays = 100) => {
    if (!confirm(`Vous allez définitivement modifier l'historique en multipliant sa taille par ${numberOfDays} dans le cadre du test de charge. Continuer ?`)) {
      return;
    }
    const todaySlug = buildDateKey(new Date());
    setIsWorking(true);
    activitiesPort.send({
      actionType: DUPLICATE_DAY_DATA,
      payload: {
        daySlug: todaySlug,
        numberOfDays
      }
    })
    // console.debug('done');
  }
  const previewedItemsStr = useMemo(() => JSON.stringify(previewedItems, null, 2), [previewedItems])
  return (
    <div className="DevDashboard">

      <h1><strong>lore selfie</strong> | dashboard de développement</h1>
      <div className="about">
        <h3>Qu'est-ce que cette page ?</h3>
        <p>Cette page est dédiée aux développeur·euses qui désirent visualiser, télécharger et manipuler les données créées avec l'extension lore selfie installée sur ce navigateur à des fins de test technique et d'expérimenation.</p>
        <p>Ne l'utilisez que si vous savez ce que vous faites, au risque de compromettre vos données patiemment constituées !</p>
      </div>
      <div className="ui">
        <div className="ui-section">
          <h2>Grandes manœuvres sur les données</h2>
          <button
            className="important-button"
            onClick={() => {
              ioPort.send({ actionType: SERIALIZE_ALL_DATA })
              setPendingForDownload(true);
            }}
          >
            Télécharger toutes les données de l'extension
          </button>
          <button className="important-button danger"
            onClick={() => {

              const confirmed = confirm("Supprimer toutes les données enregistrées par lore selfie ?")
              if (confirmed) {
                // console.log('send cud port action')
                setIsWorking(true);
                ioPort.send({ actionType: DELETE_ALL_DATA })
              }
            }}
          >
            Supprimer toutes les données
          </button>
        </div>
        <div className="ui-section">
          <h2>Charger des données précédemment téléchargées</h2>
          <div>
          </div>
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

        </div>
        <div className="ui-section">
          <h2>Tests de charge (pour évaluer la robustesse de l'extension à de grands volumes)</h2>
          <ul>
            <li><button className="important-button ok full-width"
              onClick={() => handleDuplicateTodayForPastDays(10)}
            >
              Dupliquer les données d'aujourd'hui sur les 10 derniers jours
            </button>
            </li>
            <li><button className="important-button warning full-width"
              onClick={() => handleDuplicateTodayForPastDays(100)}
            >
              Dupliquer les données d'aujourd'hui sur les 100 derniers jours
            </button>
            </li>
            <li><button className="important-button danger full-width"
              onClick={() => handleDuplicateTodayForPastDays(1000)}
            >
              Dupliquer les données d'aujourd'hui sur les 1000 derniers jours (2 ans et demi)
            </button>
            </li>
            <li><button className="important-button danger full-width"
              onClick={() => handleDuplicateTodayForPastDays(10000)}
            >
              Dupliquer les données d'aujourd'hui sur les 10000 derniers jours (27 ans)
            </button>
            </li>
          </ul>
        </div>
        
        <div className="ui-section">
          <h2>Visualisation des données brutes</h2>
          <h3>Montrer les types d'évènements</h3>
          <ul>
            {
              EVENT_TYPES.map(type => {
                const checked = visibleTypes.includes(type);
                const handleClick = () => {
                  if (checked) {
                    setVisibleTypes(
                      visibleTypes.filter(t => t !== type)
                    )
                  } else {
                    setVisibleTypes([
                      ...visibleTypes,
                      type
                    ])
                  }
                }
                return (
                  <li key={type}
                    onClick={handleClick}
                    style={{cursor: 'pointer'}}
                  >
                    <span
                    >
                      <input type="checkbox" checked={checked} readOnly />
                    </span>
                    <code>
                      {type}
                    </code>
                  </li>
                )
              })
            }
          </ul>
          <div>
            <button onClick={() => setVisibleTypes([])}>
              Cacher tout
            </button>
            <button onClick={() => setVisibleTypes([...EVENT_TYPES])}>
              Montrer tout
            </button>
          </div>

          <h2>
            <span>
              Visualisation de {filteredCount === undefined ? '?' : filteredCount} évènements sur {totalCount === undefined ? '?' : formatNumber(totalCount)} tous types d'évènements confondus (page {reverseOrder ? paginations.length - currentPreviewPage : currentPreviewPage + 1} / {paginations.length})
            </span>
          </h2>
          <div >
            <div className="row">
              <div>
                <button className="important-button"
                  onClick={() => requestPreviewUpdate()}
                >
                  Rafraîchir
                </button>

                <button className="important-button" onClick={() => setReverseOrder(!reverseOrder)}>
                  {
                    reverseOrder ?
                      'Du plus récent au plus ancien'
                      :
                      'Du plus ancien au plus récent'
                  }
                </button>
                <button className="important-button" disabled={isLoadingPreview || currentPreviewPage === 0} onClick={() => setCurrentPreviewPage(currentPreviewPage - 1)}>
                  {'< page précédente'}
                </button>
                <button className="important-button" disabled={isLoadingPreview || currentPreviewPage >= paginations.length - 1} onClick={() => setCurrentPreviewPage(currentPreviewPage + 1)}>
                  {'page suivante >'}
                </button>
              </div>
              <div >
                {paginations.length > 1 ?
                  (paginations < 10 ? paginations :
                    [
                      ...(currentPreviewPage > 6 ? [...paginations.slice(0, 5), '...'] : paginations.slice(0, currentPreviewPage > 0 ? currentPreviewPage - 1 : 1)),
                      ...paginations.slice(currentPreviewPage > 0 ? currentPreviewPage - 1 : 1, currentPreviewPage < 4 ? 5 : currentPreviewPage + 2),
                      ...(currentPreviewPage < paginations.length - 6 ? ['...'] : []),
                      ...paginations.slice(currentPreviewPage < paginations.length - 6 ? paginations.length - 5 : currentPreviewPage + 2, paginations.length)
                    ]).map((pageNumber, index) => {
                      return (
                        <button
                          disabled={pageNumber === '...'} onClick={() => pageNumber !== '...' ? setCurrentPreviewPage(pageNumber) : undefined}
                          key={index}
                          className={`important-button pagination ${currentPreviewPage === pageNumber ? 'active' : ''}`}>
                          {pageNumber === '...' ? pageNumber : reverseOrder ? paginations.length - pageNumber : pageNumber + 1}
                        </button>
                      )
                    })
                  : null
                }
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="data-preview">

        {
          isLoadingPreview ? <div>Chargement</div> :
            <CodeBlock
              text={previewedItemsStr}
              language={'json'}
              showLineNumbers
              theme={dracula}
            />
        }
        {
          !appSettings ? <div>Chargement</div> :
            <div>
              <h3>Paramètres (<code>settings</code>)</h3>
              <CodeBlock
                text={JSON.stringify(appSettings, null, 2)}
                language={'json'}
                showLineNumbers
                theme={dracula}
              />
            </div>
        }
        {
          !appAnnotations ? <div>Chargement</div> :
            <div>
              <h3>Annotations (<code>annotations</code>)</h3>
              <CodeBlock
                text={JSON.stringify(appAnnotations, null, 2)}
                language={'json'}
                showLineNumbers
                theme={dracula}
              />
            </div>
        }

        {/* <div>
          {paginations.length > 1 ?
            paginations.map(pageNumber => {
              return (
                <button onClick={() => setCurrentPreviewPage(pageNumber)} key={pageNumber} className={`pagination ${currentPreviewPage === pageNumber ? 'active' : ''}`}>
                  {pageNumber + 1}
                </button>
              )
            })
            : null
          }
        </div> */}
      </div>
      <div className={`worker-loading-container ${isWorking ? 'active' : ''}`}>
        Opérations en cours {isWorkingShareStatus ? `${isWorkingShareStatus.current + 1} / ${isWorkingShareStatus.total} (${Math.round(isWorkingShareStatus.current / isWorkingShareStatus.total * 100)}%)` : ''}
      </div>
    </div>
  )
}

export default DevDashboard