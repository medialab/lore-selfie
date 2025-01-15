import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import { type CaptureEventsList } from "~types/captureEventsTypes"
import { ACTION_END, ACTION_PROGRESS, APPEND_ACTIVITY_EVENTS, DEFAULT_SETTINGS, DELETE_ALL_DATA, DUPLICATE_DAY_DATA, GET_ACTIVITY_EVENTS, GET_BINNED_ACTIVITY_OUTLINE, GET_CHANNELS, GET_SETTINGS, PREPEND_ACTIVITY_EVENTS, REPLACE_ACTIVITY_EVENTS, SERIALIZE_ALL_DATA, SET_SETTING, SET_SETTINGS } from "~constants";
import type { Settings } from "~types/settings";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload = {}, requestId } = req.body
  // console.log('req body in settingscrud', req.body);
  const baseSettings : Settings = await storage.get('lore-selfie-settings');
  let settings = baseSettings || DEFAULT_SETTINGS as Settings;
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
      interface SetSettingsPayload {
        data: Settings
      }
      // @todo validate with proper schema to avoid bugs
      if (typeof (payload as SetSettingsPayload).data === 'object') {
        await storage.set('lore-selfie-settings', (payload as SetSettingsPayload).data);
      }
    case SET_SETTING:
      interface SetSettingPayload {
        key: string,
        value: any
      }
      if ((payload as SetSettingPayload).key !== undefined && (payload as SetSettingPayload).value !== undefined) {
        const {key, value} = (payload as SetSettingPayload);
        const newSettings = {
          ...settings,
          [key]: value
        };
        
        await storage.set('lore-selfie-settings', newSettings);
        settings = await storage.get('lore-selfie-settings') as Settings;
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