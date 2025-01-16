import { v4 as generateId } from "uuid"

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import {
  ACTION_END,
  ACTION_PROGRESS,
  APPEND_ACTIVITY_EVENTS,
  BROWSE_VIEW,
  DAY_IN_MS,
  DUPLICATE_DAY_DATA,
  GET_ACTIVITY_EVENTS,
  GET_BINNED_ACTIVITY_OUTLINE,
  GET_CHANNELS,
  GET_HABITS_DATA,
  LIVE_USER_ACTIVITY_RECORD,
  PLATFORMS,
  PREPEND_ACTIVITY_EVENTS,
  REPLACE_ACTIVITY_EVENTS
} from "~constants"
import { buildDateKey, getDateBin } from "~helpers"
import {
  type BrowseViewEvent,
  type CaptureEventsList,
  type GenericViewEventMetadata,
  type LiveUserActivityRecordEvent,
  type TwitchLiveMetadata,
  type YoutubeShortMetadata,
  type YoutubeVideoMetadata
} from "~types/captureEventsTypes"
import type {
  AvailableChannel,
  AvailableChannels,
  HabitsData,
  FilterEventsPayload
} from "~types/common"
import type { AllData } from "~types/io"

const storage = new Storage({
  area: "local"
  // copiedKeyList: ["shield-modulation"],
})

const checkTimeOfDaySpan = (
  date: number,
  [from, to]: [string, string]
): boolean => {
  const referenceDate = new Date(new Date(date).getTime())
  referenceDate.setHours(0)
  referenceDate.setMilliseconds(0)
  referenceDate.setMinutes(0)
  referenceDate.setSeconds(0)
  const fromDate = new Date(referenceDate.getTime())
  const [fromHours, fromMinutes] = from.split(":")
  const [toHours, toMinutes] = to.split(":")
  fromDate.setHours(+fromHours)
  fromDate.setMinutes(+fromMinutes)
  let toDate = new Date(referenceDate.getTime())
  toDate.setHours(+toHours)
  toDate.setMinutes(+toMinutes)
  // if to date is smaller than from date extend to next day
  if (+toHours < +fromHours) {
    toDate = new Date(toDate.getTime() + DAY_IN_MS)
  }
  return date > fromDate.getTime() && date < toDate.getTime()
}
const checkDaysOfWeek = (date: number, days: Array<number> = []): boolean => {
  const dayOfWeek = new Date(date).getDay()
  return days.includes(dayOfWeek)
}

const applyExcludedTitlePatterns = (
  events: Array<BrowseViewEvent>,
  inputPatterns: any[]
) => {
  const patterns = inputPatterns.filter((p) => p && p.trim().length)
  if (!patterns.length) {
    return events
  }
  const droppedURLs = new Set()
  return events.filter((event) => {
    const {
      url,
      metadata = { title: "" }
    }: {
      url: string
      metadata:
      | YoutubeVideoMetadata
      | YoutubeShortMetadata
      | TwitchLiveMetadata
      | GenericViewEventMetadata
    } = event
    const { title } = metadata
    let passes = true
    if (title) {
      let patternIndex = 0
      do {
        const pattern = patterns[patternIndex]
        const regexp = new RegExp(pattern, "gi")
        const match = title.match(regexp)
        if (match !== null) {
          passes = false
        }
        patternIndex++
      } while (patternIndex < patterns.length && passes)
    }
    if (droppedURLs.has(url)) {
      return false
    } else {
      return passes
    }
  })
}

