import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { v4 as generateId } from 'uuid';
import {version, homepage} from '../../package.json';
import { ACTION_END, ACTION_PROGRESS, DEFAULT_ANNOTATIONS, DEFAULT_SETTINGS, DELETE_ALL_DATA, SERIALIZE_ALL_DATA } from "~constants";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})

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