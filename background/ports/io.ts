import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import {version, homepage} from '../../package.json';
import { ACTION_END, ACTION_PROGRESS, DEFAULT_ANNOTATIONS, DEFAULT_SETTINGS, DELETE_ALL_DATA, SERIALIZE_ALL_DATA } from "~constants";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

const checkTimeOfDaySpan = (date, [from, to]) => {
  const referenceDate = new Date(new Date(date).getTime())
  referenceDate.setHours(0);
  referenceDate.setMilliseconds(0);
  referenceDate.setMinutes(0);
  referenceDate.setSeconds(0);
  const fromDate = new Date(referenceDate.getTime());
  const [fromHours, fromMinutes] = from.split(':')
  const [toHours, toMinutes] = to.split(':')
  fromDate.setHours(+fromHours)
  fromDate.setMinutes(+fromMinutes)
  const toDate = new Date(referenceDate.getTime());
  toDate.setHours(+toHours);
  toDate.setMinutes(+toMinutes);
  return date > fromDate.getTime() && date < toDate.getTime();
}
const checkDaysOfWeek = (date, days = []) => {
  const dayOfWeek = new Date(date).getDay();
  return days.includes(dayOfWeek);
}

const applyExcludedTitlePatterns = (events: any[], inputPatterns: any[]) => {
  const patterns = inputPatterns.filter(p => p && p.trim().length);
  if (!patterns.length) {
    return events;
  }
  const droppedURLs = new Set();
  return events.filter((event) => {
    const {url, metadata = {}} = event;
    const {title} = metadata;
    let passes = true;
    if (title) {
      let patternIndex = 0;
      do {
        const pattern = patterns[patternIndex];
        const regexp = new RegExp(pattern, 'gi');
        const match = title.match(regexp);
        if (match !== null) {
          passes = false;
        }
        patternIndex++;
      } while (patternIndex < patterns.length && passes);
    }
    if (droppedURLs.has(url)) {
      return false;
    } else {
      return passes;
    }
  })
}

const applyChannelSettings = (events, channelsSettings) => {
  const transformedEvents = [];
  let anonIndex = 1;
  const anonMap = new Map();
  const hiddenInjections = new Set();
  const hiddenURLs = new Set();
  const anonURLs = new Set();
  let passing = true;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const outputEvent = { ...event };
    // changing view
    if (event.type === 'BROWSE_VIEW') {
      const channelId = event.metadata?.channelId;
      const { platform } = event;
      const id = `${channelId}-${platform}`;
      // matching channel settings = handle
      if (channelsSettings[id]) {
        // the view is now corresponding to a hidden channel
        if (channelsSettings[id].status === 'hidden') {
          // console.log('hide', channelId, event.url);
          passing = false;
          hiddenInjections.add(event.injectionId);
          hiddenURLs.add(event.url);
          // the view is a new channel which is visible
        } else {
          // the view was previously hidden : show
          if (hiddenInjections.has(event.injectionId)) {
            hiddenInjections.delete(event.injectionId);
          }
          passing = true;
        }
        if (channelsSettings[id].status === 'anon') {
          if (!anonURLs.has(event.url)) {
            anonURLs.add(event.url)
          }
          if (!anonMap.has(id)) {
            anonMap.set(id, {
              channelId: `anon-${anonIndex}`,
              channelName: `chaîne anonyme n°${anonIndex}`
            });
            anonIndex++;
          }
          outputEvent.metadata = {
            title: "Contenu anonymisé",
            channelId: anonMap.get(id).channelId,
            channelName: anonMap.get(id).channelName,
            description: 'contenu anonymisé',
            // "videoId"
            // "description"
            // "keywords"
            // "interactionCount"
            // "datePublished"
            // "uploadDate"
            // "genre"
            // "shortlinkUrl"
            // "videoimageSrc"
            // "channelName"
            // "channelId"
            // "ownerSubcount"
            // "channelImageSrc"
            // "duration"
            // "likesCount"
          }
          outputEvent.metadata.channelId = anonMap.get(id).channelId;
          outputEvent.metadata.channelName = anonMap.get(id).channelName;
        }
      } else {
        if (hiddenInjections.has(event.injectionId)) {
          hiddenInjections.delete(event.injectionId)
        }
        passing = true;
      }
      // element belongs to a currently hidden session or hidden url (handling possible bugs)
    } else if (hiddenInjections.has(event.injectionId) || hiddenURLs.has(event.url)) {
      passing = false;
    }
    if (anonURLs.has(event.url)) {
      outputEvent.url = "anonymised";
    }
    if (passing) {
      transformedEvents.push(outputEvent);
    }
  }
  // console.log('hiddenURLs', hiddenURLs);
  return transformedEvents;
}
const filterEvents = (events, payload) => {
  const {
    from: initialFrom,
    to: initialTo,
    timeSpan,
    timeOfDaySpan,
    daysOfWeek,
    platforms,
    channelsSettings,
    excludedTitlePatterns,
  } = payload;
  let from, to;
  if (!initialFrom && !initialTo && timeSpan) {
    from = new Date(timeSpan[0]).getTime();
    to = new Date(timeSpan[1]).getTime();
  } else if (!initialFrom && !initialTo && !timeSpan) {
    from = -Infinity;
    to = Infinity;
  } else {
    from = initialFrom;
    to = initialTo;
  }
  // const events = activity.filter(e => true);
  let filtered = events.filter((event) => {
    const date = new Date(event.date).getTime();

    const matchesTimespan = date > from && date < to;
    const matchesTimeOfDaySpan = timeOfDaySpan === undefined ? true : checkTimeOfDaySpan(date, timeOfDaySpan)
    const matchesDaysOfWeek = daysOfWeek === undefined ? true : checkDaysOfWeek(date, daysOfWeek)

    return matchesTimespan && matchesTimeOfDaySpan && matchesDaysOfWeek;
  });
  return filtered;
}

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload = {}, requestId } = req.body
  // console.log('req body', req.body);
  const activities = await storage.get('lore-selfie-activity') || [];

  const settings = await storage.get('lore-selfie-settings') || DEFAULT_SETTINGS;
  const annotations = await storage.get('lore-selfie-annotations') || DEFAULT_ANNOTATIONS;

  switch (actionType) {
    case SERIALIZE_ALL_DATA:
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        result: {
          status: 'success',
          data: JSON.stringify(({
            type: 'lore-selfie-record',
            title: 'My lore selfie record',
            date: new Date().toJSON(),
            pluginVersion: version,
            learnMoreURL: homepage,
            activities, 
            settings, 
            annotations
          }))
        }
      })
      break;
    case DELETE_ALL_DATA:
      await storage.clear();
      res.send({
        responseType: ACTION_END,
        requestId,
        actionType,
        payload,
        result: {
          status: 'success'
        }
      })
      break;
    default:
      break;

  }

}

export default handler