import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import {v4 as generateId} from 'uuid';
import { type captureEventsList } from "~types/captureEventsTypes"

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload = {} } = req.body
  const baseActivity = await storage.get('lore-selfie-activity');
  const activity = baseActivity || [];
  switch (actionType) {
    case 'GET_ACTIVITY_EVENTS':
      const {
        from,
        to,
      } = payload;
      // const events = activity.filter(e => true);
      const matches = activity.filter((event) => {
        const date = new Date(event.date).getTime()
        return date > from && date < to;
      });
      res.send({
        responseType: 'ACTION_END',
        actionType,
        payload,
        result: {
          status: 'success',
          data: matches
        }
      })
      break;

    case 'GET_BINNED_ACTIVITY_OUTLINE':
      const DAY = 24 * 3600 * 1000;
      const {
        bin = DAY // 'day'
      } = payload;
      const units = activity.reduce((cur, event) => {
        const time =  new Date(event.date).getTime();
        const key = time - time%bin;
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
        responseType: 'ACTION_END',
        actionType,
        payload,
        result: {
          status: 'success',
          data: loadedUnits
        }
      })
      break;
    case 'REPLACE_ACTIVITY_EVENTS':
      if (payload.data) {
        await storage.set('lore-selfie-activity', payload.data);
        res.send({
          responseType: 'ACTION_END',
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: 'ACTION_END',

          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case 'PREPEND_ACTIVITY_EVENTS':
      if (payload.data) {
        await storage.set('lore-selfie-activity', [...payload.data, ...activity]);
        res.send({
          responseType: 'ACTION_END',

          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: 'ACTION_END',

          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case 'APPEND_ACTIVITY_EVENTS':
      if (payload.data) {
        await storage.set('lore-selfie-activity', [...payload.data, ...activity]);
        res.send({
          responseType: 'ACTION_END',

          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: 'ACTION_END',
          actionType,
          payload,
          result: {
            status: 'error',
            reason: 'no data'
          }
        })
      }
      break;
    case 'SERIALIZE_ALL_DATA':
      res.send({
        responseType: 'ACTION_END',
        actionType,
        payload,
        result: {
          status: 'success',
          data: JSON.stringify(activity)
        }
      })
      break;
    case 'DELETE_ALL_DATA':
      await storage.clear();
      res.send({
        responseType: 'ACTION_END',

        actionType,
        payload,
        result: {
          status: 'success'
        }
      })
      break;
    case 'DUPLICATE_DAY_DATA':
      if (payload.daySlug && payload.numberOfDays) {
        const dayEvents = activity.filter(event => {
          const daySlug = new Date(event.date).toJSON().split('T')[0];
          return daySlug === daySlug;
        });
        const injectionIds = Array.from(new Set(dayEvents.map(e => e.injectionId)));
        let newEvents = [...dayEvents];
        for (let i = 1; i < payload.numberOfDays; i++) {
          res.send({
            responseType: 'ACTION_PROGRESS',
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
          responseType: 'ACTION_END',
          actionType,
          payload,
          result: {
            status: 'success'
          }
        })
      } else {
        res.send({
          responseType: 'ACTION_END',
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