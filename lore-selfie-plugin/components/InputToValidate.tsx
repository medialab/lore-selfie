import {useState, useEffect} from 'react';


const InputToValidate = ({
  value,
  onChange,
  onRemove,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isEdited, setIsEdited] = useState(true);

  useEffect(() => {
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

export default InputToValidate;