const applyChannelSettings = (
  events: CaptureEventsList,
  channelsSettings: object
) => {
  const transformedEvents = []
  let anonIndex = 1
  let anonURLSIndex = 0
  const anonMap = new Map()
  const hiddenInjections = new Set()
  const hiddenURLs = new Set()
  const anonURLSMap = new Map()
  const anonURLs = new Set()
  let passing = true
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    let outputEvent = { ...event }
    // changing view
    if (event.type === "BROWSE_VIEW") {
      const channelId = (event as BrowseViewEvent).metadata?.channelId
      const { platform } = event
      const id = `${channelId}-${platform}`
      // matching channel settings = handle
      if (channelsSettings[id]) {
        // the view is now corresponding to a hidden channel
        if (channelsSettings[id].status === "hidden") {
          // console.log('hide', channelId, event.url);
          passing = false
          hiddenInjections.add(event.injectionId)
          hiddenURLs.add(event.url)
          // the view is a new channel which is visible
        } else {
          // the view was previously hidden : show
          if (hiddenInjections.has(event.injectionId)) {
            hiddenInjections.delete(event.injectionId)
          }
          passing = true
        }
        if (channelsSettings[id].status === "anon") {
          if (!anonURLs.has(event.url)) {
            anonURLs.add(event.url)
            anonURLSIndex++
            anonURLSMap.set(event.url, `anon-url-${anonURLSIndex}`)
          }
          if (!anonMap.has(id)) {
            anonMap.set(id, {
              channelId: `anon-${anonIndex}`,
              channelName: `chaîne anonyme n°${anonIndex}`
            })
            anonIndex++
          }
          outputEvent = outputEvent as BrowseViewEvent
          outputEvent.metadata = {
            ...event.metadata,
            title: "Contenu anonymisé",
            channelId: anonMap.get(id).channelId,
            channelName: anonMap.get(id).channelName,
            description: "contenu anonymisé"
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
          outputEvent.metadata.channelId = anonMap.get(id).channelId
          outputEvent.metadata.channelName = anonMap.get(id).channelName
        }
      } else {
        if (hiddenInjections.has(event.injectionId)) {
          hiddenInjections.delete(event.injectionId)
        }
        passing = true
      }
      // element belongs to a currently hidden session or hidden url (handling possible bugs)
    } else if (
      hiddenInjections.has(event.injectionId) ||
      hiddenURLs.has(event.url)
    ) {
      passing = false
    }
    if (anonURLs.has(event.url)) {
      // outputEvent.url = "anonymised";
      outputEvent.url = anonURLSMap.get(event.url)
    }
    if (passing) {
      transformedEvents.push(outputEvent)
    }
  }
  // console.log('hiddenURLs', hiddenURLs);
  return transformedEvents
}
// eslint-disable-next-line
const AvailablePlatforms = [...PLATFORMS] as const

interface MessagePayload {
  actionType: string
  payload: object
  requestId: string
}


