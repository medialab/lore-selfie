import { useStorage } from "@plasmohq/storage/hook"

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
  const [activity] = useStorage("activity");
  return (
    <div>
      <p>Coucou dev report</p>
      <pre>
        <code>
          {JSON.stringify(activity)}
        </code>
      </pre> 
      <div>
        <button
          onClick={() => downloadData(activity)}
        >
          Télécharger les données au format JSON
        </button>
      </div>
    </div>
  )
}
 
export default DevReport