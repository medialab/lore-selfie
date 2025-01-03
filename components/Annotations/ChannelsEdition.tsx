import CollapsibleSection from "~components/CollapsibleSection";
import { v4 as generateId } from 'uuid';
import type { Creator } from "~types/annotations";
import { useMemo } from "react";
import CreatorCard from "./CreatorCard";
import ChannelCard from "./ChannelCard";


export default function ChannelsEdition({
  availableChannels,
  creators,
  tags,
  onChange,
  onDeleteItem,
}) {
  const soloChannels = useMemo(() => {
    const attributedChannelsIds = new Set();
    Object.values(creators).forEach(({ channels }) => {
      channels.forEach(channelId => attributedChannelsIds.add(channelId));
    })
    return availableChannels.filter(({ id }) => {
      if (attributedChannelsIds.has(id)) {
        return false;
      }
      return true;
    })
  }, [creators, availableChannels])
  return (
    <section className="ChannelsEdition annotation-form">
      <div className="form-header">
        <h4>À quoi ça sert ?</h4>
        <p>
          À regrouper les chaînes par créatrices et créateurs pour les visualiser ensemble dans les onglets.
        </p>
      </div>
      <div className="form-actions">

      </div>
      <div className="form-list">
        <CollapsibleSection
          title={'Suggestions de groupement à partir des noms des chaînes'}
        >
          <ul className="cards-list"></ul>
        </CollapsibleSection>
        <CollapsibleSection
          title={`Vos créatrices et créateurs de contenus (${Object.keys(creators).length})`}
        >
          <ul className="cards-list">
            {
              Object.values(creators).map(creator => {
                return (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    {...{ tags, availableChannels, soloChannels, creators }}
                    onChange={newCreator => {
                      const newCreators = {
                        ...creators,
                        [newCreator.id]: newCreator
                      }
                      onChange(newCreators);
                    }}
                    onDelete={() => {
                      onDeleteItem(creator.id)
                    }}
                  />
                )
              })
            }
          </ul>
        </CollapsibleSection>
        <CollapsibleSection
          title={`Chaînes non associées (${Object.values(soloChannels).length})`}
        >
          <ul className="cards-list">
          {
              Object.values(soloChannels).map(channel => {
                return (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    creators={creators}
                    onSelect={creatorId => {
                      const newCreators = {
                        ...creators,
                        [creatorId]: {
                          ...creators[creatorId],
                          channels: [...creators[creatorId].channels, channel.id]
                        }
                      }
                      onChange(newCreators);
                    }}
                    onCreateEponym={() => {
                      const newCreator: Creator = {
                        id: generateId(),
                        name: channel.channelName,
                        channels: [channel.id],
                        description: '',
                        links: {
                          tags: []
                        }
                      }
                      const newCreators = {
                        ...creators,
                        [newCreator.id]: newCreator
                      }
                      onChange(newCreators);
                    }}
                  />
                )
              })
            }
          </ul>
        </CollapsibleSection>
      </div>
      <div className="form-footer">
        <button
          onClick={() => {
            const name = prompt('Quelle est le nom de la créatrice ou du créateur que vous voulez ajouter (note : vous pourrez la modifier ensuite) ?');
            if (name.length) {
              const newCreator: Creator = {
                id: generateId(),
                name,
                channels: [],
                description: '',
                links: {
                  tags: []
                }
              }
              const newCreators = {
                ...creators,
                [newCreator.id]: newCreator
              }
              onChange(newCreators);
            }
          }}
        >
          Ajouter une créatrice ou un créateur
        </button>
      </div>
    </section>
  )
}