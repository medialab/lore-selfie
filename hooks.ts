import { useMemo } from "react"

import { BROWSE_VIEW } from "~constants"
import type { Creator } from "~types/annotations"
import type {
  BrowseViewEvent,
  CaptureEventsList
} from "~types/captureEventsTypes"
import type { ChannelsMapItem, ContentsMapItem } from "~types/common"

interface structuredContents {
  channelsMap: Map<string, ChannelsMapItem>
  contentsMap: Map<string, ContentsMapItem>
  rowsCount: number
}
interface Creators {
  [key: string]: Creator
}
export const useBuildStructuredContentsList = (
  events: CaptureEventsList,
  creators: Creators
): structuredContents => {
  return useMemo(() => {
    const validEvents = events.filter(
      (event) =>
        event.type === BROWSE_VIEW &&
        event.url &&
        event.metadata.title &&
        ["live", "video", "short"].includes(event.viewType)
    )
    const contents = new Map()
    const channels = new Map()
    let index = 0
    let rCount = 0
    validEvents.forEach((event: BrowseViewEvent) => {
      let channel = event.metadata.channelName || event.metadata.channelId
      const channelSlug = `${event.metadata.channelId}-${event.platform}`
      const creator = Object.values(creators).find((c) =>
        c.channels.includes(channelSlug)
      )
      channel = creator ? creator.name : channel
      // console.log('creators', creators, channelSlug);
      if (!channels.has(channel)) {
        channels.set(channel, new Map())
        rCount++
      }
      const uniqueContents = channels.get(channel) // || new Map();
      if (!uniqueContents.has(event.url)) {
        index++
        rCount++
        uniqueContents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
        contents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
      }
      channels.set(channel, uniqueContents)
    })
    return {
      contentsMap: contents,
      channelsMap: channels,
      rowsCount: rCount
    }
  }, [events, creators])
}
