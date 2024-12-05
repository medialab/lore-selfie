export { }
import type { PlasmoCSConfig } from "plasmo"
import { v4 as generateId } from 'uuid';
import { Storage } from "@plasmohq/storage"
import { Browser, OpenPlatformInTabEvent, type captureEventsList, type ClosePlatformInTabEvent, type EventGeneric, type FocusTabEvent, type PointerActivityRecordEvent, type UnfocusTabEvent } from "~types/captureEventsTypes"
import { recordNewViewContent } from "~analyzers/recordNewViewContent";


const storage = new Storage({
  copiedKeyList: ["shield-modulation"]
})

export const config: PlasmoCSConfig = {
  // world: "MAIN",
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

function getBrowser(): Browser {
  const ua = navigator.userAgent
  let browser;

  // helper functions to deal with common regex
  function getFirstMatch(regex) {
    const match = ua.match(regex);
    return (match && match.length > 1 && match[1]) || '';
  }

  function getSecondMatch(regex) {
    const match = ua.match(regex);
    return (match && match.length > 1 && match[2]) || '';
  }

  // start detecting
  if (/opera|opr/i.test(ua)) {
    browser = {
      name: 'Opera',
      type: 'opera',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i) || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
    }
  } else if (/msie|trident/i.test(ua)) {
    browser = {
      name: 'Internet Explorer',
      type: 'msie',
      version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
    }
  } else if (/chrome.+? edge/i.test(ua)) {
    browser = {
      name: 'Microsft Edge',
      type: 'msedge',
      version: getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
    }
  } else if (/chrome|crios|crmo/i.test(ua)) {
    browser = {
      name: 'Google Chrome',
      type: 'chrome',
      version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
    }
  } else if (/firefox/i.test(ua)) {
    browser = {
      name: 'Firefox',
      type: 'firefox',
      version: getFirstMatch(/(?:firefox)[ \/](\d+(\.\d+)?)/i)
    }
  } else if (!(/like android/i.test(ua)) && /android/i.test(ua)) {
    browser = {
      name: 'Android',
      type: 'android',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else if (/safari/i.test(ua)) {
    browser = {
      name: 'Safari',
      type: 'safari',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else {
    browser = {
      name: getFirstMatch(/^(.*)\/(.*) /),
      version: getSecondMatch(/^(.*)\/(.*) /)
    }
    browser.type = browser.name.toLowerCase().replace(/\s/g, '');
  }
  return browser;
}

const getPlatform = (url: String): String => {
  const youtubeURLS = [
    "https://www.youtube.com",
    "http://www.youtube.com",
    "https://youtube.com",
    "http://youtube.com",
    "https://youtu.be",
  ]
  if (youtubeURLS.find(pattern => url.includes(pattern))) {
    return 'YOUTUBE';
  } else if (url.includes('twitch')) {
    return 'TWITCH';
  } else if (url.includes('tiktok')) {
    return 'TIKTOK';
  }
}

const addEvent = async (evt: EventGeneric) => {
  const data: captureEventsList = await storage.get("stream-selfie-activity");
  let updatedData;
  if (data) {
    updatedData = [...data, evt]
  } else {
    updatedData = [evt]
  }
  // console.debug({existing: data, evt});
  await storage.set("stream-selfie-activity", updatedData);
}


const main = async () => {
  // const data = await storage.get("stream-selfie-activity");
  const browser = getBrowser();
  const injectionId = generateId();
  const platform = getPlatform(window.location.href);
  const openPlatformInTabEvent: OpenPlatformInTabEvent = {
    type: "OPEN_PLATFORM_IN_TAB",
    id: generateId(),
    date: new Date(),
    url: window.location.href,
    injectionId,
    browser,
    platform,
  };
  await addEvent(openPlatformInTabEvent);
  recordNewViewContent({
    injectionId,
    platform,
    url: window.location.href,
    addEvent,
  });
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
      type: "FOCUS_TAB",
      id: generateId(),
      date: new Date(),
      url: window.location.href,
      injectionId,
      platform,
    };
    await addEvent(focusTabEvent);
  };
  window.onblur = async function () {
    const unfocusTabEvent: UnfocusTabEvent = {
      type: "UNFOCUS_TAB",
      id: generateId(),
      date: new Date(),
      url: window.location.href,
      injectionId,
      platform,
    };
    await addEvent(unfocusTabEvent);
  };
  // pointer activity monitoring
  interface MousePosition {
    posX: number,
    posY: number
  }
  let mousePosition: MousePosition;
  window.onmousemove = event => {
    var posX = event.clientX;
    var posY = event.clientY;
    mousePosition = { posX, posY }
  }
  const MOUSE_TRACK_TIMESPAN = 5000;
  let prevMousePosition = mousePosition;
  setInterval(async () => {
    if (!document.hasFocus()) {
      return;
    }
    let mouseHasMoved = false;
    if (!prevMousePosition && mousePosition) {
      mouseHasMoved = true;
    }
    if (prevMousePosition && mousePosition && (prevMousePosition.posX !== mousePosition.posX || prevMousePosition.posY !== mousePosition.posY)) {
      mouseHasMoved = true;
    }
    const pointerActivityRecordEvent: PointerActivityRecordEvent = {
      type: "POINTER_ACTIVITY_RECORD",
      id: generateId(),
      date: new Date(),
      url: window.location.href,
      injectionId,
      platform,
      timeSpan: MOUSE_TRACK_TIMESPAN,
      activityScore: mouseHasMoved ? 1 : 0,
    };
    await addEvent(pointerActivityRecordEvent);
    prevMousePosition = mousePosition;
  }, MOUSE_TRACK_TIMESPAN);

  const bodyList = document.querySelector('body');
  let oldHref = window.location.href;

  const observer = new MutationObserver(function (mutations) {
    if (oldHref != document.location.href) {
      oldHref = document.location.href;
      /* Changed ! your code here */
      console.log('location has been changed, baby: %s', document.location.href);
      // const newPlatform = getPlatform(document.location.href);
      recordNewViewContent({
        injectionId,
        platform,
        url: document.location.href,
        addEvent,
      });
    }
  });
  const config = {
    childList: true,
    subtree: true
  };
  observer.observe(bodyList, config);

  // function watchHistoryEvents() {
  //   const { pushState, replaceState } = window.history;

  //   window.history.pushState = function (...args) {
  //     pushState.apply(window.history, args);
  //     window.dispatchEvent(new Event('pushState'));
  //   };

  //   window.history.replaceState = function (...args) {
  //     replaceState.apply(window.history, args);
  //     window.dispatchEvent(new Event('replaceState'));
  //   };

  //   window.addEventListener('popstate', (event) => console.log('popstate event', event));
  //   window.addEventListener('replaceState', (event) => console.log('replaceState event', event));
  //   window.addEventListener('pushState', (event) => console.log('pushState event', event.target.location.href));
  // }
  // watchHistoryEvents();
}

main();