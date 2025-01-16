import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { homepage, version } from "~/package.json"
import {
  ACTION_END,
  // ACTION_PROGRESS,
  DEFAULT_ANNOTATIONS,
  DEFAULT_SETTINGS,
  DELETE_ALL_DATA,
  SERIALIZE_ALL_DATA
} from "~constants"
import type { Annotations } from "~types/annotations"
import type { CaptureEventsList } from "~types/captureEventsTypes"
import type { DataRecord } from "~types/io"
import type { Settings } from "~types/settings"

const storage = new Storage({
  area: "local"
  // copiedKeyList: ["shield-modulation"],
})

interface BodyType {
  actionType: string
  payload: any
  requestId: string
}
const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload, requestId }: BodyType = req.body
  const activity =
    (await storage.get("lore-selfie-activity")) || ([] as CaptureEventsList)
  const settings =
    (await storage.get("lore-selfie-settings")) ||
    (DEFAULT_SETTINGS as Settings)
  const annotations =
    (await storage.get("lore-selfie-annotations")) ||
    (DEFAULT_ANNOTATIONS as Annotations)

  switch (actionType) {
    case SERIALIZE_ALL_DATA:
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        result: {
          status: "success",
          data: JSON.stringify({
            type: "lore-selfie-record",
            title: "My lore selfie record",
            date: new Date().toJSON(),
            pluginVersion: version,
            learnMoreURL: homepage,
            activities: activity,
            settings,
            annotations
          } as DataRecord)
        }
      })
      break
    case DELETE_ALL_DATA:
      await storage.clear()
      res.send({
        responseType: ACTION_END,
        requestId,
        actionType,
        payload,
        result: {
          status: "success"
        }
      })
      break
    default:
      break
  }
}

export default handler
