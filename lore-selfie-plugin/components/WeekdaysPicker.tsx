


const DAYS_OF_WEEK_MAP = {
  'Lundi': 0,
  'Mardi': 1,
  'Mercredi': 2,
  'Jeudi': 3,
  'Vendredi': 4,
  'Samedi': 5,
  'Dimanche': 6,
}
const DAYS_OF_WEEK_MAP_REVERSE = {
  0: 'Lundi',
  1: 'Mardi',
  2: 'Mercredi',
  3: 'Jeudi',
  4: 'Vendredi',
  5: 'Samedi',
  6: 'Dimanche',
}

const WeekdaysPicker = ({state = [], setState}) => {
  // const withName = state.map(key => ({key, label: DAYS_OF_WEEK_MAP_REVERSE[key]}))
  return (
    <ul className="WeekdaysPicker">
      {
        Object.entries(DAYS_OF_WEEK_MAP_REVERSE).map(([keyStr, label]) => {
          const key = +keyStr;
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