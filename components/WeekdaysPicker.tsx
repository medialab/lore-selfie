


// const DAYS_OF_WEEK_MAP = {
//   'Lundi': 0,
//   'Mardi': 1,
//   'Mercredi': 2,
//   'Jeudi': 3,
//   'Vendredi': 4,
//   'Samedi': 5,
//   'Dimanche': 6,
// }
const DAYS_OF_WEEK_MAP_REVERSE = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
}

const WeekdaysPicker = ({state = [], setState}) => {
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