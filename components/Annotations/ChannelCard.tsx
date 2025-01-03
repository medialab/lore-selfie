import { useState, useEffect, useMemo } from 'react';
import { v4 as generateId } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';

export default function ChannelCard({
  channel,
  creators,
  onSelect,
  onCreateEponym
}) {
  const creatorsOptions = useMemo(() => {
    return Object.values(creators)
    .map(creator => ({
      value: creator.id,
      label: `${creator.name}`
    }))
  }, [creators])
  return (
    <li className="TagCard card">
      <div className="card-content">
        <div className="card-body">
          <h3>{channel.channelName} ({channel.platform}) </h3>
        </div>
        <div className="card-actions">
          <p>Attribuer à la chaîne</p>
          <Select
            onChange={({value}) => {
              onSelect(value)
            }}
            options={creatorsOptions}
            noOptionsMessage={() => 'Rien à afficher'}
            placeholder={'Sélectionner ou rechercher une créatrice ou un créateur existant'}
          />
          <button onClick={onCreateEponym}>
            Créer une entrée créatrice/créateur avec le nom de cette chaîne
          </button>
        </div>
      </div>
    </li>
  )
}
