import { PLATFORMS } from "~constants";
import HandleEditor from "./HandleEditor";
import {v4 as generateId} from 'uuid';

function HandlesManager({
  handles = [],
  onChange
}) {
  const handleCreate = () => {
    const newHandle = {
      platform: PLATFORMS[0],
      id: '',
      internalId: generateId(),
      alias: ''
    }
    const newHandles = [...handles, newHandle];
    onChange(newHandles);
  }
  return (
    <ul className="HandlesManager cards-list">
      {
        handles.map((handle) => {
          const handleChange = (newHandle) => {
            const newHandles = handles.map(h => {
              if (h.internalId === handle.internalId) {
                return newHandle;
              }
              return h;
            });
            onChange(newHandles);
          }
          const handleDelete = () => {
            const newHandles = handles.filter(h => {
              return h.internalId !== handle.internalId;
            });
            onChange(newHandles);
          }
          return (
            <HandleEditor onDelete={handleDelete} handle={handle} onChange={handleChange} key={handle.internalId} />
          )
        })
      }
      <li>
        <button className="important-button" onClick={handleCreate}>
          Ajouter
        </button>
      </li>
    </ul>
  )
}

export default HandlesManager;