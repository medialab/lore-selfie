import { useMemo } from "react"

interface TimePickerProps {
  label: string
  value: string
  onChange(s: string): void
  minutesSpan?: number
}

export default function TimePicker({
  label,
  value,
  onChange,
  minutesSpan = 15
}: TimePickerProps) {
  const hoursValues = useMemo(() => {
    const hours = {
      0: {
        label: "minuit",
        value: 0
      }
    }
    for (let i = 1; i <= 23; i++) {
      hours[i] = {
        label: i + "h",
        value: i
      }
    }
    return hours
  }, [])
  const minutesValues = useMemo(() => {
    const minutes = {}
    for (let i = 0; i < 60; i += minutesSpan) {
      minutes[i] = {
        label: i + "m",
        value: i
      }
    }
    return minutes
  }, [minutesSpan])

  const actualValues: [number, number] = useMemo(() => {
    let [hours = 0, minutes = 0] = value.split(":")
    if (isNaN(+hours)) {
      hours = 0
    } else {
      hours = +hours
    }
    if (isNaN(+minutes)) {
      minutes = 0
    } else {
      minutes = +minutes
    }
    return [hours, minutes]
  }, [value])

  const handleChangeHours = (val) => {
    const newValue = [val, actualValues[1]].join(":")
    onChange(newValue)
  }
  const handleChangeMinutes = (val) => {
    const newValue = [actualValues[0], val].join(":")
    onChange(newValue)
  }
  return (
    <div className="TimePicker">
      <div className="label">{label}</div>
      <select
        value={actualValues[0]}
        onChange={(e) => handleChangeHours(e.target.value)}>
        {Object.values(hoursValues).map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={actualValues[1]}
        onChange={(e) => handleChangeMinutes(e.target.value)}>
        {Object.values(minutesValues).map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
