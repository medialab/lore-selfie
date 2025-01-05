import { useMemo, useState } from 'react';
import Measure from 'react-measure';
import './Diary.scss';
import Cover from './Cover';
import DayPage from './DayPage';
import A5Imposed from './A5Imposed';
import { formatNumber } from '~helpers';

function DiaryWrapper({
  timeSpan,
  timeOfDaySpan,
  daysOfWeek,
  platforms,
  channelsSettings,
  excludedTitlePatterns,
  visibleEvents,
}) {
  const [format, setFormat] = useState('A5-imposed');
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
  const dataByDay = useMemo(() => {
    const DAY = 24 * 3600 * 1000;
    const fromDay = new Date(timeSpan[0]).getTime();
    const toDay = new Date(timeSpan[1]).getTime();
    let current = fromDay;
    const days = {}
    while (current <= toDay) {
      const date = new Date(current);
      let dayNumber = date.getDate() + '';
      const dayOfWeek = date.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        dayNumber = dayNumber === '1' ? '1<sup>er</sup>' : dayNumber;
        days[current] = {
          label: `${daysMap[dayOfWeek]} ${dayNumber} ${monthsMap[date.getMonth()]} ${date.getFullYear()}`,
          events: []
        }
      }

      current += DAY;
    }
    return days;
  }, [visibleEvents, timeSpan, daysOfWeek]);


  const formatWidth = {
    A5: 1754 / 3,
    A4: 3508 / 4.2,
    'A5-imposed': 2480 / 2.1,
  }

  const previewScaleRatio = useMemo(() => {
    const contentWidth = formatWidth[format];
    return dimensions.width / contentWidth
  }, [format, dimensions])

  return (
    <div className="DiaryWrapper">
      <div className="header">
        <div>{Object.keys(dataByDay).length} jours, </div>
        <div>{formatNumber(visibleEvents.length)} évènements visualisés.</div>
        <ul className="settings">
          <li className="format-picker">
            <span className="format-label">Format</span>
            <button className={`important-button ${format === 'A5-imposed' ? 'active' : ''}`} onClick={() => setFormat('A5-imposed')}>
              A5 imposé sur A4 (livret)
            </button>
            <button className={`important-button ${format === 'A4' ? 'active' : ''}`} onClick={() => setFormat('A4')}>
              A4
            </button>
            <button className={`important-button ${format === 'A5' ? 'active' : ''}`} onClick={() => setFormat('A5')}>
              A5
            </button>

          </li>
          <li>
            <button className="important-button" onClick={() => { window.print() }}>Imprimer</button>
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
            <div style={{transformOrigin: 'top left', transform: `scale(${previewScaleRatio})`}} className="pages-container">
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
                        const type = isOdd ? 'left' : 'right'
                        return (
                          <DayPage
                            key={`day-${id}-${type}`}
                            {
                            ...{
                              format: 'A5',
                              events: day.events,
                              label: day.label,
                              type,
                              imposed: true
                            }
                            }
                          />
                        )
                      }
                    }}
                  />
                  :
                  <>
                    <Cover days={dataByDay} format={format} imposed={false} />
                    {
                      Object.entries(dataByDay).map(([id, day]: [string, object]) => {
                        return (
                          <>
                            <DayPage
                              key={`day-${id}-left`}
                              {
                              ...{
                                format,
                                events: day.events,
                                label: day.label,
                                type: 'left',
                                imposed: false
                              }
                              }
                            />
                            <DayPage
                              key={`day-${id}-right`}
                              {
                              ...{
                                format,
                                events: day.events,
                                label: day.label,
                                type: 'right',
                                imposed: false
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