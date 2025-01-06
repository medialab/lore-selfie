export { }
import type { PlasmoCSConfig } from "plasmo"
import { v4 as generateId } from 'uuid';
import { Storage } from "@plasmohq/storage"
import { Browser, OpenPlatformInTabEvent, type captureEventsList, type ClosePlatformInTabEvent, type EventGeneric, type FocusTabEvent, type PointerActivityRecordEvent, type BlurTabEvent } from "~types/captureEventsTypes"
import { recordNewViewContent } from "~analyzers/recordNewViewContent";
import { getPlatform, getBrowser } from "~helpers";
import { updateLiveTracking } from "~analyzers/livetrackers";
import { BLUR_TAB, DEFAULT_SETTINGS, FOCUS_TAB, OPEN_PLATFORM_IN_TAB } from "~constants";
import type { Settings } from "~types/settings";

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
}

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

let routine; // interval used in live tracking

/**
 * Adds to local storage a record about an activity from the user
 * @param evt event to add to local storage activity history
 */
const addEvent = async (evt: EventGeneric) => {
  const data: captureEventsList = await storage.get("lore-selfie-activity");
  let updatedData;
  if (data) {
    updatedData = [...data, evt]
  } else {
    updatedData = [evt]
  }
  console.debug('add event to lore-selfie-activity', evt);
  await storage.set("lore-selfie-activity", updatedData);
}

const main = async () => {
  const settings: Settings = await storage.get("lore-selfie-settings") || DEFAULT_SETTINGS;
  console.log('init lore selfie tracker with settings', settings);
  const browser = getBrowser();
  const injectionId = generateId();
  const platform = getPlatform(window.location.href);

  if (!settings.recordActivity || !settings.recordOnPlatforms.includes(platform)){
    return;
  } 
  const openPlatformInTabEvent: OpenPlatformInTabEvent = {
    type: OPEN_PLATFORM_IN_TAB,
    id: generateId(),
    date: new Date(),
    url: window.location.href,
    injectionId,
    browser,
    platform,
  };
  await addEvent(openPlatformInTabEvent);
  let activeViewType = await recordNewViewContent({
    injectionId,
    platform,
    url: window.location.href,
    addEvent,
  });
  // disabled because it added a confirmation alert each time platform was exited
  // window.onbeforeunload = async function () {
  //   const closePlatformInTabEvent: ClosePlatformInTabEvent = {
  //     type: "CLOSE_PLATFORM_IN_TAB",
  //     id: generateId(),
  //     date: new Date(),
  //     url: window.location.href,
  //     injectionId,
  //     platform,
  //   };
  //   await addEvent(closePlatformInTabEvent);
  //   return undefined;
  // }
  window.onfocus = async function () {
    const focusTabEvent: FocusTabEvent = {
      type: FOCUS_TAB,
      id: generateId(),
      date: new Date(),
      url: window.location.href,
      injectionId,
      platform,
    };
    await addEvent(focusTabEvent);
  };
  window.onblur = async function () {
    const blurTabEvent: BlurTabEvent = {
      type: BLUR_TAB,
      id: generateId(),
      date: new Date(),
      url: window.location.href,
      injectionId,
      platform,
    };
    await addEvent(blurTabEvent);
  };
  // pointer activity monitoring
  // interface MousePosition {
  //   posX: number,
  //   posY: number
  // }
  // let mousePosition: MousePosition;
  // window.onmousemove = event => {
  //   var posX = event.clientX;
  //   var posY = event.clientY;
  //   mousePosition = { posX, posY }
  // }
  // let prevMousePosition = mousePosition;
  // setInterval(async () => {
  //   if (!document.hasFocus()) {
  //     return;
  //   }
  //   // let mouseHasMoved = false;
  //   // if (!prevMousePosition && mousePosition) {
  //   //   mouseHasMoved = true;
  //   // }
  //   // if (prevMousePosition && mousePosition && (prevMousePosition.posX !== mousePosition.posX || prevMousePosition.posY !== mousePosition.posY)) {
  //   //   mouseHasMoved = true;
  //   // }
  //   const pointerActivityRecordEvent: PointerActivityRecordEvent = {
  //     type: "POINTER_ACTIVITY_RECORD",
  //     id: generateId(),
  //     date: new Date(),
  //     url: window.location.href,
  //     injectionId,
  //     platform,
  //     timeSpan: LIVE_ACTIVITY_TRACK_TIMESPAN,
  //     activityScore: mouseHasMoved ? 1 : 0,
  //   };
  //   await addEvent(pointerActivityRecordEvent);
  //   prevMousePosition = mousePosition;
  // }, LIVE_ACTIVITY_TRACK_TIMESPAN);

  const bodyList = document.querySelector('body');
  let oldHref = window.location.href;

  const onCurrentURLChange = (URL) => {
    if (oldHref !== URL) {
      console.warn('untracked current url change from live tracking', URL);
      alert('untracked current url change from live tracking : ' + URL);
    }
  }

  /**
   * Listen to location changes to trigger view change events
   */
  const observer = new MutationObserver(async function (mutations) {
    if (oldHref != document.location.href) {
      oldHref = document.location.href;
      console.log('location has been changed, baby: %s', document.location.href);
      activeViewType = await recordNewViewContent({
        injectionId,
        platform,
        url: document.location.href,
        addEvent,
      });
      if (routine) {
        clearInterval(routine);
      }
      routine = updateLiveTracking({
        settings,
        activeViewType,
        platform,
        injectionId,
        addEvent,
        currentURL: document.location.href,
        onCurrentURLChange,
      });
    }
  });
  const config = {
    childList: true,
    subtree: true
  };
  observer.observe(bodyList, config);

  console.log('active view type', activeViewType);
  if (routine) {
    clearInterval(routine);
  }
  routine = updateLiveTracking({
    settings,
    activeViewType,
    platform,
    injectionId,
    addEvent,
    currentURL: document.location.href,
    onCurrentURLChange: onCurrentURLChange
  });
}

main();