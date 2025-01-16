import { useMemo, useState } from "react"

import type { ChannelsSettings } from "~types/common"

interface ChannelsVisibilityEditionProps {
  channels: ChannelsSettings
  onChange(c: ChannelsSettings): void
}

function ChannelsVisibilityEdition({
  channels,
  onChange
}: ChannelsVisibilityEditionProps) {
  const [searchstring, setSearchstring] = useState<string>("")
  const visibleChannels = useMemo((): ChannelsSettings => {
    if (searchstring.length > 2 && Object.entries(channels).length) {
      const str = searchstring.toLowerCase()
      return Object.entries(channels)
        .filter(([, { label, platform }]) => {
          const mark = `${label} (${platform})`.toLowerCase()
          return mark.includes(str)
        })
        .reduce(
          (res, [id, obj]): ChannelsSettings => ({ ...res, [id]: obj }),
          {}
        )
    }
    return channels
  }, [searchstring, channels])

  const handleChangeAll = (status) => {
    const newChannels = Object.entries(channels).reduce(
      (cur, [id, obj]: [string, object]) => ({
        ...cur,
        [id]: {
          ...obj,
          status: status
        }
      }),
      {}
    )
    onChange(newChannels)
  }
  const handleShowAll = () => handleChangeAll("visible")
  const handleAnonAll = () => handleChangeAll("anon")
  const handleHideAll = () => handleChangeAll("hidden")
  return (
    <div className={"ChannelsVisibilityEdition"}>
      <div className="header">
        <input
          placeholder="rechercher"
          value={searchstring}
          onChange={(e) => setSearchstring(e.target.value)}
        />
        <button onClick={() => handleShowAll()}>tout montrer</button>
        <button onClick={() => handleAnonAll()}>tout anon.</button>
        <button onClick={() => handleHideAll()}>tout cacher</button>
      </div>
      <ul className="small-cards-container capped">
        {Object.entries(visibleChannels).map(
          ([id, { label, status, platform, ...rest }]) => {
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
              <li
                key={id}
                className={`small-card ${status === "hidden" ? "disabled" : ""}`}>
                <div className="small-card-body">
                  <span>
                    {status === "anon" ? (
                      <s>
                        {label} ({platform})
                      </s>
                    ) : (
                      `${label} (${platform})`
                    )}
                  </span>
                </div>
                <div className="small-card-actions">
                  <button
                    onClick={() => handleChange("visible")}
                    disabled={status === "visible"}
                    className={status === "visible" ? "active" : ""}>
                    Visible
                  </button>
                  <button
                    onClick={() => handleChange("anon")}
                    disabled={status === "anon"}
                    className={status === "anon" ? "active" : ""}>
                    Anonymisée
                  </button>
                  <button
                    onClick={() => handleChange("hidden")}
                    disabled={status === "hidden"}
                    className={status === "hidden" ? "active" : ""}>
                    Invisible
                  </button>
                </div>
              </li>
            )
          }
        )}
      </ul>
    </div>
  )
}

export default ChannelsVisibilityEdition
