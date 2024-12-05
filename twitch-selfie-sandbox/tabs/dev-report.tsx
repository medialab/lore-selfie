import { useStorage } from "@plasmohq/storage/hook"
import { Storage } from "@plasmohq/storage"

function downloadData(data:Object, filename='selfie-data.json') {
  
  let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  let dlURL = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = dlURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}

function DevReport() {
  const [activity] = useStorage("stream-selfie-activity");
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
      <pre>
        <code>
          {JSON.stringify(activity, null, 2)}
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