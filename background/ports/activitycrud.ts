import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import { type captureEventsList } from "~types/captureEventsTypes"
import { ACTION_END, ACTION_PROGRESS, APPEND_ACTIVITY_EVENTS, BROWSE_VIEW, DELETE_ALL_DATA, DUPLICATE_DAY_DATA, GET_ACTIVITY_EVENTS, GET_BINNED_ACTIVITY_OUTLINE, GET_CHANNELS, PREPEND_ACTIVITY_EVENTS, REPLACE_ACTIVITY_EVENTS, SERIALIZE_ALL_DATA } from "~constants";

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
  const baseActivity = await storage.get('lore-selfie-activity');
  const activity = baseActivity || [];
  let filteredEvents;
  switch (actionType) {
    case GET_CHANNELS:
      filteredEvents = filterEvents(activity, payload)
        .filter(event => {
          if (event.type === BROWSE_VIEW) {
            return event.metadata && event.metadata.channelId
          }
        });
      // console.log('filtered events for get channels', filteredEvents, filterEvents(activity, payload));
      const channelsList = new Map();
      filteredEvents.forEach(event => {
        const { channelId, channelName } = event.metadata;
        const { platform, url } = event;
        const id = `${channelId}-${platform}`
        // console.log('channel', { channelId, channelName, id, platform })
        if (!channelsList.has(id)) {
          channelsList.set(id, { id, channelId, channelName, platform, urls: new Set([url]) });
        } else {
          const existing = channelsList.get(id);
          const newUrls = new Set(Array.from(existing.urls));
          newUrls.add(url);
          const updated = {
            ...existing,
            urls: newUrls
          }
          channelsList.set(id, updated)
        }
      })
      // console.log('channels list map values', Array.from(channelsList.values()))
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: Array.from(channelsList.values().map(channel => ({
            ...channel,
            urlsCount: Array.from(channel.urls).length
          })))
        }
      })
      break;

    case GET_ACTIVITY_EVENTS:
      filteredEvents = filterEvents(activity, payload);

      if (payload.channelsSettings && Object.keys(payload.channelsSettings).length) {
        filteredEvents = applyChannelSettings(filteredEvents, payload.channelsSettings)
      }
      if (payload.excludedTitlePatterns?.length) {
        filteredEvents = applyExcludedTitlePatterns(filteredEvents, payload.excludedTitlePatterns)
      }

      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: filteredEvents
        }
      })
      break;

    case GET_BINNED_ACTIVITY_OUTLINE:
      const DAY = 24 * 3600 * 1000;
      const {
        bin = DAY // 'day'
      } = payload;
      const units = activity.reduce((cur, event) => {
        const time = new Date(event.date).getTime();
        const key = time - time % bin;
        if (cur && !cur.has(key)) {
          cur.set(key, [event]);
        } else if (cur && cur.has(key)) {
          cur.set(key, [...cur.get(key), event])
        }
        return cur;
      }, new Map());
      const loadedUnits = []
      for ([dateTime, events] of units.entries()) {
        loadedUnits.push({
          date: dateTime,
          eventsCount: events.length
        })
      }
      res.send({
        responseType: ACTION_END,
        requestId,
        actionType,
        payload,
        result: {
          status: 'success',
          data: loadedUnits
        }
      })
      break;
    case REPLACE_ACTIVITY_EVENTS:
      if (payload.data) {
        await storage.set('lore-selfie-activity', payload.data);
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case PREPEND_ACTIVITY_EVENTS:
      if (payload.data) {
        await storage.set('lore-selfie-activity', [...payload.data, ...activity]);
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case APPEND_ACTIVITY_EVENTS:
      if (payload.data) {
        await storage.set('lore-selfie-activity', [...payload.data, ...activity]);
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case SERIALIZE_ALL_DATA:
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        result: {
          status: 'success',
          data: JSON.stringify(activity)
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
    case DUPLICATE_DAY_DATA:
      if (payload.daySlug && payload.numberOfDays) {
        const dayEvents = activity.filter(event => {
          const daySlug = new Date(event.date).toJSON().split('T')[0];
          return daySlug === daySlug;
        });
        const injectionIds = Array.from(new Set(dayEvents.map(e => e.injectionId)));
        let newEvents = [...dayEvents];
        for (let i = 1; i < payload.numberOfDays; i++) {
          res.send({
            responseType: ACTION_PROGRESS,
            requestId,
            actionType,
            payload,
            current: i,
            total: payload.numberOfDays
          });
          const injectionIdMap = new Map();
          injectionIds.forEach(id => {
            injectionIdMap.set(id, generateId());
          })
          const DAY = 3600 * 24 * 1000;
          const thatDayEvents = dayEvents.map(event => {
            return {
              ...event,
              date: new Date(new Date(event.date).getTime() - DAY * i),
              injectionId: injectionIdMap.get(event.injectionId),
              id: generateId()
            }
          });
          newEvents = [...thatDayEvents, ...newEvents];
        }
        await storage.set('lore-selfie-activity', newEvents);
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'malformed payload'
          }
        })
      }
      break;
    default:
      break;

  }

}

export default handler