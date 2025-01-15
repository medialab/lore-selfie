import { PLATFORMS } from "~constants"

const Platforms = [...PLATFORMS] as const;
type Platform = (typeof Platforms)[number];

export interface AvailableChannel {
  id: string
  channelId: string
  channelName: string
  platform: Platform,
  urls: Set<string>
  urlsCount?: number
}

export type AvailableChannels = Array<AvailableChannel>

export interface Dimensions {
  width: number
  height: number
}

export interface HabitsData {
  [key: string]: {
    [key: number]: {
      count: number,
      duration: number,
      channels: Array<object>,
      breakdown: {
        [key: Platform]: {
          count: number,
          duration: number
        }
      }
    }
  }
}


export interface DayData {
  value: number
  key: string
  date: Date
}
export interface DaysData {
  [key: string]: DayData
}