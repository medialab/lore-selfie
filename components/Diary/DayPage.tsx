import Measure from 'react-measure';
import { useState, useMemo } from 'react';
import DayTimeline from './DayTimeline';
import DaySummary from './DaySummary';
import { BROWSE_VIEW } from '~constants';
import type { CaptureEventsList } from '~types/captureEventsTypes';
import type { Annotations } from '~types/annotations';
import { Dimensions } from '~types/common';
import { useBuildStructuredContentsList } from '~hooks';

interface DayPageProps {
  date: Date
  label: string
  events: CaptureEventsList
  format: string
  imposed: boolean
  timeOfDaySpan: [string, string]
  previewScaleRatio: number
  annotations: Annotations
  pageNumber: number
  annotationColumnsNames: Array<string>
  type: string
}

function DayPage({
  date,
  label,
  events,
  format,
  imposed,
  timeOfDaySpan,
  previewScaleRatio,
  annotations,
  pageNumber,
  annotationColumnsNames,
  type = 'left'
}: DayPageProps) {
  const {creators = {}, tags = {}, expressions = {}} = annotations;
  const [vizSpaceDimensions, setVizSpaceDimensions] = useState<Dimensions>({ width: 100, height: 100 });

  const {channelsMap, contentsMap, rowsCount} = useBuildStructuredContentsList(events, creators)
  return (
    <section className={`page DayPage ${format}  ${imposed ? 'is-imposed' : ''} ${type}`}>
      <div className="page-content">

        <div className="page-header">
          {
          type !== 'right' ?
            <h2
              dangerouslySetInnerHTML={{
                __html: label
              }}
            />
            : <h3>Contenus consultés</h3>
            }
        </div>
        <Measure
          bounds
          onResize={contentRect => {
            setVizSpaceDimensions(contentRect.bounds)
          }}
        >
          {({ measureRef }) => (
            <div className="viz-space-container" ref={measureRef}>
              {
                type === 'left' ?
                  <DayTimeline
                    {...vizSpaceDimensions}
                    {...{
                      date, 
                      timeOfDaySpan, 
                      format, 
                      imposed,
                      channelsMap, 
                      contentsMap,
                      events,
                      annotationColumnsNames,
                    }}
                  />
                  :
                  <DaySummary
                    {...vizSpaceDimensions}
                    {...{date, timeOfDaySpan, channelsMap, rowsCount, annotationColumnsNames}}
                  
                  />
              }
            </div>
          )}
        </Measure>
      </div>
        {
          pageNumber ?
          <div className="page-number">
            {pageNumber}
          </div>
          : null
        }
    </section>
  )
}
export default DayPage;