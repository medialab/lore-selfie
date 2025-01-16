import { useMemo } from 'react';
import Select from 'react-select';
import type { AvailableChannel } from '~types/common';
import type { Creator } from '~types/annotations';

interface CreatorsMap {
  [key: string]: Creator
}
interface ChannelCardProps {
  channel: AvailableChannel,
  creators: CreatorsMap,
  onSelect: Function
  onCreateEponym: Function
}
export default function ChannelCard({
  channel,
  creators,
  onSelect,
  onCreateEponym
}: ChannelCardProps) {
  interface CreatorOption {
    value: string
    label: string
  }
  const creatorsOptions: Array<CreatorOption> = useMemo(() => {
    return Object.values(creators)
    .map(creator => ({
      value: creator.id,
      label: `${creator.name}`
    }))
  }, [creators]);

  return (
    <li className="TagCard card">
      <div className="card-content">
        <div className="card-body">
          <h3>{channel.channelName || channel.channelId} ({channel.platform}) </h3>
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
          <button onClick={() => onCreateEponym()}>
            Créer une entrée créatrice/créateur avec le nom de cette chaîne
          </button>
        </div>
      </div>
    </li>
  )
}
