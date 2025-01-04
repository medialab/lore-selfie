import { useState, useEffect, useMemo } from 'react';
import { v4 as generateId } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';

export default function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}) {
  const {type, title, items} = suggestion;
  return (
    <li className="SuggestionCard card">
      <div className="card-content">
        <div className="card-body">
          {
            type === 'addition' ?
            <p><strong>Ajouter</strong> la chaîne <strong>{items[1].title} ({items[1].platform})</strong> à l'entrée <strong>{items[0].name}</strong></p>
            :
            <div>
            <p>
              <strong>Créer</strong> l'entrée <strong>{title}</strong> avec les chaînes suivantes
            </p>
            <ul>
              {
                items.map(item => (
                  <li key={item.id}>
                    <strong>{item.title} ({item.platform})</strong>
                  </li>
                ))
              }
            </ul>
            </div>
          }
        </div>
        <div className="card-actions">
          <button onClick={onAccept}>
            Accepter
          </button>
          <button onClick={onDismiss}>
            Refuser
          </button>
        </div>
      </div>
    </li>
  )
}
