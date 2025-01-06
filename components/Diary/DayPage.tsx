import Measure from 'react-measure';
import { useState, useEffect, useMemo } from 'react';
import DayTimeline from './DayTimeline';
import DaySummary from './DaySummary';
import { BROWSE_VIEW } from '~constants';

function DayPage({
  date,
  label,
  events,
  format,
  imposed,
  timeOfDaySpan,
  previewScaleRatio,
  pageNumber,
  type = 'left'
}) {
  const [vizSpaceDimensions, setVizSpaceDimensions] = useState({ width: 100, height: 100 });
  const {channelsMap, contentsMap, rowsCount} = useMemo(() => {
    const validEvents = events
      .filter(event => event.type === BROWSE_VIEW && event.url && event.metadata.title

        && ['live', 'video', 'short'].includes(event.viewType)
      );
      const contents = new Map();
    const channels = new Map();
    let index = 0;
    let rCount = 0;
    validEvents.forEach(event => {
      const channel = event.metadata.channelName || event.metadata.channelId;
      if (!channels.has(channel)) {
        channels.set(channel, new Map());
        rCount++;
      }
      const uniqueContents = channels.get(channel);// || new Map();
      if (!uniqueContents.has(event.url)) {
        index++;
        rCount++;
        uniqueContents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
        contents.set(event.url, {
          url: event.url,
          title: event.metadata.title,
          channel,
          platform: event.platform,
          index
        })
      }
      channels.set(channel, uniqueContents)
    })
    return {
      contentsMap: contents,
      channelsMap: channels,
      rowsCount: rCount
    }
  }, [events])
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
                    {...{date, timeOfDaySpan, format, imposed}}
                  />
                  :
                  <DaySummary
                    {...vizSpaceDimensions}
                    {...{date, timeOfDaySpan, channelsMap, rowsCount}}
                  
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