import { useStorage } from "@plasmohq/storage/hook"


function IndexPopup() {
  const [activity] = useStorage("lore-selfie-activity");
  return (
    <div
      style={{
        padding: 16
      }}>
        <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/app.html"
          })
        }}>
        ouvrir l'application
      </button>
      <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/app.html#/settings"
          })
        }}>
        ouvrir les options
      </button>
       <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/dev-dashboard.html"
          })
        }}>
        ouvrir le dashboard de développement
      </button>    
    </div>
  )
}

export default IndexPopup
