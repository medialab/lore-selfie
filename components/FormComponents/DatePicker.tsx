import { useState, useEffect, useMemo } from 'react';
import { Tooltip } from 'react-tooltip'
import { scaleLinear } from 'd3-scale';

import 'react-tooltip/dist/react-tooltip.css'

const formatDatepickerDate = d => {
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

const DAY = 3600 * 24 * 1000;

export default function DatePicker({
  value,
  range,
  startOfWeekId = 1,
  daysData = {},
  onChange,
}) {
  const daysMap = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    0: 'Dimanche',
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
  const [currentMonth, setCurrentMonth]: [Array<Number>, Function] = useState();
  const [tempValue, setTempValue] = useState();
  const [isSelecting, setIsSelecting] = useState(false);

  const resetTempValue = useMemo(() => () => {
    const now = formatDatepickerDate(new Date());
    let currentMonthDate = now;
    // set proper temp value
    if (range) {
      if (Array.isArray(value) && value.length === 2) {
        const cleanValues = [];
        if (value[0]?.getTime && value[0].getTime()) {
          cleanValues.push(value[0])
        } else {
          cleanValues.push(undefined);
        }
        if (value[1]?.getTime && value[1].getTime()) {
          cleanValues.push(value[1]);
          currentMonthDate = value[1];
        } else {
          cleanValues.push(now);
        }
        setTempValue(cleanValues);
      } else {
        setTempValue([]);
      }
    } else {
      if (value?.isValid && value.isValid()) {
        setTempValue(value);
        currentMonthDate = value;
      } else {
        setTempValue();
      }
    }
    const currentMonthYear = currentMonthDate.getFullYear();
    const currentMonthMonth = currentMonthDate.getMonth();
    setCurrentMonth([
      currentMonthMonth,
      currentMonthYear,
    ]);
  }, [range, value, setTempValue, setCurrentMonth]);

  // value or range has changed
  useEffect(() => {
    resetTempValue();
    setIsSelecting(false);
  }, [value, range]);

  const weeks = useMemo(() => {
    if (!currentMonth) {
      return [];
    }
    const [month, year] = currentMonth;
    const firstOfMonth = formatDatepickerDate(new Date(+year, +month, 1));
    const lastOfMonth = formatDatepickerDate(new Date(+year, +month + 1, 0));
    // const numberOfDays = lastOfMonth.getDate();

    const used = firstOfMonth.getDay() + lastOfMonth.getDate();
    const numberOfWeeks = Math.ceil(used / 7);
    let result = [];
    let currentDay = firstOfMonth;
    for (let i = 0; i < numberOfWeeks; i++) {
      let daysOfThisWeek = [];
      if (i === 0) {

        // const startDateDay = firstOfMonth.getDay();
        // add days before
        let dayBefore = new Date(firstOfMonth.getTime() - DAY);
        let dayCount = 0;
        while (dayBefore.getDay() >= +startOfWeekId) {
          const newDay = {
            outOfMonth: true,
            date: dayBefore,
            dateNumber: dayBefore.getDate(),
            weekId: dayBefore.getDay()
          }
          daysOfThisWeek = [newDay, ...daysOfThisWeek]
          dayBefore = new Date(dayBefore.getTime() - DAY);
          dayCount++;
        }
        // add days
        while (dayCount < 7) {
          daysOfThisWeek.push({
            outOfMonth: false,
            date: currentDay,
            dateNumber: currentDay.getDate(),
            weekId: currentDay.getDay()
          })
          currentDay = new Date(currentDay.getTime() + DAY);
          dayCount++;
        }
      } else {
        let dayCount = 0;
        // add days
        while (dayCount < 7) {
          daysOfThisWeek.push({
            outOfMonth: currentDay.getMonth() !== month,
            weekId: currentDay.getDay(),
            dateNumber: currentDay.getDate(),
            date: currentDay,
          })
          currentDay = new Date(currentDay.getTime() + DAY);
          dayCount++;
        }
      }

      result.push(daysOfThisWeek);
    }
    return result;
  }, [currentMonth, startOfWeekId]);

  const weekValues = useMemo(() => {
    const d = [];
    if (startOfWeekId === 0) {
      for (let i = 0; i < 7; i++) {
        d.push(i);
      }
    } else {
      let i = startOfWeekId - 1;
      while (d.length < 7) {
        if (i >= 6) {
          i = 0;
        } else {
          i += 1;
        }
        d.push(i);
      }
    }
    return d;
  }, [startOfWeekId]);

  const prettyDate = useMemo(() => date => {
    return `${daysMap[date.getDay()].toLowerCase()} ${date.getDate() === 1 ? '1<sup>er</sup>' : date.getDate()} ${monthsMap[date.getMonth()]} ${date.getFullYear()}`
  }, []);


  const radiusScale = useMemo(() => {
    if (daysData) {
      const maxCount = Math.max(...Object.values(daysData).map(d => d.value));
      return scaleLinear()
        .domain([0, maxCount])
        .range([0, 1])
    }
    return scaleLinear()
  }, [daysData])


  return (
    <div className={`DatePicker ${isSelecting ? 'is-selecting' : ''}`}>
      {
        isSelecting ?
          <div className="selecting-placeholder" onClick={
            () => {
              setIsSelecting(false);
              resetTempValue();
            }
          } />
          : null
      }
      <div className="month-picker">
        <button
          onClick={() => {
            const [month, year] = currentMonth;
            if (+month === 0) {
              setCurrentMonth([11, +year - 1])
            } else {
              setCurrentMonth([+month - 1, +year])
            }
          }}
        >
          {'< mois précédent'}
        </button>
        <div className="current-month">
          <span>
            {
              currentMonth ?
                `${monthsMap[currentMonth[0]]} ${currentMonth[1]}`
                : null
            }
          </span>
        </div>
        <button
          onClick={() => {
            const [month, year] = currentMonth;
            if (+month === 11) {
              setCurrentMonth([0, +year + 1])
            } else {
              setCurrentMonth([+month + 1, +year])
            }
          }}
        >
          {'mois suivant >'}
        </button>
      </div>
      <div className="date-picker">
        <ul className="days-of-week name-of-days">
          {
            weekValues
              .map((id) => {
                return (
                  <li key={id}>
                    <span>
                      {daysMap[id].charAt(0)}
                    </span>
                  </li>
                )
              })
          }
        </ul>
        <ul className="weeks">
          {
            weeks.map((days, weekIndex) => {
              return (
                <li className="week" key={weekIndex}>
                  <ul className="days-of-week">
                    {
                      days.map(({
                        outOfMonth,
                        weekId,
                        dateNumber,
                        date
                      }) => {

                        const isSelected = !tempValue ? false : range ?
                          date >= tempValue[0] && date <= tempValue[1]
                          : date === tempValue;
                        const key = new Date(date.getTime() + DAY).toJSON().split('T')[0];
                        const data = daysData[key];
                        const count = data?.value || 0;
                        const radius = count ? radiusScale(count) : 0;
                        // console.log({radius, count, data, key, daysData})
                        const handleClick = () => {
                          if (range) {
                            if (isSelecting) {
                              setTempValue([tempValue[0], date]);
                              onChange([tempValue[0], date]);
                              setIsSelecting(false);
                            } else {
                              setIsSelecting(true);
                              setTempValue([date, date]);
                            }

                          } else {
                            onChange(date);
                            setIsSelecting(false);
                          }
                        }
                        const handleMouseEnter = () => {
                          if (range && isSelecting) {
                            setTempValue([tempValue[0], date]);
                          }
                        }
                        return (
                          <li
                            key={dateNumber}
                            onClick={handleClick}
                            onMouseEnter={handleMouseEnter}
                            className={`day ${isSelected ? 'is-selected' : ''} ${outOfMonth ? 'out-of-month' : ''}`}
                            data-tooltip-id="datepicker-tooltip"
                            data-tooltip-html={`${daysMap[weekId]} ${dateNumber === 1 ? '1<sup>er</sup>' : dateNumber} ${monthsMap[date.getMonth()]} ${date.getFullYear()}`}
                          >
                            {
                              radius ?
                                <div className="value-indicator-container">
                                  <div className="value-indicator"
                                    style={{
                                      width: radius * .5 * 100 + '%',
                                      height: radius * .5 * 200 + '%'
                                    }}
                                  />
                                </div>

                                : null
                            }
                            <button>
                              <span>
                                {dateNumber}
                              </span>
                            </button>
                          </li>
                        )
                      })
                    }
                  </ul>
                </li>
              )
            })
          }
        </ul>
        <div className={"footer"}>
          {
            tempValue ?
              <div>
                <span>{range ? 'Dates sélectionnées' : 'Date sélectionnée'} : </span>
                <span></span>
                {
                  range ?
                    <span>du <strong dangerouslySetInnerHTML={{ __html: prettyDate(tempValue[0]) }} /> au <strong dangerouslySetInnerHTML={{ __html: prettyDate(tempValue[1]) }} /></span>
                    : <span dangerouslySetInnerHTML={{ __html: prettyDate(tempValue) }} />
                }
              </div>
              : null
          }
        </div>
      </div>
      <Tooltip id="datepicker-tooltip" />
    </div>
  )
}