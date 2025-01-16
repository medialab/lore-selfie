

import type { Handle } from "~types/settings";
import {useState, useEffect} from 'react';
import { PLATFORMS } from "~constants";


interface HandleEditorProps {
  handle: Handle,
  onChange: ((h: Handle) => void)
  onDelete: (() => void)
}
function HandleEditor({
  handle: inputHandle,
  onChange,
  onDelete,
}: HandleEditorProps) {
  const [handle, setHandle] = useState<Handle>(inputHandle);
  useEffect(() => {
    setHandle(inputHandle);
  }, [inputHandle]);

  const {
    platform,
    // internalId,
    id,
    alias
  } = handle;

  return (
    <li className="Handle card">
      <form className="card-content" onSubmit={(e) => {
        e.preventDefault();
        onChange(handle);
      }}>
        <div className="card-body fields">
          <div className="input-group">
            <h5>Identifiant sur la plateforme (utilisé pour repérer vos commentaires et messages de chat)</h5>
            <div className="input-container">
            <input placeholder="identifiant" type="text" id="id" value={id} onChange={e => setHandle({ ...handle, id: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <h5>Alias pour les visualisations du plugin (optionnel)</h5>
            <div className="input-container">
            <input placeholder="alias" type="text" id="alias" value={alias} onChange={e => setHandle({ ...handle, alias: e.target.value })} />
            </div>
          </div>
          <div className="input-group">
            <h5>Plateforme</h5>
            <div className="input-container">
            <select value={platform} onChange={p => setHandle({ ...handle, platform: p.target.value })}>

              {
                PLATFORMS.map(p => {
                  return (
                    <option key={p} value={p}>{p}</option>
                  )
                })
              }
            </select>
            </div>
          </div>
        </div>
        <div className="card-actions">
        <button className="important-button" disabled={JSON.stringify(inputHandle) === JSON.stringify(handle)} role="submit">
            Valider
          </button>
          <button onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}>
            Supprimer
          </button>
          
        </div>


      </form>
    </li>
  )
}

export default HandleEditor;