import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import {
  ACTION_END,
  GET_ANNOTATIONS,
  GET_ANNOTATIONS_COLLECTION,
  CREATE_ANNOTATION,
  UPDATE_ANNOTATION,
  DELETE_ANNOTATION,
  DEFAULT_ANNOTATIONS,
  UPDATE_ANNOTATION_COLLECTION,
  DELETE_ALL_DATA,
  SET_ANNOTATIONS,
} from "~constants";
import type { Annotations, Creator, Expression, Tag } from "~types/annotations";

const storage = new Storage({
  area: "local",
  // copiedKeyList: ["shield-modulation"],
})



interface MessagePayload {
  actionType: string,
  payload: object,
  requestId: string
}

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { actionType, payload, requestId }: MessagePayload = req.body
  // console.log('req body in annotations crud', req.body);
  const baseAnnotations: Annotations = await storage.get('lore-selfie-annotations');
  let annotations: Annotations = baseAnnotations || DEFAULT_ANNOTATIONS;
  interface AnnotationPayload {
    collection: string,
    id: string,
    value: any
  }
  const { collection, id, value } = payload as AnnotationPayload;
  let newCollection, newAnnotations;
  switch (actionType) {
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
    case GET_ANNOTATIONS:
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: annotations
        }
      })
      break;
    case SET_ANNOTATIONS:
      // @todo add proper schema validation
      await storage.set('lore-selfie-annotations', value);
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: value
        }
      })
      break;
    case GET_ANNOTATIONS_COLLECTION:
      const collectionToGet = payload as unknown;
      res.send({
        responseType: ACTION_END,
        actionType,
        payload,
        requestId,
        result: {
          status: 'success',
          data: annotations[collectionToGet as string]
        }
      })
      break;
    case UPDATE_ANNOTATION_COLLECTION:
      // console.log('payload', payload, ['data', 'id'].every(k => k in payload))
      if (['value', 'id'].every(k => k in payload)) {
        const newAnnotations = {
          ...annotations,
          [id]: value
        }
        await storage.set('lore-selfie-annotations', newAnnotations);
        res.send({
          responseType: ACTION_END,
          actionType,
          payload,
          requestId,
          result: {
            status: 'success',
            data: newAnnotations
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
    case CREATE_ANNOTATION:
    case UPDATE_ANNOTATION:
      if (['collection', 'id', 'value'].every(k => k in payload)) {
        newCollection = Object.entries(annotations[collection])
          .map(([thatId, val]) => {
            if (thatId === id) {
              return [thatId, value]
            }
            return [thatId, val]
          })
          .reduce((res, [id, val]) => ({ ...res, [id]: val }), {})
        newAnnotations = {
          ...annotations,
          [collection]: newCollection
        }
        await storage.set('lore-selfie-annotations', newAnnotations);
        res.send({
          responseType: ACTION_END,
          actionType,
          payload,
          requestId,
          result: {
            status: 'success',
            data: newAnnotations
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
    case DELETE_ANNOTATION:
      if (['collection', 'id'].every(k => payload[k])) {
        newCollection = Object.entries(annotations[collection])
          .filter(([thatId]) => thatId !== id)
          .reduce((res, [id, val]) => ({ ...res, [id]: val }), {});
        // clean annotations by removing dead links
        newAnnotations = Object.entries(annotations).map(([collectionId, collectionItems]) => {
          // if it is the delete item's collection, use as is
          if (collectionId === collection) {
            return [collectionId, newCollection];
          }
          return [
            collectionId,
            Object.entries(collectionItems)
              .map(([itemId, item]: [string, Tag|Expression|Creator]) => {
                if ((item as Creator).links && (item as Creator).links[collection]) {
                  return [itemId, {
                    ...item,
                    links: {
                      ...(item as Creator).links,
                      [collection]: (item as Creator).links[collection].filter(linkId => linkId !== id)
                    }
                  }]
                }
                return [itemId, item];
              })
              .reduce((res, [itemId, item]: [string, Tag|Expression|Creator]) => ({ ...res, [itemId]: item }), {})
          ]
        })
          .reduce((res, [collectionId, collectionItems]) => ({
            ...res,
            [collectionId]: collectionItems
          }), {})

        // newAnnotations = {
        //   ...annotations,
        //   [collection]: newCollection
        // }
        await storage.set('lore-selfie-annotations', newAnnotations);
        res.send({
          responseType: ACTION_END,
          actionType,
          payload,
          requestId,
          result: {
            status: 'success',
            data: newAnnotations
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