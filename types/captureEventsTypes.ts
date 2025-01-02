
export interface Browser {
  name: String,
  type: String,
  version: String
}

export type GenericEvent = {
  id: String,
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

export interface BrowseViewEvent extends GenericEvent {
  type: "BROWSE_VIEW",
  viewType: String,
  metadata: Object,
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
interface ChatMessage {
  author: String,
  message?: String,
  emote?: EmoteFromChat
}

export interface ChatActivityRecordEvent extends GenericEvent {
  type: "CHAT_ACTIVITY_RECORD",
  messages?: Array<ChatMessage>,
  messagesCount: number,
  messagesAverageCharLength: number,
  viewersCount?: number,
  timeSpan: Number, // timespan of measure provided, in ms
}

export interface PointerActivityRecordEvent extends GenericEvent {
  type: "POINTER_ACTIVITY_RECORD",
  timeSpan: Number, // timespan of measure provided, in ms
  activityScore: Number // number between 0 and 1
}
export interface IsPlayingActivityRecord extends GenericEvent {
  type: "IS_PLAYING_ACTIVITY_RECORD"
  isPlaying: Boolean
  timeSpan: Number, // timespan of measure provided, in ms
  currentTime?: string,
  duration?: string
}

export interface LiveUserActivityRecord extends GenericEvent {
  type: "LIVE_USER_ACTIVITY_RECORD"
  isPlaying: Boolean
  timeSpan: Number, // timespan of measure provided, in ms
  currentMediaTime?: string,
  pointerActivityScore: Number,
  hasFocus: Boolean,
}

export type captureEventsList = Array<GenericEvent>