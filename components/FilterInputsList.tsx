import InputToValidate from "./InputToValidate";

const FilterInputsList = ({
  value = [],
  onChange
}) => {
  return (
    <ul className="FilterInputsList small-cards-container capped">
      {
        value.map((exp, index) => {
         
          const handleRemove = () => {
            const newValue = [...value];
            newValue.splice(index, 1);
            onChange(newValue)
          }
          const handleChange = val => {
            if (!val.length) {
              return handleRemove();
            }
            const newValue = [...value];
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
        })
      }
      <li className="small-card">
        <button onClick={() => {
          const newValue = [
            ...value,
            ''
          ]
          onChange(newValue);

        }}>
          Ajouter un titre (ou morceau de titre) à exclure
        </button>
      </li>
    </ul>
  )
}

export default FilterInputsList;