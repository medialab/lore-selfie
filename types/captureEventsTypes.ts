import { Uuid } from '@uuid-ts/uuid';

export interface Browser {
  name: String,
  type: String,
  version: String
}

export type GenericEvent = {
  id: Uuid,
  date: Date,
  tabId?: String,
  injectionId: String,
  platform: String,
  url: String
}

export interface OpenPlatformInTabEvent extends GenericEvent {
  type: "OPEN_PLATFORM_IN_TAB",
  browser: Browser,
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
  title: String,
  channelName: string,
  url: String,
  thumbnailImageSrc: String,
  type: String
}

export interface GenericViewEventMetadata {
  title: String,
}
export interface YoutubeVideoMetadata extends GenericViewEventMetadata {
  description: String,
  shortlinkUrl: String,
  videoimageSrc: String,
  channelName: String,
  channelId: String,
  ownerSubcount: String,
  channelImageSrc: String,
  duration: String,
  recommendedContents: Array<RecommendedContent>,
  likesCount: String
}

export interface YoutubeShortMetadata extends GenericViewEventMetadata {
  channelName: String,
  channelId: String,
  channelImageSrc: String,
  commentsCount: String,
  likesCount: String,
}

export interface TwitchLiveMetadata extends GenericViewEventMetadata {
  channel: String,
  channelImageAvatarSrc: String,
  viewersCount: String,
  liveTimeElapsed: String,
  tags: String,
  category: String,
  categoryHref: String
}

export interface BrowseViewEvent extends GenericEvent {
  type: "BROWSE_VIEW",
  viewType: String,
  metadata: YoutubeVideoMetadata|YoutubeShortMetadata|TwitchLiveMetadata|GenericViewEventMetadata,
}

export interface FocusOnReactionInputEvent extends GenericEvent {
  type: "FOCUS_ON_REACTION_INPUT"
}
export interface BlurOnReactionInputEvent extends GenericEvent {
  type: "BLUR_ON_REACTION_INPUT"
}


interface EmoteFromChat {
  alt: String,
  src: String
}
export interface TwitchMessageRecord {
  message?: String,
  author: String,
  emote: EmoteFromChat
}
export interface ChatActivityRecordEvent extends GenericEvent {
  type: "CHAT_ACTIVITY_RECORD",
  messages?: Array<TwitchMessageRecord>,
  messagesCount: number,
  messagesAverageCharLength: number,
  viewersCount?: number,
  timeSpan: Number, // timespan of measure provided, in ms
}

// export interface PointerActivityRecordEvent extends GenericEvent {
//   type: "POINTER_ACTIVITY_RECORD",
//   timeSpan: Number, // timespan of measure provided, in ms
//   activityScore: Number // number between 0 and 1
// }
// export interface IsPlayingActivityRecord extends GenericEvent {
//   type: "IS_PLAYING_ACTIVITY_RECORD"
//   isPlaying: Boolean
//   timeSpan: Number, // timespan of measure provided, in ms
//   currentTime?: string,
//   duration?: string
// }



export interface LiveUserActivityRecord extends GenericEvent {
  type: "LIVE_USER_ACTIVITY_RECORD"
  timeSpan: Number, // timespan of measure provided, in ms
  currentMediaTime?: string,
  pointerActivityScore: Number,
  hasFocus: Boolean,
  isPlaying: Boolean,
}

export type captureEventsList = Array<GenericEvent>