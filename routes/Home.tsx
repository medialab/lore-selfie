import Daily from "~components/Daily";
import { Link, useParams } from "react-router-dom";
import Measure from 'react-measure';
import { useMemo, useState } from "react";

function Home() {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const { tab } = useParams();
  const tabs = {
    daily: {
      label: 'Au jour le jour'
    },
    habits: {
      label: 'Mes habitudes'
    },
    history: {
      label: 'Mon historique'
    }
  };
  const activeTab = useMemo(() => tab in tabs ? tab : Object.keys(tabs)[0], [tab]);
  return (
    <div className="contents-wrapper Home">
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="contents width-limited-contents">
            <div className="tabs-container">
              <ul>
                {
                  Object.entries(tabs).map(([id, { label }]) => {
                    return (
                      <li className={`tab ${activeTab === id ? 'active' : ''}`} key={id}>
                        <h2>
                          <Link to={`/${id}`}>
                            {label}
                          </Link>
                        </h2>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
            <div className="tab-content">
              {
                activeTab === 'daily' ?
                <Daily />
                : null
              }
            </div>
          </div>
        )}
      </Measure>
    </div>
  )
}
export default Home;