export interface Handle {
  platform: string
  internalId: string
  id: string
  alias: string
}

export interface Settings {
  handles: Array<Handle>
  recordOnPlatforms: Array<string>
  liveRecordingInterval: number
  recordActivity: boolean
  recordTabs: boolean
  recordMouse: boolean
  recordChat: boolean
}
