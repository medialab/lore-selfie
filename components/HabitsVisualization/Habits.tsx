import { scaleLinear } from "d3-scale"
import { useMemo, useState } from "react"
import Measure from "react-measure"
import { Tooltip } from "react-tooltip"
import partialCircle from "svg-partial-circle"

import "~/styles/Habits.scss"

import { PLATFORMS_COLORS } from "~constants"
import { msToNiceDuration, numberToDoubleDigit } from "~helpers"
import type { Dimensions, HabitsData } from "~types/common"

interface HabitsProps {
  habitsTimespan: [Date, Date]
  habitsBinDuration: number
  data: HabitsData
  startOfWeekId?: number
}

export default function Habits({
  // habitsTimespan,
  habitsBinDuration,
  startOfWeekId = 1,
  data
}: HabitsProps) {
  const valueField = "duration"
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 100,
    height: 100
  })
  const daysMap = {
    0: "Dimanche",
    1: "Lundi",
    2: "Mardi",
    3: "Mercredi",
    4: "Jeudi",
    5: "Vendredi",
    6: "Samedi"
  }

  interface DayMeta {
    id: number
    label: string
  }
  interface DaysComputed {
    days: Array<DayMeta>
    daysToColumn: {
      [key: string]: number
    }
  }
  const { days, daysToColumn }: DaysComputed = useMemo(() => {
    const m = {}
    let d = []
    if (startOfWeekId) {
      for (let i = startOfWeekId; i <= 6; i++) {
        d.push(i)
      }
      for (let i = 0; i < startOfWeekId; i++) {
        d.push(i)
      }
    } else {
      d = Object.keys(daysMap)
    }
    const daysOutput = d.map((dat, index) => {
      m[dat] = index
      return {
        id: +dat,
        label: daysMap[dat]
      }
    })
    return {
      days: daysOutput,
      daysToColumn: m
    }
  }, [daysMap, startOfWeekId])
  const bins = useMemo(() => {
    const b = []
    for (let h = 0; h < 24 * 3600 * 1000; h += habitsBinDuration) {
      b.push({
        start: h,
        end: h + habitsBinDuration,
        label: `${h / 3600000}h-${(h + habitsBinDuration) / 3600000}h`
      })
    }
    return b
  }, [habitsBinDuration])

  const rowHeight = useMemo(
    () => dimensions.height / (bins.length + 1),
    [bins, dimensions.height]
  )
  const columnWidth = useMemo(
    () => dimensions.width / (days.length + 1),
    [days, dimensions.height]
  )
  const areaScale = useMemo(() => {
    const minDimension = Math.min(rowHeight, columnWidth)
    const radius = minDimension / 2
    let maxValue = 1
    if (data) {
      const values = []
      Object.values(data).forEach((day) => {
        Object.values(day).forEach((thatBinData) => {
          values.push(thatBinData[valueField])
        })
      })
      maxValue = Math.max(...values)
    }
    return scaleLinear()
      .domain([0, maxValue])
      .range([0, Math.PI * radius * radius])
  }, [data, rowHeight, columnWidth, valueField])
  const getRadius = useMemo(
    () => (val) => {
      const area = areaScale(val)
      return Math.sqrt(area / Math.PI)
    },
    [areaScale]
  )
  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        setDimensions(contentRect.bounds)
      }}>
      {({ measureRef }) => (
        <div ref={measureRef} className="Habits">
          <svg
            className="HabitsViz"
            width={dimensions.width}
            height={dimensions.height}>
            <g className="background-items">
              {days.map(({ id, label }, index) => {
                const x = columnWidth * (index + 1)
                return (
                  <g
                    className="background-day"
                    key={id}
                    transform={`translate(${x}, 0)`}>
                    <text
                      className="bg-label x-label"
                      x={columnWidth / 2}
                      y={rowHeight - 10}>
                      {label.charAt(0).toUpperCase()}
                    </text>
                    <line
                      className="bg-line"
                      x1={columnWidth / 2}
                      x2={columnWidth / 2}
                      y1={rowHeight}
                      y2={dimensions.height - rowHeight / 2}
                    />
                  </g>
                )
              })}
              {bins.map(
                (
                  {
                    start,
                    // end,
                    label
                  },
                  index
                ) => {
                  const y = rowHeight * (index + 1)
                  return (
                    <g
                      className="background-bin"
                      key={start}
                      transform={`translate(${0}, ${y})`}>
                      <text
                        className="bg-label y-label"
                        x={columnWidth - 10}
                        y={rowHeight / 2 + 3}>
                        {label}
                      </text>
                      <line
                        className="bg-line"
                        x1={columnWidth}
                        x2={dimensions.width - columnWidth / 2}
                        y1={rowHeight / 2}
                        y2={rowHeight / 2}
                      />
                    </g>
                  )
                }
              )}
            </g>
            <g className="main-objects-container">
              {data
                ? days.reduce((res, { id: dayId }) => {
                    return [
                      ...res,
                      ...bins.map(({ start }, binIndex) => {
                        const id = `${dayId}-${start}`
                        const datum = data[dayId + ""][start]
                        if (datum && datum[valueField]) {
                          const x =
                            (daysToColumn[dayId] + 1) * columnWidth +
                            columnWidth / 2
                          const y = (binIndex + 1) * rowHeight + rowHeight / 2
                          const generalRadius = getRadius(datum[valueField])
                          const breakDownTotal = Object.values(
                            datum.breakdown || {}
                          )
                            .map((d) => d[valueField])
                            .reduce((sum, d) => sum + d, 0)
                          let portionDisplacement = 0
                          const breakdown = Object.entries(datum.breakdown).map(
                            ([key, dat]) => {
                              const val = dat[valueField]
                              const portion = val / breakDownTotal
                              const position = portionDisplacement // + portion
                              portionDisplacement += portion
                              return {
                                key,
                                portion,
                                position
                              }
                            }
                          )

                          return (
                            <g key={id} transform={`translate(${x}, ${y})`}>
                              <circle
                                className="bin-object-count-bg-circle"
                                cx={0}
                                cy={0}
                                r={generalRadius}
                              />
                              {breakdown

                                // .filter(({portion}) => portion)
                                .map(({ key, position, portion }) => {
                                  let tooltipContent = `<div>Environ ${msToNiceDuration(datum[valueField])} cumulées (${Math.round(portion * 100)}%) enregistrées sur ${key} pour ce créneau.</div>`
                                  if (Object.values(datum.channels).length) {
                                    const channelsTotalDuration = Object.values(
                                      datum.channels
                                    ).reduce((sum, c) => sum + c.duration, 0)
                                    tooltipContent += `<div>Chaînes regardées : 
                                    <ol>
                                    ${Object.values(datum.channels)
                                      .sort((a, b) => {
                                        if (a.duration > b.duration) {
                                          return -1
                                        }
                                        return 1
                                      })
                                      .map(({ channel, duration }) => {
                                        return `
                                        <li>
                                      ${numberToDoubleDigit(Math.round((duration / channelsTotalDuration) * 100))}% - ${channel} (${msToNiceDuration(duration)})
                                        </li>
                                        `
                                      })
                                      .join("\n")}
                                    </ol>
                                    </div>`
                                  }
                                  const d = [
                                    ...partialCircle(
                                      0,
                                      0, // center X and Y
                                      generalRadius, // radius
                                      (position * 360 * Math.PI) / 180 -
                                        Math.PI / 2, // start angle
                                      ((position + portion) * 360 * Math.PI) /
                                        180 -
                                        Math.PI / 2 // end angle
                                    ),
                                    [`L ${0} ${0} Z`]
                                  ]
                                    .map((command) => command.join(" "))
                                    .join(" ")
                                  if (portion === 1) {
                                    return (
                                      <circle
                                        key={key}
                                        cx={0}
                                        cy={0}
                                        r={generalRadius}
                                        fill={PLATFORMS_COLORS[key]}
                                        className="breakdown-object"
                                        data-tooltip-id="habits-vis-tooltip"
                                        data-tooltip-html={tooltipContent}
                                      />
                                    )
                                  }
                                  return (
                                    <path
                                      key={key}
                                      d={d}
                                      fill={PLATFORMS_COLORS[key]}
                                      className="breakdown-object"
                                      data-tooltip-id="habits-vis-tooltip"
                                      data-tooltip-html={tooltipContent}
                                    />
                                  )
                                })}
                            </g>
                          )
                        }
                        return null
                      })
                    ]
                  }, [])
                : null}
            </g>
          </svg>
          <Tooltip id="habits-vis-tooltip" />
        </div>
      )}
    </Measure>
  )
}
