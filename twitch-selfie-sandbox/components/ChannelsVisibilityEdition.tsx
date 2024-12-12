function ChannelsVisibilityEdition({
  channels,
  onChange
}) {
  return (
    <ul className={'ChannelsVisibilityEdition'}>
      {
        Object.entries(channels)
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
  )
}

export default ChannelsVisibilityEdition;