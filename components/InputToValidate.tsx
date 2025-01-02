import {useState, useEffect, useRef} from 'react';


const InputToValidate = ({
  value,
  onChange,
  onRemove,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEdited, setIsEdited] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    setCurrentValue(value);
    if (!value) {
      setIsEdited(true);
      setTimeout(() => inputRef.current.focus())
    }
  }, [value]);
  return (
    <div className={`InputToValidate small-card ${!currentValue || !currentValue.length ? 'is-empty' : ''}`}>
      <div className="small-card-body">
      {
        !isEdited ?
          <span className="value-placeholder"
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
              ref={inputRef}
            />
            <button role="submit">
              S
            </button>
          </form>
      }
      </div>
      <div className="small-card-actions">
      <button
        onClick={() => onRemove()}
      >
        ⛌
      </button>
      </div>
    </div>
  )
}

export default InputToValidate;