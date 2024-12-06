import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"
import { useState } from "react";

function downloadData(data:Object, filename='selfie-data.json') {
  
  let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  let dlURL = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = dlURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

const EVENT_TYPES = [
  'OPEN_PLATFORM_IN_TAB',
  'CLOSE_PLATFORM_IN_TAB',
  'UNFOCUS_TAB',
  'FOCUS_TAB',
  'POINTER_ACTIVITY_RECORD',
  'BROWSE_VIEW'
]

function DevReport() {
  const [activity = []] = useStorage("stream-selfie-activity");
  const [hiddenTypes, setHiddenTypes] = useState(
    EVENT_TYPES.filter(e => e !== 'BROWSE_VIEW')
  );
  console.debug('activity', activity);
  return (
    <div>
      <h1>Dev report</h1>
      <div>
        <button
          onClick={() => downloadData(activity)}
        >
          Télécharger les données au format JSON
        </button>
        <button
          onClick={() => {
            const storage = new Storage()
            storage.clear()
          }}
        >
          Supprimer toutes les données
        </button>
      </div>
      <div>
        <p>Cacher les types : </p>
        <ul>
          {
            EVENT_TYPES.map(type => {
              const checked = hiddenTypes.includes(type);
              return (
                <li key={type}>
                  <span>
                    <input type="checkbox" checked={checked} onClick={() => {
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
                    }}/>
                  </span>
                  <span>
                    {type}
                  </span>
                </li>
              )
            })
          }
        </ul>
      </div>
      <pre>
        <code>
          {JSON.stringify(
            (activity || []).filter((event) => !hiddenTypes.includes(event.type))
          , null, 2)}
        </code>
      </pre> 
      <style>{`
      pre {
    background-color: #D1D1D0;
    overflow: auto;
    font-family: 'Monaco', monospace;
    padding: 0 1em;
  }



code {
    font-family: Monaco, monospace;
    font-size: $base-font-size;
    line-height: 100%;
    background-color: #eee;
    padding: 0.2em;
    letter-spacing: -0.05em;
    word-break: normal;
    /border-radius: 5px;/
  }



pre code {
    border: none;
    background: none;
    font-size: $base-font-size * 0.875;
    line-height: 1em;
    letter-spacing: normal;
    word-break: break-all;
  }
      `}</style>
      
    </div>
  )
}
 
export default DevReport