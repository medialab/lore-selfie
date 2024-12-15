import { useMemo, useState } from "react";

function ChannelsVisibilityEdition({
  channels,
  onChange
}) {
  const [searchString, setSearchString] = useState('');
  const visibleChannels = useMemo(() => {
    if (searchString.length > 2 && Object.entries(channels).length) {
      const str = searchString.toLowerCase();
      return Object.entries(channels).filter(([id, {label, platform}]) => {
        const mark = `${label} (${platform})`.toLowerCase();
        return mark.includes(str);
      })
      .reduce((res, [id, obj]) => ({...res, [id]: obj}), {})
    }
    return channels;
  }, [searchString, channels])
  return (
    <div className={'ChannelsVisibilityEdition'}>
      <div>
        <input
          placeholder="rechercher"
          value={searchString}
          onChange={e => setSearchString(e.target.value)}
        />
      </div>
      <ul >
        {
          Object.entries(visibleChannels)
            .map(([id, { label, status, platform, ...rest }]) => {
              const handleChange = (newStatus) => {
                const newValue = {
                  label,
                  status: newStatus,
                  platform,
                  ...rest
                }
                onChange({
                  ...channels,
                  [id]: newValue
                })
              }
              return (
                <li key={id}>
                  <span>{label} ({platform})</span>
                  <button
                    onClick={() => handleChange('visible')}
                    disabled={status === 'visible'}
                  >
                    Visible
                  </button>
                  <button
                    onClick={() => handleChange('anon')}
                    disabled={status === 'anon'}
                  >
                    Anonymisée
                  </button>
                  <button
                    onClick={() => handleChange('hidden')}
                    disabled={status === 'hidden'}
                  >
                    Invisible
                  </button>
                </li>
              )
            })
        }
      </ul>
    </div>
  )
}

export default ChannelsVisibilityEdition;