const filterEvents = (
  events: CaptureEventsList,
  payload: FilterEventsPayload
): CaptureEventsList => {
  const {
    from: initialFrom,
    to: initialTo,
    timeSpan,
    timeOfDaySpan,
    daysOfWeek,
    platforms
    // channelsSettings,
    // excludedTitlePatterns
  } = payload
  let from, to
  if (!initialFrom && !initialTo && timeSpan) {
    from = new Date(timeSpan[0]).getTime()
    to = new Date(timeSpan[1]).getTime()
  } else if (!initialFrom && !initialTo && !timeSpan) {
    from = -Infinity
    to = Infinity
  } else {
    from = initialFrom
    to = initialTo
  }
  // console.log('filter events from %s to %s', from, to);
  // console.log('will apply filters to', events)
  // const events = activity.filter(e => true);
  const filtered = events.filter((event) => {
    const date = new Date(event.date).getTime()

    const matchesTimespan = date > from && date < to
    const matchesTimeOfDaySpan =
      timeOfDaySpan === undefined
        ? true
        : checkTimeOfDaySpan(date, timeOfDaySpan)
    const matchesDaysOfWeek =
      daysOfWeek === undefined ? true : checkDaysOfWeek(date, daysOfWeek)
    const matchesPlatforms =
      platforms === undefined
        ? true
        : platforms.includes(event.platform)
    // console.log('matches platforms', matchesPlatforms, event.platform)
    // if (tag === GET_CHANNELS) {
    //   console.log('test for event in filters', matchesTimespan && matchesTimeOfDaySpan && matchesDaysOfWeek && matchesPlatforms, {matchesTimespan, matchesTimeOfDaySpan, matchesDaysOfWeek, matchesPlatforms}, event, {timeOfDaySpan, date: new Date(event.date), from: new Date(from), to: new Date(to)})
    // }

    return (
      matchesTimespan &&
      matchesTimeOfDaySpan &&
      matchesDaysOfWeek &&
      matchesPlatforms
    )
  })
  return filtered
}

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload = {}, requestId }: MessagePayload = req.body
  // console.log('req body', req.body);
  const baseActivity: CaptureEventsList = await storage.get(
    "lore-selfie-activity"
  )
  const activity = baseActivity || []
  let filteredEvents: CaptureEventsList, units: any, loadedUnits: any
  switch (actionType) {
    case GET_CHANNELS:
      // console.debug('filter events in get channels', payload, filterEvents(activity, payload, GET_CHANNELS))
      filteredEvents = filterEvents(
        activity,
        payload as FilterEventsPayload
      ).filter((event) => {
        if (event.type === BROWSE_VIEW) {
          return event.metadata && event.metadata.channelId
        }
      })
      console.log('filtered events for get channels', filteredEvents, activity.length, payload);
      // eslint-disable-next-line
      const channelsList = new Map()
      filteredEvents.forEach((event: BrowseViewEvent) => {
        const { channelId, channelName } = event.metadata
        const { platform, url } = event
        const id = `${channelId}-${platform}`
        // console.log('channel', { channelId, channelName, id, platform })
        if (!channelsList.has(id)) {
          const newChannel: AvailableChannel = {
            id,
            channelId,
            channelName,
            platform,
            urls: new Set([url])
          }
          channelsList.set(id, newChannel)
        } else {
          const existing = channelsList.get(id)
          const newUrls = new Set(Array.from(existing.urls))
          newUrls.add(url)
          const updated = {
            ...existing,
            urls: newUrls
          }
          channelsList.set(id, updated)
        }
      })
      console.log('channels list map values', Array.from(channelsList.values()))
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: "success",
          data: Array.from(
            channelsList.values().map(
              (channel): AvailableChannel => ({
                ...channel,
                urlsCount: Array.from(channel.urls).length
              })
            )
          ) as AvailableChannels
        }
      })
      break

    case GET_ACTIVITY_EVENTS:
      filteredEvents = filterEvents(activity, payload as FilterEventsPayload)
      if (
        (payload as FilterEventsPayload).channelsSettings &&
        Object.keys((payload as FilterEventsPayload).channelsSettings).length
      ) {
        filteredEvents = applyChannelSettings(
          filteredEvents,
          (payload as FilterEventsPayload).channelsSettings
        )
      }
      if ((payload as FilterEventsPayload).excludedTitlePatterns?.length) {
        filteredEvents = applyExcludedTitlePatterns(
          filteredEvents as Array<BrowseViewEvent>,
          (payload as FilterEventsPayload).excludedTitlePatterns
        )
      }

      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: "success",
          data: filteredEvents
        }
      })
      break

      interface GetBinnedActivityPayload extends FilterEventsPayload {
        bin: number
      }
    case GET_BINNED_ACTIVITY_OUTLINE:
      // eslint-disable-next-line
      const {
        bin = DAY_IN_MS, // 'day',
        ...settings
      } = payload as GetBinnedActivityPayload
      filteredEvents = filterEvents(activity, settings as FilterEventsPayload)
      units = filteredEvents.reduce((cur, event) => {
        const time = new Date(event.date).getTime()
        const key = time - (time % bin)
        if (cur && !cur.has(key)) {
          cur.set(key, [event])
        } else if (cur && cur.has(key)) {
          cur.set(key, [...cur.get(key), event])
        }
        return cur
      }, new Map<number, CaptureEventsList>()) as Map<number, CaptureEventsList>
      loadedUnits = []
      for (const [dateTime, events] of (
        units as Map<number, CaptureEventsList>
      ).entries()) {
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
          status: "success",
          data: loadedUnits
        }
      })
      break
    case GET_HABITS_DATA:
      // eslint-disable-next-line
      const {
        bin: binsDuration, // 'day',
        ...otherSettings
      } = payload as GetBinnedActivityPayload

      // eslint-disable-next-line
      const bins = []
      for (let h = 0; h < 24 * 3600 * 1000; h += binsDuration) {
        bins.push({
          start: h,
          end: h + binsDuration,
          label: `${h / 3600000}h-${(h + binsDuration) / 3600000}h`
        })
      }

      // eslint-disable-next-line
      const initOutput: HabitsData = [0, 1, 2, 3, 4, 5, 6].reduce(
        (res1, dayId) => ({
          ...res1,
          [dayId]: bins.reduce((res2, bin) => {
            const {
              start
              // end
            } = bin
            return {
              ...res2,
              [start]: {
                count: 0,
                duration: 0,
                channels: {},
                breakdown: {
                  ...PLATFORMS.reduce((res3, platformId) => {
                    return {
                      ...res3,
                      [platformId]: {
                        count: 0,
                        duration: 0
                      }
                    }
                  }, {})
                }
              }
            }
          }, {})
        }),
        {}
      )

      filteredEvents = filterEvents(activity, otherSettings)

      // eslint-disable-next-line
      const urlToChannelSlug = new Map();
      // eslint-disable-next-line
      const output: HabitsData = filteredEvents.reduce((tempOutput, event) => {
        const date = new Date(event.date)
        const day = date.getDay()
        const { platform, type, url } = event
        const thatBin = getDateBin(date, binsDuration)
        tempOutput[day][thatBin].count += 1
        tempOutput[day][thatBin].breakdown[platform].count += 1
        if (type === LIVE_USER_ACTIVITY_RECORD) {

          if (
            platform === 'twitch' || (event as LiveUserActivityRecordEvent).isPlaying
          ) {
            const thatSpan = event.timeSpan;
            tempOutput[day][thatBin].count += 1;
            tempOutput[day][thatBin].duration += thatSpan;

            tempOutput[day][thatBin].breakdown[platform].count += 1;
            tempOutput[day][thatBin].breakdown[platform].duration += thatSpan;
            const channelSlug = urlToChannelSlug.get(url);
            // console.log('test', channelSlug, tempOutput[day][thatBin].channels, tempOutput[day][thatBin].channels[channelSlug])
            if (channelSlug && tempOutput[day][thatBin].channels[channelSlug]) {
              // console.log('obj', tempOutput[day][thatBin].channels[channelSlug])
              tempOutput[day][thatBin].channels[channelSlug].count += 1;
              tempOutput[day][thatBin].channels[channelSlug].duration += thatSpan;
              // video was browsed before bin start
            } else if (channelSlug && !tempOutput[day][thatBin].channels[channelSlug]) {
              tempOutput[day][thatBin].channels[channelSlug] = {
                channel: channelSlug,
                platform,
                duration: thatSpan,
                count: 1
              }

            } else {
              console.warn('did not count event for url:', event.url)
            }
          }
        } else if (type === BROWSE_VIEW) {
          const channel = event.metadata.channelName || event.metadata.channelId
          if (channel) {
            const channelSlug = `${channel} (${event.platform})`;
            if (!tempOutput[day][thatBin].channels[channelSlug]) {
              tempOutput[day][thatBin].channels[channelSlug] = {
                channel,
                platform,
                duration: 0,
                count: 0
              }

            }
            if (!urlToChannelSlug.has(url)) {
              urlToChannelSlug.set(url, channelSlug)
            }
          }
        }
        return tempOutput;
      }, initOutput);

      

      // units = filteredEvents.reduce((cur, event) => {
      //   const time = new Date(event.date).getTime();
      //   const key = time - time % binsDuration;
      //   if (cur && !cur.has(key)) {
      //     cur.set(key, [event]);
      //   } else if (cur && cur.has(key)) {
      //     cur.set(key, [...cur.get(key), event])
      //   }
      //   return cur;
      // }, new Map());
      // loadedUnits = []
      // for ([dateTime, events] of units.entries()) {
      //   loadedUnits.push({
      //     date: dateTime,
      //     eventsCount: events.length
      //   })
      // }

      res.send({
        responseType: ACTION_END,
        requestId,
        actionType,
        payload,
        result: {
          status: "success",
          data: output
        }
      })
      break
    case REPLACE_ACTIVITY_EVENTS:
      interface ReplaceActivityPayload extends MessagePayload {
        data: AllData
      }
      if ((payload as ReplaceActivityPayload).data) {
        await storage.set(
          "lore-selfie-activity",
          (payload as ReplaceActivityPayload).data
        )
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "success"
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "error",
            reason: "no data"
          }
        })
      }
      break
    case PREPEND_ACTIVITY_EVENTS:
      if ((payload as ReplaceActivityPayload).data) {
        await storage.set("lore-selfie-activity", [
          ...(payload as ReplaceActivityPayload).data.activities,
          ...activity
        ])
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "success"
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "error",
            reason: "no data"
          }
        })
      }
      break
    case APPEND_ACTIVITY_EVENTS:
      if ((payload as ReplaceActivityPayload).data) {
        await storage.set("lore-selfie-activity", [
          ...(payload as ReplaceActivityPayload).data.activities,
          ...activity
        ])
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "success"
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          actionType,
          payload,
          result: {
            status: "error",
            reason: "no data"
          }
        })
      }
      break
    // case SERIALIZE_ALL_DATA:
    //   res.send({
    //     responseType: ACTION_END,
    //     actionType,
    //     payload,
    //     result: {
    //       status: 'success',
    //       data: JSON.stringify(activity)
    //     }
    //   })
    //   break;
    // case DELETE_ALL_DATA:
    //   await storage.clear();
    //   res.send({
    //     responseType: ACTION_END,
    //     requestId,
    //     actionType,
    //     payload,
    //     result: {
    //       status: 'success'
    //     }
    //   })
    //   break;
    case DUPLICATE_DAY_DATA:
      interface DuplicateDayDataPayload {
        daySlug: string
        numberOfDays: number
      }
      if (
        (payload as DuplicateDayDataPayload).daySlug &&
        (payload as DuplicateDayDataPayload).numberOfDays
      ) {
        const dayEvents = activity.filter((event) => {
          const daySlug = buildDateKey(event.date)
          return daySlug === daySlug
        })
        const injectionIds = Array.from(
          new Set(dayEvents.map((e) => e.injectionId))
        )
        let newEvents = [...dayEvents]
        for (
          let i = 1;
          i < (payload as DuplicateDayDataPayload).numberOfDays;
          i++
        ) {
          res.send({
            responseType: ACTION_PROGRESS,
            requestId,
            actionType,
            payload,
            current: i,
            total: (payload as DuplicateDayDataPayload).numberOfDays
          })
          const injectionIdMap = new Map()
          injectionIds.forEach((id) => {
            injectionIdMap.set(id, generateId())
          })
          const DAY_IN_MS = 3600 * 24 * 1000
          const thatDayEvents = dayEvents.map((event) => {
            return {
              ...event,
              date: new Date(new Date(event.date).getTime() - DAY_IN_MS * i),
              injectionId: injectionIdMap.get(event.injectionId),
              id: generateId()
            }
          })
          newEvents = [...thatDayEvents, ...newEvents]
        }
        await storage.set("lore-selfie-activity", newEvents)
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "success"
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: "error",
            reason: "malformed payload"
          }
        })
      }
      break
    default:
      break
  }
}

export default handler
