import { useMemo, useState } from 'react';
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
  }, [visibleEvents, timeSpan, daysOfWeek])
  return (
    <div className="DiaryWrapper">
      <div className="header">
      <div>{Object.keys(dataByDay).length} jours, </div>
      <div>{formatNumber(visibleEvents.length)} actions capturées.</div>
        <ul className="settings">
          <li className="format-picker">
            <span>Format</span>
            <button className={format === 'A5-imposed' ? 'active' : ''} onClick={() => setFormat('A5-imposed')}>
              A5 imposé sur A4 (livret à imprimer)
            </button>
            <button className={format === 'A4' ? 'active' : ''} onClick={() => setFormat('A4')}>
              A4
            </button>
            <button className={format === 'A5' ? 'active' : ''} onClick={() => setFormat('A5')}>
              A5
            </button>

          </li>
          <li>
            <button onClick={() => {window.print()}}>Imprimer</button>
          </li>
        </ul>
      </div>
      <div className={`document-space ${format}`}>
        {
          format === 'A5-imposed' ?
            <A5Imposed
              numberOfPages={Object.entries(dataByDay).length + 1}
              renderPage={index => {
                // console.log('render page', index, Object.entries(dataByDay).length);
                if (index === 0) {
                  return <Cover days={dataByDay} format={'A5'} imposed={true} />
                } else if (index >= Object.entries(dataByDay).length) {
                  return <div className="page A5 blank is-imposed" />
                } else {
                  const [id, day] = Object.entries(dataByDay)[index];
                  return (
                    <DayPage
                      key={`day-${id}`}
                      {
                      ...{
                        format: 'A5',
                        events: day.events,
                        label: day.label,
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
                    <DayPage
                      key={`day-${id}`}
                      {
                      ...{
                        format,
                        events: day.events,
                        label: day.label,
                        imposed: false
                      }
                      }
                    />
                  )
                })
              }
            </>
        }
      </div>
    </div>
  )
}
export default DiaryWrapper;