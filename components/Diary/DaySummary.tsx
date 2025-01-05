

export default function DaySummary({
  width,
  height,
  channelsMap,
  rowsCount,
}) {
  let size = 'normal';
  if (rowsCount > 30) {
    size = 'very-dense';
  }
  else if (rowsCount > 15) {
    size = 'dense';
  }
  return (
    <div className={`DaySummary size-${size}`}>
      <div className="contents-list-container">
        {
          Array.from(channelsMap.entries())
          .map(([channel, contents]) => {
            return (
              <div
                key={channel}
                className="channel"
              >
                <h4 className="channel-title">{channel}</h4>
                <ul className="contents-list">
                  {
                    Array.from(contents.values())
                    .map(({
                      url,
                      title,
                      channel,
                      platform,
                      index,
                    }) => {
                      return (
                        <li key={url} className="contents-item">
                          <a 
                          target="blank"
                            href={url}
                          >
                            <div className="platform-marker-container">
                              <div className={`platform-marker ${platform}`}>
                                <span>{index}</span>
                              </div>
                            </div>
                            <div className="metadata-container">
                              <h3 className={'title'}>{title}</h3>
                              {/* <h4 className="channel">{channel ? `${channel} - ${platform}` : platform}</h4> */}
                            </div>
                          </a>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            )
          })
        }
      </div>
      <div className="notes-container">
        {/* <h3>Notes</h3> */}
        <div className="notes-content">

        </div>
      </div>
    </div>
  )
}