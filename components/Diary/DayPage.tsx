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
  annotations = {},
  pageNumber,
  annotationColumnsNames,
  type = 'left'
}) {
  const {creators = {}, tags = {}, expressions = {}} = annotations;
  const [vizSpaceDimensions, setVizSpaceDimensions] = useState({ width: 100, height: 100 });
  // @todo factorize that with home view
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
      let channel = event.metadata.channelName || event.metadata.channelId;
      const channelSlug = `${event.metadata.channelId}-${event.platform}`;
      const creator = Object.values(creators).find(c => c.channels.includes(channelSlug));
      channel = creator ? creator.name : channel;
      // console.log('creators', creators, channelSlug);
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
  }, [events, creators]);
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