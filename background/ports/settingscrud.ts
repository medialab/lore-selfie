import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import { type captureEventsList } from "~types/captureEventsTypes"
import { ACTION_END, ACTION_PROGRESS, APPEND_ACTIVITY_EVENTS, DEFAULT_SETTINGS, DELETE_ALL_DATA, DUPLICATE_DAY_DATA, GET_ACTIVITY_EVENTS, GET_BINNED_ACTIVITY_OUTLINE, GET_CHANNELS, GET_SETTINGS, PREPEND_ACTIVITY_EVENTS, REPLACE_ACTIVITY_EVENTS, SERIALIZE_ALL_DATA, SET_SETTING, SET_SETTINGS } from "~constants";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload = {}, requestId } = req.body
  // console.log('req body in settingscrud', req.body);
  const baseSettings : Object = await storage.get('lore-selfie-settings');
  let settings = baseSettings || DEFAULT_SETTINGS;
  switch (actionType) {
    case GET_SETTINGS:
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: settings
        }
      })
      break;
    case SET_SETTINGS:
      // @todo validate with proper schema to avoid bugs
      if (typeof payload.data === 'object') {
        await storage.set('lore-selfie-settings', payload.data);
      }
    case SET_SETTING:
      if (payload.key !== undefined && payload.value !== undefined) {
        const {key, value} = payload;
        const newSettings = {
          ...settings,
          [key]: value
        };
        
        await storage.set('lore-selfie-settings', newSettings);
        settings = await storage.get('lore-selfie-settings');
        res.send({
          responseType: ACTION_END,
          requestId,
          actionType,
          payload,
          result: {
            status: 'success',
            data: settings
          }
        })
      } else {
        res.send({
          responseType: ACTION_END,
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