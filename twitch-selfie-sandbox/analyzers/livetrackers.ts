import {v4 as generateId} from 'uuid';
import type { BlurOnReactionInputEvent, ChatActivityRecordEvent, FocusOnReactionInputEvent } from "~types/captureEventsTypes";

const trackers = {
  twitch: {
    live: async ({
      injectionId,
      addEvent,
      liveTrackTimespan,
      platform
    }) => {
      const chatInput = document.querySelector('.chat-input__textarea textarea');
      console.log('chat input', chatInput);
      if (chatInput) {
        const onFocus = async () => {
          const focusOnReactionInputEvent: FocusOnReactionInputEvent = {
            type: "FOCUS_ON_REACTION_INPUT",
            id: generateId(),
            date: new Date(),
            url: window.location.href,
            injectionId,
            platform,
          }
          await addEvent(focusOnReactionInputEvent);
        }
        const onBlur = async () => {
          const blurOnReactionInputEvent: BlurOnReactionInputEvent = {
            type: "BLUR_ON_REACTION_INPUT",
            id: generateId(),
            date: new Date(),
            url: window.location.href,
            injectionId,
            platform,
          }
          await addEvent(blurOnReactionInputEvent);
        }
        chatInput.addEventListener('focus', onFocus)
        chatInput.addEventListener('blur', onBlur)
      }

      return setInterval(async () => {
        console.debug('track live data', new Date().toLocaleTimeString());
        const messages = Array.from(document.querySelectorAll('.chat-line__message:not([data-lore-selfie-parsed])'))
        .map(el => {
          el.setAttribute('data-lore-selfie-parsed', '1');
          return {
            message: el.querySelector('[data-a-target="chat-line-message-body"]')?.textContent,
            author: el.querySelector('.chat-author__display-name')?.textContent,
            emote: el.querySelector('.chat-image__container') && {
              alt: el.querySelector('.chat-image__container img')?.getAttribute('alt'),
              src: el.querySelector('.chat-image__container img')?.getAttribute('src'),
            }
          }
        });
        const viewersCount = document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div')?.textContent?.replace(' ', '');
        const chatActivityRecordEvent: ChatActivityRecordEvent = {
          type: "CHAT_ACTIVITY_RECORD",
          id: generateId(),
          date: new Date(),
          url: window.location.href,
          injectionId,
          timeSpan: liveTrackTimespan,
          platform,
          messages,
          messagesCount: messages.length,
          viewersCount: +(viewersCount || 0),
          messagesAverageCharLength: messages.reduce((sum, m) => sum + (m.message ? m.message.length : 0), 0) / messages.length
        }
        // console.debug('new messages', messages);
        await addEvent(chatActivityRecordEvent);
      }, liveTrackTimespan)
    }
  }
}
export const updateLiveTracking = ({
  activeViewType,
  platform,
  injectionId,
  addEvent,
  liveTrackTimespan
}) => {
  let routine;
  console.info('update live tracking', platform, activeViewType);
  if (trackers[platform] && trackers[platform][activeViewType]) {
    // routine = setInterval(() => {
    //   console.info('track live data');
      
    // }, liveTrackTimespan)
    routine = trackers[platform][activeViewType]({
      injectionId,
      addEvent,
      liveTrackTimespan,
      platform,
    })
  } else {
    clearInterval(routine);
  }
}