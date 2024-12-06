import { useStorage } from "@plasmohq/storage/hook"


function IndexPopup() {
  const [activity] = useStorage("stream-selfie-activity");
  return (
    <div
      style={{
        padding: 16
      }}>
       <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/dev-report.html"
          })
        }}>
        ouvrir le rapport de dev
      </button>
      <div>
        Données d'activité :
      </div>
      <pre>
        <code>
          {JSON.stringify(activity)}
        </code>
      </pre>      
    </div>
  )
}

export default IndexPopup