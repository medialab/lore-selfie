import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { EVENT_TYPES } from "~constants"
import { type CaptureEventsList } from "~types/captureEventsTypes"

const storage = new Storage({
  area: "local"
  // copiedKeyList: ["shield-modulation"],
})

const availableEventTypes = [...EVENT_TYPES] as const

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  interface MessageBodyType {
    types: (typeof availableEventTypes)[number]
    page: number
    reverseOrder: boolean
    itemsPerPage: number
  }
  const {
    types,
    page = 0,
    reverseOrder,
    itemsPerPage = 50
  }: MessageBodyType = req.body

  // console.log('received request', req.body);

  const activity: CaptureEventsList = await storage.get("lore-selfie-activity")
  if (!activity || !activity.length) {
    res.send({
      types,
      page,
      items: [],
      filteredCount: 0,
      totalCount: 0,
      pagesCount: 0
    })
  }

  const filteredActivity = (activity || []).filter((event) =>
    types.includes(event.type)
  )
  const ordered = reverseOrder
    ? (filteredActivity || []).reverse()
    : filteredActivity
  const numberOfPages =
    Math.floor((filteredActivity || []).length / itemsPerPage) + 1
  const actualPage = page < numberOfPages ? page : numberOfPages - 1
  const visibleItems = ordered.slice(
    actualPage * itemsPerPage,
    (actualPage + 1) * itemsPerPage
  )

  res.send({
    types,
    page: actualPage,
    items: visibleItems,
    filteredCount: filteredActivity.length,
    totalCount: (activity || []).length,
    pagesCount: numberOfPages
  })
}

export default handler
