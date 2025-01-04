import {useState, useEffect} from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function TagCard({
  tag,
  onChange,
  onDelete
}) {
  const [isEdited, setIsEdited] = useState();
  const [tempTag, setTempTag] = useState(tag);

  useEffect(() => {
    setTempTag(tag);
  }, [tag]);

  const { id, color, description, name } = tag;
  return (
    <li className="TagCard card">
      <div className="card-content">
      <div className="card-body">
        {
          isEdited ?
            <form onSubmit={e => {
              e.preventDefault();
              setIsEdited(false);
              onChange(tempTag);
            }}>
              <div className="input-group">
                <label>Nom</label>
                <input
                  type="text"
                  placeholder="Nom"
                  value={tempTag.name}
                  onChange={e => setTempTag({ ...tempTag, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <div className="color-marker" style={{ color }} />
                <label>Couleur</label>
                <input
                  type="text"
                  placeholder="Couleur"
                  value={tempTag.color}
                  onChange={e => setTempTag({ ...tempTag, color: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <TextareaAutosize
                  type="text"
                  placeholder="Description"
                  value={tempTag.description}
                  onChange={e => setTempTag({ ...tempTag, description: e.target.value })}
                />
              </div>
            </form>
            :
            <div className="card-readonly-content" onClick={() => setIsEdited(true)}>
              <h4>
                <span className="color-marker" style={{ background: color }} />
                <span>{name}</span>
                </h4>
              <div className="description">
                {description.split('\n').map((t, index) => <p key={index}>{t}</p>)}
              </div>
            </div>
        }
      </div>
      <div className="card-actions">
        <button onClick={() => {
          if (!isEdited) {
            setIsEdited(true);
          } else {
            onChange(tempTag);
            setIsEdited(false)
          }
        }}>
          {isEdited ? 'Sauvegarder' : 'Éditer'}
        </button>
        <button onClick={() => { onDelete() }}>
          Supprimer
        </button>
      </div>
      </div>
    </li>
  )
}
