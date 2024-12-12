export { }
import cssText from "data-text:~/contents/witness.css"

import "./witness.css"

import type {
  PlasmoCSConfig,
  PlasmoGetOverlayAnchor,
} from "plasmo"

/**
 * Content script config
 */
export const config: PlasmoCSConfig = {
  matches: [
    "https://www.youtube.com/*",
    "http://www.youtube.com/*",
    "https://youtube.com/*",
    "http://youtube.com/*",
    "https://youtu.be/*",
    "https://www.twitch.tv/*",
    "https://tiktok.com/*",
  ],
  // world: "MAIN"
}


export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(`body`)

const Witness = () => (
  <span
    className="lore-politics-witness-container"
  >
    <span className="witness-text">
    Enregistrement de l'activité par le plugin lore selfie (ces données ne sont jamais partagées automatiquement)
    </span>
  </span>
)

export default Witness