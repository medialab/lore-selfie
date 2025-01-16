import InputToValidate from "./InputToValidate"

interface FilterInputsListProps {
  value: Array<string>
  onChange: Function
  messages: {
    [key: string]: string
  }
}
const FilterInputsList = ({
  value = [],
  onChange,
  messages: { newItem: newItemMessage }
}: FilterInputsListProps) => {
  return (
    <ul className="FilterInputsList small-cards-container capped">
      {value.map((exp, index) => {
        const handleRemove = () => {
          const newValue = [...value]
          newValue.splice(index, 1)
          onChange(newValue)
        }
        const handleChange = (val) => {
          if (!val.length) {
            return handleRemove()
          }
          const newValue = [...value]
          newValue[index] = val
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
      })}
      <li className="small-card">
        <button
          onClick={() => {
            const newValue = [...value, ""]
            onChange(newValue)
          }}>
          {newItemMessage}
        </button>
      </li>
    </ul>
  )
}

export default FilterInputsList
