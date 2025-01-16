import { v4 as generateId } from "uuid"

import { Storage } from "@plasmohq/storage"

import {
  BLUR_ON_REACTION_INPUT,
  CHAT_ACTIVITY_RECORD,
  DEFAULT_SETTINGS,
  FOCUS_ON_REACTION_INPUT,
  LIVE_USER_ACTIVITY_RECORD,
  PLATFORMS
} from "~constants"
import type {
  BlurOnReactionInputEvent,
  ChatActivityRecordEvent,
  FocusOnReactionInputEvent,
  LiveUserActivityRecordEvent,
  TwitchMessageRecord
} from "~types/captureEventsTypes"
import type { Settings } from "~types/settings"

const storage = new Storage({
  area: "local"
  // copiedKeyList: ["shield-modulation"],
})

const Platforms = [...PLATFORMS] as const
type Platform = (typeof Platforms)[number]
interface LiveTrackerProps {
  settings: Settings
  injectionId: string
  addEvent: Function
  platform: Platform
  currentURL: string
  onCurrentURLChange: Function
  activeViewType?: string
}

interface TrackersType {
  twitch: any
  youtube: any
}
const trackers: TrackersType = {
  twitch: {
    live: async ({
      settings,
      injectionId,
      addEvent,
      platform,
      currentURL,
      onCurrentURLChange
    }: LiveTrackerProps) => {
      const { liveRecordingInterval, recordTabs, recordMouse, recordChat } =
        settings
      const URL = document.location.href
      if (URL !== currentURL) {
        onCurrentURLChange(URL)
      }
      const chatInput = document.querySelector(".chat-input__textarea textarea")
      // console.log('chat input', chatInput);
      if (chatInput) {
        const onFocus = async () => {
          const focusOnReactionInputEvent: FocusOnReactionInputEvent = {
            type: FOCUS_ON_REACTION_INPUT,
            id: generateId(),
            date: new Date(),
            url: window.location.href,
            injectionId,
            platform
          }
          await addEvent(focusOnReactionInputEvent)
        }
        const onBlur = async () => {
          const blurOnReactionInputEvent: BlurOnReactionInputEvent = {
            type: BLUR_ON_REACTION_INPUT,
            id: generateId(),
            date: new Date(),
            url: window.location.href,
            injectionId,
            platform
          }
          await addEvent(blurOnReactionInputEvent)
        }
        chatInput.addEventListener("focus", onFocus)
        chatInput.addEventListener("blur", onBlur)
      }
      interface MousePosition {
        posX: number
        posY: number
      }
      let mousePosition: MousePosition
      window.onmousemove = (event) => {
        const posX = event.clientX
        const posY = event.clientY
        mousePosition = { posX, posY }
      }
      let prevMousePosition = mousePosition
      // let prevIsPlaying = document.querySelector('button[data-a-player-state="paused"]') === null;

      return setInterval(async () => {
        // check settings still allow recording
        const settings: Settings =
          (await storage.get("lore-selfie-settings")) || DEFAULT_SETTINGS
        if (
          !settings.recordActivity ||
          !settings.recordOnPlatforms.includes(platform)
        ) {
          return
        }
        console.debug("track live data", new Date().toLocaleTimeString())

        if (currentURL !== document.location.href) {
          console.log("url has changed, was it recorded ?")
        }
        const containerSelectors = [".chat-line__message", ".vod-message"]
        const unparsedMessages = Array.from(
          document.querySelectorAll(
            containerSelectors
              .map((s) => s + ":not([data-lore-selfie-parsed])")
              .join(", ")
          )
        )
        // const parsedMessages = Array.from(document.querySelectorAll(containerSelectors.map(s => s + '[data-lore-selfie-parsed="1"]').join(', ')));
        // const allMessages = Array.from(document.querySelectorAll(containerSelectors.join(', ')));
        // console.log({parsedMessages, unparsedMessages, allMessages})
        const messages = unparsedMessages.map((el): TwitchMessageRecord => {
          el.setAttribute("data-lore-selfie-parsed", "1")
          return {
            message: el.querySelector(
              '[data-a-target="chat-line-message-body"]'
            )?.textContent,
            author: el.querySelector(".chat-author__display-name")?.textContent,
            emote: el.querySelector(".chat-image__container") && {
              alt: el
                .querySelector(".chat-image__container img")
                ?.getAttribute("alt"),
              src: el
                .querySelector(".chat-image__container img")
                ?.getAttribute("src")
            }
          }
        })

        const viewersCount = document
          .querySelector(
            "#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div"
          )
          ?.textContent?.replace(" ", "")
        const chatActivityRecordEvent: ChatActivityRecordEvent = {
          type: CHAT_ACTIVITY_RECORD,
          id: generateId(),
          date: new Date(),
          url: window.location.href,
          injectionId,
          timeSpan: +liveRecordingInterval,
          platform,
          messages,
          messagesCount: messages.length,
          viewersCount: +(viewersCount || 0),
          messagesAverageCharLength:
            messages.reduce(
              (sum, m) => sum + (m.message ? m.message.length : 0),
              0
            ) / messages.length
        }
        if (recordChat) {
          await addEvent(chatActivityRecordEvent)
        }

        // record pause events
        const isPlaying =
          document.querySelector(".ytd-player .playing-mode") !== null

        let mouseHasMoved = false
        if (!prevMousePosition && mousePosition) {
          mouseHasMoved = true
        }
        if (
          prevMousePosition &&
          mousePosition &&
          (prevMousePosition.posX !== mousePosition.posX ||
            prevMousePosition.posY !== mousePosition.posY)
        ) {
          mouseHasMoved = true
        }
        const LiveUserActivityRecordEvent: LiveUserActivityRecordEvent = {
          type: LIVE_USER_ACTIVITY_RECORD,
          id: generateId(),
          date: new Date(),
          url: window.location.href,
          injectionId,
          timeSpan: +liveRecordingInterval,
          platform,
          pointerActivityScore: recordMouse
            ? mouseHasMoved
              ? 1
              : 0
            : undefined,
          hasFocus: recordTabs ? document.hasFocus() : undefined,
          isPlaying
        }
        prevMousePosition = mousePosition
        await addEvent(LiveUserActivityRecordEvent)

        // const IsPlayingActivityRecord: IsPlayingActivityRecord = {
        //   type: "IS_PLAYING_ACTIVITY_RECORD",
        //   id: generateId(),
        //   date: new Date(),
        //   url: window.location.href,
        //   injectionId,
        //   timeSpan: liveRecordingInterval,
        //   platform,
        //   isPlaying,
        // }
        // await addEvent(IsPlayingActivityRecord);
        // prevIsPlaying = isPlaying
        // }
      }, +liveRecordingInterval)
    }
  },
  youtube: {
    video: async ({
      settings,
      injectionId,
      addEvent,
      platform,
      currentURL,
      onCurrentURLChange
    }: LiveTrackerProps) => {
      const { liveRecordingInterval, recordTabs, recordMouse, recordChat } =
        settings
      const URL = document.location.href
      if (URL !== currentURL) {
        onCurrentURLChange(URL)
      }
      interface MousePosition {
        posX: number
        posY: number
      }
      let mousePosition: MousePosition
      window.onmousemove = (event) => {
        const posX = event.clientX
        const posY = event.clientY
        mousePosition = { posX, posY }
      }
      let prevMousePosition = mousePosition
      // console.log('in video youtube, interval', liveRecordingInterval)
      // let prevIsPlaying = document.querySelector('.ytd-player .playing-mode') !== null;
      return setInterval(async () => {
        // check settings still allow recording
        const settings: Settings =
          (await storage.get("lore-selfie-settings")) || DEFAULT_SETTINGS
        if (
          !settings.recordActivity ||
          !settings.recordOnPlatforms.includes(platform)
        ) {
          return
        }
        console.debug("track live data", new Date().toLocaleTimeString())
        const isPlaying =
          document.querySelector(".ytd-player .playing-mode") !== null
        const currentMediaTime =
          document.querySelector(".ytp-time-current")?.textContent
        let mouseHasMoved = false
        if (!prevMousePosition && mousePosition) {
          mouseHasMoved = true
        }
        if (
          prevMousePosition &&
          mousePosition &&
          (prevMousePosition.posX !== mousePosition.posX ||
            prevMousePosition.posY !== mousePosition.posY)
        ) {
          mouseHasMoved = true
        }
        const LiveUserActivityRecordEvent: LiveUserActivityRecordEvent = {
          type: LIVE_USER_ACTIVITY_RECORD,
          id: generateId(),
          date: new Date(),
          url: window.location.href,
          injectionId,
          timeSpan: +liveRecordingInterval,
          platform,
          pointerActivityScore: recordMouse
            ? mouseHasMoved
              ? 1
              : 0
            : undefined,
          currentMediaTime,
          hasFocus: recordTabs ? document.hasFocus() : undefined,
          isPlaying
        }
        prevMousePosition = mousePosition
        await addEvent(LiveUserActivityRecordEvent)

        // const IsPlayingActivityRecord: IsPlayingActivityRecord = {
        //   type: "IS_PLAYING_ACTIVITY_RECORD",
        //   id: generateId(),
        //   date: new Date(),
        //   url: window.location.href,
        //   injectionId,
        //   timeSpan: liveRecordingInterval,
        //   platform,
        //   isPlaying,
        //   currentTime,
        // }
        // // prevIsPlaying = isPlaying
        // await addEvent(IsPlayingActivityRecord);
        // }
      }, +liveRecordingInterval)
    }
  }
}
export const updateLiveTracking = ({
  settings,
  activeViewType,
  platform,
  injectionId,
  addEvent,
  currentURL,
  onCurrentURLChange
}: LiveTrackerProps) => {
  let routine
  console.info("update live tracking", platform, activeViewType)
  if (trackers[platform] && trackers[platform][activeViewType]) {
    // functions return a setInterval() id
    routine = trackers[platform][activeViewType]({
      settings,
      injectionId,
      addEvent,
      platform,
      currentURL,
      onCurrentURLChange
    })
  } else {
    clearInterval(routine)
  }
  return updateLiveTracking
}
