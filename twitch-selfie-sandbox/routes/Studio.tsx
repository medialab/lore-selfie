import { useEffect, useRef, useState } from "react";
import DatePicker from "react-multi-date-picker"
import { TimePicker } from '@vaadin/react-components/TimePicker.js';
import { DefaultSelector as WeekdayPicker } from 'reactjs-weekdays-picker';

const EDITION_MODES = [
  'diary',
  'poster'
]
const PLATFORMS = [
  'youtube',
  'twitch'
]

const formatDatepickerDate = d => {
  const formatted = new Date(+d.unix * 1000);
  formatted.setHours(0);
  formatted.setMinutes(0);
  formatted.setSeconds(0);
  formatted.setMilliseconds(0);
  return formatted;
}

const InputToValidate = ({
  value,
  onChange,
  onRemove,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEdited, setIsEdited] = useState(true);

  useEffect(() => {
    // setIsEdited(false);
    setCurrentValue(value);
  }, [value]);
  return (
    <div className="InputToValidate">
      {
        !isEdited ?
        <span
          onClick={() => {
            setCurrentValue(value);
            setIsEdited(true);
          }}
        >
          {value}
        </span>
        :
        <form
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            onChange(currentValue);
            setIsEdited(false);
          }}
        >
          <input 
            value={currentValue} 
            onChange={e => setCurrentValue(e.target.value)}
          />
          <button role="submit">
            S
          </button>
        </form>
      }
      <button
        onClick={() => onRemove()}
      >
        X
      </button>
    </div>
  )
}

const FilterInputsList = ({
  value = [],
  onChange
}) => {
  return (
    <ul className="FilterInputsList">
      {
        value.map((exp, index) => {
          const handleChange = val => {
            const newValue = [...value];
            newValue[index] = val
            onChange(newValue)
          }
          const handleRemove = () => {
            const newValue = [...value];
            newValue.splice(index, 1);
            onChange(newValue)
          }
          return (
            <li key={index}>
              <InputToValidate
                value={exp}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            </li>
          )
        })
      }
      <li>
        <button onClick={() => {
          const newValue = [
            ...value,
            ''
          ]
          onChange(newValue);
         
        }}>
          Ajouter
        </button>
      </li>
    </ul>
  )
}

function ChannelsVisibilityEdition ({
  channels,
  onChange
}) {
  return (
    <ul className={'ChannelsVisibilityEdition'}>
      {
        Object.entries(channels)
        .map(([id, {label, status}]) => {
          const handleChange = (newStatus) => {
            const newValue = {
              label,
              status: newStatus
            }
            onChange({
              ...channels,
              [id]: newValue
            })
          } 
          return (
            <li key={id}>
              <span>{label}</span>
              <button
                onClick={() => handleChange(undefined)}
                disabled={status === undefined}
              >
                Visible
              </button>
              <button
                onClick={() => handleChange('anon')}
                disabled={status === 'anon'}
              >
                Anonymisée
              </button>
              <button
                onClick={() => handleChange('hidden')}
                disabled={status === 'hidden'}
              >
                Invisible
              </button>
            </li>
          )
        })
      }
    </ul>
  )
}
function Studio({
}) {
  const [editionMode, setEditionMode] = useState<string>(EDITION_MODES[0]);
  const [timeSelection, setTimeSelection] = useState();
  const [dayspanSelection, setDaySpanSelection] = useState(['07:00', '23:00']);
  const [weekspanSelection, setWeekspanSelection] = useState(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']);
  const [platformsSelection, setPlatformsSelection] = useState(PLATFORMS);
  const [channelsSettings, setChannelSettings] = useState([]);
  const [excludedTitlePatterns, setExcludedTitlePatters] = useState([]);
  return (
    <div className="Studio">
      <div className="ui-container">
        <div className="header">
          <h2>Choisir un type d'édition</h2>
          <select value={editionMode} onChange={e => setEditionMode(e.target.value)}>
            {
              EDITION_MODES.map(mode => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))
            }
          </select>
        </div>
        <div className="body">
            <div className="form-group">
              <h3>
                Dates de début et de fin
              </h3>
              <DatePicker
                value={timeSelection}
                onChange={dates => setTimeSelection(dates.map(formatDatepickerDate))}
                range
                // numberOfMonths={3}
                rangeHover
              />
            </div>
            <div className="form-group">
              <h3>
                Plages horaires de la journée
              </h3>
               <TimePicker 
                label="Début" 
                value={dayspanSelection[0]}
                onValueChanged={(event) => {
                  const val = event.detail.value;
                  const newVal = [val, dayspanSelection[1]].sort();
                  setDaySpanSelection(newVal)
                }}
               />
               <TimePicker 
                label="Fin" 
                value={dayspanSelection[1]}
                onValueChanged={(event) => {
                  const val = event.detail.value;
                  const newVal = [dayspanSelection[0], val].sort();
                  setDaySpanSelection(newVal)
                }}
               />
            </div>
            <div className="form-group">
              <h3>
                Jours de la semaine
              </h3>
              <WeekdayPicker
                multiple={true}
                state={weekspanSelection}
                setState={setWeekspanSelection}
                dayList={['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']}
                displayLength={3}
              />
            </div>
            <div className="form-group">
              <h3>
                Plateformes
              </h3>
              <ul>
                {
                  PLATFORMS.map(platform => {
                    const selected = platformsSelection.includes(platform)
                    const onChange = () => {
                      if (platformsSelection.includes(platform)) {
                        setPlatformsSelection(platformsSelection.filter(p => p !== platform))
                      } else {
                        setPlatformsSelection([...platformsSelection, platform])
                      }
                    }
                    return (
                      <li key={platform} onClick={onChange}>
                        <input type="radio" checked={selected} readOnly />
                        <span>
                          {platform}
                        </span>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
            <div className="form-group">
              <h3>
                Visibilité des chaînes
              </h3>
              <ChannelsVisibilityEdition
                channels={channelsSettings}
                onChange={setChannelSettings}
              />
            </div>
            <div className="form-group">
              <h3>
                Exclure certaines vidéos (par leurs titres)
              </h3>
              <FilterInputsList
                value={excludedTitlePatterns}
                onChange={setExcludedTitlePatters}
              />
            </div>
        </div>
        <div className="footer">
          <ul>
            <li>
              <button>
                Imprimer (A5 / non imposé)
              </button>
            </li>
            <li>
              <button>
                Imprimer (A4 / A5 imposé)
              </button>
            </li>
            <li>
              <button>
                Télécharger au format CSV
              </button>
            </li>
            <li>
              <button>
                Télécharger au format JSON
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="preview-container">

      </div>
    </div>
  )
}

export default Studio;