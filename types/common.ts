import { PLATFORMS } from "~constants"
import type { BrowseViewEvent, CaptureEventsList } from "./captureEventsTypes";
import type { ReactNode } from "~node_modules/@types/react";

const Platforms = [...PLATFORMS] as const;
type Platform = (typeof Platforms)[number];

export interface AvailableChannel {
  id: string
  label?: string
  channelId: string
  channelName: string
  platform: Platform,
  urls: Set<string>
  urlsCount?: number
  status?: string
}

export type ReactChildren = ReactNode

export type AvailableChannels = Array<AvailableChannel>
export interface AvailableChannelsMap {
  [key: string]: AvailableChannel
}

export interface Dimensions {
  width: number
  height: number
}

export interface HabitsData {
  [key: string]: {
    [key: number]: {
      count: number,
      duration: number,
      channels: Array<string>,
      breakdown: {
        [key: Platform]: {
          count: number,
          duration: number
        }
      }
    }
  }
}

export interface SelectOption {
  label: string
  value: any
}

export interface DayData {
  value: number
  key: string
  date: Date
}
export interface DaysData {
  [key: string]: DayData
}

export interface SuggestionSubItem {
  id: string,
  title: string,
  token: string
}
export interface ActionSuggestion {
  type: 'creation' | 'addition',
  id: string,
  title: string,
  items: Array<SuggestionSubItem>
}

export interface ContentsMapItem {
  url: string
  title: string
  channel: string
  platform: Platform
  index: number
}

export type ChannelsMapItem = Map<string, ContentsMapItem>

export interface SpansSettings {
  [key: string]: {
    legendLabel: string
    tooltipFn: Function
    markType: string
    color: string
  }

}

export interface SpanObject {
  startY: number
  endY: number
  start: number
  end: number
}
export interface ChatSlice extends SpanObject {
  messagesCount: number
  platform: Platform
  timeSpan: number
}

export interface DailyBrowseViewEventComputed extends BrowseViewEvent {
  endY: number
  endDate: Date
  computedContents: {
    title: string
    platform: Platform
    channel: string
    index: number
  }
  y: number
}
export interface DailyComputedSession {
  id: string
  dateExtent: [Date, Date]
  yExtent: [number, number]
  columnIndex: number
  browsingEvents: Array<DailyBrowseViewEventComputed>

  playingSpans: Array<SpanObject>
  focusSpans: Array<SpanObject>
  activeSpans: Array<SpanObject>
  chatSlices: Array<ChatSlice>
}

export interface DiaryDay {
  date: Date,
  label: string
  events: CaptureEventsList
}
export interface DiaryDataByDayType {
  [key: number]: DiaryDay
}