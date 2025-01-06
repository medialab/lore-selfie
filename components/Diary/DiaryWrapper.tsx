import { useMemo, useState, useRef, useEffect } from 'react';
import Measure from 'react-measure';
import './Diary.scss';
import Cover from './Cover';
import DayPage from './DayPage';
import A5Imposed from './A5Imposed';
import { formatNumber, timeOfDayToMs } from '~helpers';

function DiaryWrapper({
  timeSpan,
  timeOfDaySpan,
  daysOfWeek,
  platforms,
  channelsSettings,
  excludedTitlePatterns,
  visibleEvents,
}) {
  const previewerRef = useRef(null);
  const [format, setFormat] = useState('A4-landscape');
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 })
  const daysMap = {
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
  }
  const monthsMap = {
    0: 'Janvier',
    1: 'Février',
    2: 'Mars',
    3: 'Avril',
    4: 'Mai',
    5: 'Juin',
    6: 'Juillet',
    7: 'Août',
    8: 'Septembre',
    9: 'Octobre',
    10: 'Novembre',
    11: 'Décembre',
  }
  // @todo compute that in a worker
  const dataByDay = useMemo(() => {
    const DAY = 24 * 3600 * 1000;
    const fromDay = new Date(timeSpan[0]).getTime();
    const toDay = new Date(timeSpan[1]).getTime();
    
    let [fromTimeInMs, toTimeInMs] =  timeOfDaySpan.map(timeOfDayToMs);
    // if end time is smaller than start time add a day
    if (toTimeInMs < fromTimeInMs) {
      toTimeInMs += DAY;
    }
    let current = fromDay;
    const days = {}
    while (current <= toDay) {
      const date = new Date(current);
      let dayNumber = date.getDate() + '';
      const dayOfWeek = date.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        dayNumber = dayNumber === '1' ? '1<sup>er</sup>' : dayNumber;
        days[current] = {
          date: current,
          label: `${daysMap[dayOfWeek]} ${dayNumber} ${monthsMap[date.getMonth()]} ${date.getFullYear()}`,
          events: visibleEvents.filter(event => {
            const d = new Date(event.date).getTime();
            if (d >= current + fromTimeInMs && d <= current + toTimeInMs) {
              return true;
            }
          })
        }
      }

      current += DAY;
    }
    return days;
  }, [visibleEvents, timeSpan, daysOfWeek]);


  useEffect(() => {
    if (previewerRef && previewerRef.current) {
      previewerRef.current.parentNode.scrollTop = 0;
    }
  }, [format, previewerRef])
  const formatWidth = {
    A5: 1754 / 3,
    A4: 3508 / 4.2,
    'A5-imposed': 2480 / 2.1,
    'A4-landscape': 2480 / 2.1,
  }

  const previewScaleRatio = useMemo(() => {
    const contentWidth = formatWidth[format];
    return dimensions.width / contentWidth
  }, [format, dimensions]);

  
  return (
    <div className="DiaryWrapper">
      <div className="header">
        <div>{Object.keys(dataByDay).length} jours, </div>
        <div><span dangerouslySetInnerHTML={{__html: '&nbsp;'}}/>{formatNumber(visibleEvents.length)} évènements.</div>
        <ul className="settings">
          <li className="format-picker">
            <span className="format-label">format</span>
            <button className={`important-button ${format === 'A5-imposed' ? 'active' : ''}`} onClick={() => setFormat('A5-imposed')}>
              A5 imposé sur A4 (livret)
            </button>
            <button className={`important-button ${format === 'A4' ? 'active' : ''}`} onClick={() => setFormat('A4')}>
              A4 portrait
            </button>
            <button className={`important-button ${format === 'A4-landscape' ? 'active' : ''}`} onClick={() => setFormat('A4-landscape')}>
              A4 paysage
            </button>
            <button className={`important-button ${format === 'A5' ? 'active' : ''}`} onClick={() => setFormat('A5')}>
              A5
            </button>

          </li>
          <li>
            <button className="important-button" onClick={() => { window.print() }}>imprimer</button>
          </li>
        </ul>
      </div>
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className={`document-space ${format}`}>
            <div 
              ref={previewerRef}
              style={{
                transformOrigin: 'top left', 
                transform: `scale(${previewScaleRatio})`, 
                // maxHeight: `calc(${100 * previewScaleRatio}% + 20 rem)`
              }} 
              className="pages-container"
            >
              {
                format === 'A5-imposed' ?
                  <A5Imposed
                    numberOfPages={(Object.entries(dataByDay).length + 1) * 2}
                    renderPage={(index) => {
                      // console.log('render page', index, Object.entries(dataByDay).length);
                      if (index === 0) {
                        return <Cover days={dataByDay} format={'A5'} imposed={true} />
                      } else if (index >= (Object.entries(dataByDay).length + 1) * 2 - 1) {
                        return <div className="page A5 blank is-imposed" />
                      } else {
                        const roundIndex = index + index % 2;
                        const dayIndex = (roundIndex / 2) - 1;
                        const [id, day] = Object.entries(dataByDay)[dayIndex];
                        const isOdd = index % 2 !== 0;
                        const type = isOdd ? 'left' : 'right';
                        // console.log('render page index %s gets day index %s', index, dayIndex)
                        return (
                          <DayPage
                            key={`day-${id}-${type}`}
                            {
                            ...{
                              format: 'A5',
                              ...day,
                              timeOfDaySpan,
                              previewScaleRatio,
                              type,
                              imposed: true,
                              pageNumber: (index + 1)
                            }
                            }
                          />
                        )
                      }
                    }}
                  />
                  :
                  format === 'A4-landscape' ?
                  <>
                  <Cover days={dataByDay} format={'A4-landscape'} imposed={false} />
                    {
                      Object.entries(dataByDay).map(([id, day]: [string, object], index) => {
                        return (
                          <section key={`day-${id}`} className={`page A4-landscape imposition-page`}>
                            <DayPage
                              key={`day-${id}-left`}
                              {
                              ...{
                                format: 'A5',
                                ...day,

                                timeOfDaySpan,
                                previewScaleRatio,
                                type: 'left',
                                imposed: true,
                                pageNumber: (index + 1)

                              }
                              }
                            />
                            <DayPage
                              key={`day-${id}-right`}
                              {
                              ...{
                                format: 'A5',
                                ...day,

                                timeOfDaySpan,
                                previewScaleRatio,
                                type: 'right',
                                imposed: true,
                                // pageNumber: index + 1
                              }
                              }
                            />
                          </section>
                        )
                      })
                    }
                    </>
                  :
                  <>
                    <Cover days={dataByDay} format={format} imposed={false} />
                    {
                      Object.entries(dataByDay).map(([id, day]: [string, object], index) => {
                        return (
                          <>
                            <DayPage
                              key={`day-${id}-left`}
                              {
                              ...{
                                format,
                                ...day,

                                timeOfDaySpan,
                                previewScaleRatio,
                                type: 'left',
                                imposed: false,
                                pageIndex: (index * 2 + 1)
                              }
                              }
                            />
                            <DayPage
                              key={`day-${id}-right`}
                              {
                              ...{
                                format,
                                ...day,
                                timeOfDaySpan,
                                previewScaleRatio,
                                type: 'right',
                                imposed: false,
                                pageIndex: (index * 2 + 2)
                              }
                              }
                            />
                          </>
                        )
                      })
                    }
                  </>
              }
            </div>
          </div>
        )}
      </Measure>

    </div>
  )
}
export default DiaryWrapper;