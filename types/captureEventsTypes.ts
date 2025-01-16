import { Uuid } from "@uuid-ts/uuid"

export interface Browser {
  name: string
  type: string
  version: string
}

export type GenericEvent = {
  id: Uuid
  date: Date
  tabId?: string
  injectionId: string
  platform: string
  url: string
}

export interface OpenPlatformInTabEvent extends GenericEvent {
  type: "OPEN_PLATFORM_IN_TAB"
  browser: Browser
}
export interface ClosePlatformInTabEvent extends GenericEvent {
  type: "CLOSE_PLATFORM_IN_TAB"
}
export interface BlurTabEvent extends GenericEvent {
  type: "BLUR_TAB"
}
export interface FocusTabEvent extends GenericEvent {
  type: "FOCUS_TAB"
}

export interface RecommendedContent {
  title: string
  channelName: string
  url: string
  thumbnailImageSrc: string
  type: string
}

export interface GenericViewEventMetadata {
  title: string
}
export interface YoutubeVideoMetadata extends GenericViewEventMetadata {
  description: string
  shortlinkUrl: string
  videoimageSrc: string
  channelName: string
  channelId: string
  ownerSubcount: string
  channelImageSrc: string
  duration: string
  recommendedContents: Array<RecommendedContent>
  likesCount: string
}

export interface YoutubeShortMetadata extends GenericViewEventMetadata {
  channelName: string
  channelId: string
  channelImageSrc: string
  commentsCount: string
  likesCount: string
}

export interface TwitchLiveMetadata extends GenericViewEventMetadata {
  // @todo channel should be deprecated
  channel?: string
  channelId: string
  channelName?: string
  channelImageAvatarSrc: string
  viewersCount: string
  liveTimeElapsed: string
  tags: string
  category: string
  categoryHref: string
}

export interface BrowseViewEvent extends GenericEvent {
  type: "BROWSE_VIEW"
  viewType: string
  metadata: YoutubeVideoMetadata | YoutubeShortMetadata | TwitchLiveMetadata
}

export interface FocusOnReactionInputEvent extends GenericEvent {
  type: "FOCUS_ON_REACTION_INPUT"
}
export interface BlurOnReactionInputEvent extends GenericEvent {
  type: "BLUR_ON_REACTION_INPUT"
}

interface EmoteFromChat {
  alt: string
  src: string
}
export interface TwitchMessageRecord {
  message?: string
  author: string
  emote: EmoteFromChat
}
export interface ChatActivityRecordEvent extends GenericEvent {
  type: "CHAT_ACTIVITY_RECORD"
  messages?: Array<TwitchMessageRecord>
  messagesCount: number
  messagesAverageCharLength: number
  viewersCount?: number
  timeSpan: number // timespan of measure provided, in ms
}

// export interface PointerActivityRecordEvent extends GenericEvent {
//   type: "POINTER_ACTIVITY_RECORD",
//   timeSpan: number, // timespan of measure provided, in ms
//   activityScore: number // number between 0 and 1
// }
// export interface IsPlayingActivityRecord extends GenericEvent {
//   type: "IS_PLAYING_ACTIVITY_RECORD"
//   isPlaying: boolean
//   timeSpan: number, // timespan of measure provided, in ms
//   currentTime?: string,
//   duration?: string
// }

export interface LiveUserActivityRecordEvent extends GenericEvent {
  type: "LIVE_USER_ACTIVITY_RECORD"
  timeSpan: number // timespan of measure provided, in ms
  currentMediaTime?: string
  pointerActivityScore: number
  hasFocus: boolean
  isPlaying: boolean
}

export type CaptureEvent =
  | OpenPlatformInTabEvent
  | ClosePlatformInTabEvent
  | BlurTabEvent
  | FocusTabEvent
  | BrowseViewEvent
  | FocusOnReactionInputEvent
  | BlurOnReactionInputEvent
  | ChatActivityRecordEvent
  | LiveUserActivityRecordEvent

export type CaptureEventsList = Array<CaptureEvent>
