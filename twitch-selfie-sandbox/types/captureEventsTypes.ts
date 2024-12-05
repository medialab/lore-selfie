
enum Platform {
  youtube = "YOUTUBE",
  twitch = "TWITCH",
  tiktok = "TIKTOK"
}

export interface Browser {
  name: String,
  type: String,
  version: String
}

export type EventGeneric = {
  id: String,
  date: Date,
  tabId?: String,
  injectionId: String,
  platform: String,
  url: String
}

export interface OpenPlatformInTabEvent extends EventGeneric {
  type: "OPEN_PLATFORM_IN_TAB",
  browser: Browser,
}
export interface ClosePlatformInTabEvent extends EventGeneric {
  type: "CLOSE_PLATFORM_IN_TAB"
}
export interface UnfocusTabEvent extends EventGeneric {
  type: "UNFOCUS_TAB"
}
export interface FocusTabEvent extends EventGeneric {
  type: "FOCUS_TAB"
}
export interface PointerActivityRecordEvent extends EventGeneric {
  type: "POINTER_ACTIVITY_RECORD",
  timeSpan: Number, // timespan of measure provided, in ms
  activityScore: Number // number between 0 and 1
}

export interface BrowseViewEvent extends EventGeneric {
  type: "BROWSE_VIEW",
  viewType: String,
  metadata: Object,
}

export type captureEventsList = Array<EventGeneric>