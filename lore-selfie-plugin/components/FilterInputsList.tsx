import InputToValidate from "./InputToValidate";

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

export default FilterInputsList;