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
    <div className={`InputToValidate ${!currentValue || !currentValue.length ? 'is-empty' : ''}`}>
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
              ref={inputRef}
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

export default InputToValidate;