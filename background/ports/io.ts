import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import {version, homepage} from '../../package.json';
import { ACTION_END, ACTION_PROGRESS, DEFAULT_ANNOTATIONS, DEFAULT_SETTINGS, DELETE_ALL_DATA, SERIALIZE_ALL_DATA } from "~constants";
import type { CaptureEventsList } from "~types/captureEventsTypes";
import type { Settings } from "~types/settings";
import type { Annotations } from "~types/annotations";
import type { DataRecord } from "~types/io";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

interface BodyType {
  actionType: string,
  payload: any,
  requestId: string
}
const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload, requestId }: BodyType = req.body
  const activities = await storage.get('lore-selfie-activity') || [] as CaptureEventsList;
  const settings = await storage.get('lore-selfie-settings') || DEFAULT_SETTINGS as Settings;
  const annotations = await storage.get('lore-selfie-annotations') || DEFAULT_ANNOTATIONS as Annotations;

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
          } as DataRecord))
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