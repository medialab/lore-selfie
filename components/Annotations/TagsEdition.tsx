import TagCard from "./TagCard";
import {v4 as generateId} from 'uuid';

export default function TagsEdition({
  tags,
  onChange,
  onDeleteItem
}) {
  return (
    <section className="TagsEdition annotation-form">
      <div className="form-header">
        <h4>À quoi ça sert ?</h4>
        <p>
          À regrouper les producteurs de contenu et les expressions selon l'usage que vous faites de votre selfie (exemples d'étiquette : "Information", "Politique", "Plaisirs coupables", "Mes streamers préférés").
        </p>
      </div>
      <div className="form-actions">

      </div>
      <div className="form-list">
        {
          Object.values(tags).length ?
            <ul className="cards-list">
              {
                Object.values(tags).map(tag => {
                  return (
                    <TagCard
                      key={tag.id}
                      tag={tag}
                      onChange={newTag => {
                        const newTags = {
                          ...tags,
                          [newTag.id]: newTag
                        }
                        onChange(newTags);
                      }}
                      onDelete={() => {
                        onDeleteItem(tag.id)
                        // const newTags = Object.entries(tags)
                        //   .filter(([id]) => id !== tag.id)
                        //   .reduce((res, [key, val]) => ({ ...res, [key]: val }), {});
                        // onChange(newTags);
                      }}
                    />
                  )
                })
              }
            </ul>
            : <div>{`Pas d'étiquettes à afficher`}</div>
        }
      </div>
      <div className="form-footer">
        <button
          className="important-button"
          onClick={() => {
            const name = prompt('Quel nom donner à l\'étiquette ?');
            if (name.length) {
              const red = Math.round(Math.random() * 255);
              const green = Math.round(Math.random() * 255);
              const blue = Math.round(Math.random() * 255);
              const newTag = {
                id: generateId(),
                color: `rgb(${red}, ${green}, ${blue})`,
                name,
                description: '',
              }
              const newTags = {
                ...tags,
                [newTag.id]: newTag
              }
              onChange(newTags);
            }
          }}
        >
          Nouvelle étiquette
        </button>
      </div>
    </section>
  )
}