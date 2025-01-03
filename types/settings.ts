

export interface Handle {
  platform: String
  internalId: String
  id: String
  alias: String
}

export interface Settings {
  handles: Array<Handle>,
  recordOnPlatforms: Array<String>,
  liveRecordingInterval: Number,
  recordTabs: Boolean,
  recordMouse: Boolean,
  recordChat: Boolean
}