


const DAYS_OF_WEEK_MAP_REVERSE = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
}

interface WeekdaysPickerProps {
  state: Array<number>
  setState: ((s: Array<number>) => void)
}

const WeekdaysPicker = ({
  state = [], 
  setState

}: WeekdaysPickerProps) => {
  // const withName = state.map(key => ({key, label: DAYS_OF_WEEK_MAP_REVERSE[key]}))
  return (
    <ul className="WeekdaysPicker tags-list">
      {
        [1,2,3,4,5,6,0].map((key) => {
          const label = DAYS_OF_WEEK_MAP_REVERSE[key];
          return (
            <li key={key}>
              <button
                className={state.includes(key) ? 'active' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  if (state.includes(key)) {
                    setState(state.filter(s => s !== key))
                  } else {
                    setState([...state, key].filter(d => d !== undefined && d !== null))
                  }
                }}
              >
                {label}
              </button>
            </li>
          )
        })
      }
    </ul>
  )
}
export default WeekdaysPicker;