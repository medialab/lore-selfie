import {type Annotations} from "./annotations"
import type { CaptureEventsList } from "./captureEventsTypes"
import {type Settings} from './settings'

export interface AllData {
  annotations: Annotations,
  settings: Settings,
  activity: CaptureEventsList,
}

export interface DataRecord extends AllData {
  type: 'lore-selfie-record',
  title: string,
  date: string,
  pluginVersion: string,
  learnMoreURL: string
}