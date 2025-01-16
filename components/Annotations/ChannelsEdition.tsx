import CollapsibleSection from "~components/CollapsibleSection";
import { v4 as generateId } from 'uuid';
import type { Annotations, Creator, Tag } from "~types/annotations";
import { useMemo, useState } from "react";
import CreatorCard from "./CreatorCard";
import ChannelCard from "./ChannelCard";
import levenshtein from 'talisman/metrics/levenshtein'
import SuggestionCard from "./SuggestionCard";
import type { ActionSuggestion, AvailableChannels } from "~types/common";

interface ChannelsEditionProps {
  availableChannels: AvailableChannels
  creators: {
    [key: string]: Creator
  }
  tags: {
    [key: string]: Tag
  }
  onChange: Function
  onDeleteItem: Function
}



export default function ChannelsEdition({
  availableChannels,
  creators,
  tags,
  onChange,
  onDeleteItem,
}: ChannelsEditionProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [creatorSearchTerm, setCreatorSearchTerm] = useState<string>('');
  const [channelSearchTerm, setChannelSearchTerm] = useState<string>('');
  const soloChannels: AvailableChannels = useMemo(() => {
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
  }, [creators, availableChannels]);

  const tokenize = useMemo(() : Function => (term: string) : string => term.replace(/\W+/g, '').toLowerCase(), []);

  const suggestions: Array<ActionSuggestion> = useMemo(() => {
    const isAcceptableMatch = (term1, term2) => {
      const lev = levenshtein(term1, term2);
      return lev <= 1 || term1.includes(term2) || term2.includes(term1);
    }
    const tokenizedChannels = soloChannels.map(channel => {
      const title = channel.channelName || channel.channelId;
      const token = tokenize(title);
      return { ...channel, title, token }
    })
    const sugg = [];
    // 1. check for channels to add to existing creators
    Object.values(creators).forEach((creator: Creator) => {
      const tokenizedName = tokenize(creator.name);
      tokenizedChannels.forEach(chan => {
        if (isAcceptableMatch(tokenizedName, chan.token)) {
          sugg.push({
            type: 'addition',
            id: `add-${tokenizedName}-${chan.token}`,
            items: [creator, chan]
          })
        }
      })
    })
    for (let i = 0; i < tokenizedChannels.length; i++) {
      const channel1 = tokenizedChannels[i];
      const matches = [];
      for (let j = i + 1; j < tokenizedChannels.length; j++) {
        const channel2 = tokenizedChannels[j];
        if (isAcceptableMatch(channel1.token, channel2.token)) {
          matches.push(channel2)
        }
      }
      if (matches.length) {
        sugg.push({
          type: 'creation',
          id: `bind-${[channel1, ...matches].map(c => c.token).join('-')}`,
          title: channel1.title,
          items: [channel1, ...matches]
        })
      }
    }
    return sugg;
  }, [soloChannels, tokenize, creators]);
  const visibleSuggestions: Array<ActionSuggestion> = useMemo(() => {
    return suggestions
      .filter(s => !dismissedSuggestions.has(s.id))
  }, [suggestions, dismissedSuggestions]);

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
          title={`Suggestions de groupement à partir des noms des chaînes et d'entrées (${visibleSuggestions.length})`}
          disabled={!visibleSuggestions.length}
        >
          <>
            {visibleSuggestions.length ? <div className="ui-row">
              <button
                className="important-button"
                onClick={() => {
                  const newCreators = visibleSuggestions.reduce((tempCreators, suggestion) => {
                    const { type, items, title } = suggestion;
                    if (type === 'addition') {
                      const [{ id: creatorId }, { id: newChannelId }] = items;
                      const newCreators = {
                        ...tempCreators,
                        [creatorId]: {
                          ...tempCreators[creatorId],
                          channels: [...tempCreators[creatorId].channels, newChannelId]
                        }
                      }
                      return newCreators;
                    } else if (type === 'creation') {
                      const newCreator: Creator = {
                        id: generateId(),
                        name: title,
                        channels: items.map(item => item.id),
                        description: '',
                        links: {
                          tags: []
                        }
                      }
                      const newCreators = {
                        ...tempCreators,
                        [newCreator.id]: newCreator
                      }
                      return newCreators;
                    }
                  }, creators);
                  onChange(newCreators);
                }}
              >Accepter toutes les suggestions</button>
              <button
                className="important-button"
                onClick={() => {
                  const newDismissed = new Set(Array.from(dismissedSuggestions));
                  visibleSuggestions.forEach(suggestion => newDismissed.add(suggestion.id));
                  setDismissedSuggestions(newDismissed);
                }}
              >Refuser toutes les suggestions</button>
            </div>
              : null}
            <ul className="cards-list">
              {
                visibleSuggestions
                  .map(suggestion => {
                    const handleAccept = () => {
                      const { type, items, title } = suggestion;
                      if (type === 'addition') {
                        const [{ id: creatorId }, { id: newChannelId }] = items;
                        const newCreators = {
                          ...creators,
                          [creatorId]: {
                            ...creators[creatorId],
                            channels: [...creators[creatorId].channels, newChannelId]
                          }
                        }
                        onChange(newCreators);
                      } else if (type === 'creation') {
                        const newCreator: Creator = {
                          id: generateId(),
                          name: title,
                          channels: items.map(item => item.id),
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
                    }
                    const handleDismiss = () => {
                      const newDismissed = new Set(Array.from(dismissedSuggestions));
                      newDismissed.add(suggestion.id);
                      setDismissedSuggestions(newDismissed);
                    }
                    return (
                      <SuggestionCard
                        suggestion={suggestion}
                        onAccept={handleAccept}
                        onDismiss={handleDismiss}
                        key={suggestion.id}
                      />
                    )
                  })
              }
            </ul>
          </>
        </CollapsibleSection>
        <CollapsibleSection
          title={`Vos créatrices et créateurs de contenus existants (${Object.keys(creators).length})`}
          disabled={!Object.values(creators).length}
        >
          <>
          <div className="ui-row">
            <input
              placeholder="Rechercher une entrée existante"
              value={creatorSearchTerm}
              onChange={e => setCreatorSearchTerm(e.target.value)}
            />
            </div>
            <ul className="cards-list">
              {
                Object.values(creators)
                  .filter(c => creatorSearchTerm.length > 2 ? c.name.toLowerCase().includes(creatorSearchTerm.toLowerCase()) : true)
                  .sort((c1, c2) => {
                    if (c1.name.toLowerCase() > c2.name.toLowerCase()) {
                      return 1;
                    }
                    return -1;
                  })
                  .map(creator => {
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
          </>
        </CollapsibleSection>
        <CollapsibleSection
          title={`Chaînes non associées (${Object.values(soloChannels).length})`}
          disabled={!Object.values(soloChannels).length}
        >
          <>
            
            {Object.values(soloChannels).length ? <div className="ui-row">
              <input
              placeholder="Rechercher une chaîne"
              value={channelSearchTerm}
              onChange={e => setChannelSearchTerm(e.target.value)}
            />
              <button
                className="important-button"
                onClick={() => {
                  const newCreators = Object.values(soloChannels)
                    .reduce((tempCreators, channel) => {
                      const newCreator: Creator = {
                        id: generateId(),
                        name: channel.channelName || channel.channelId,
                        channels: [channel.id],
                        description: '',
                        links: {
                          tags: []
                        }
                      }
                      const newCreators = {
                        ...tempCreators,
                        [newCreator.id]: newCreator
                      }
                      return newCreators;
                    }, creators)
                  onChange(newCreators);
                }}
              >Associer automatiquement toutes ces chaînes</button>
            </div>
              : null}
            <ul className="cards-list">
              {
                Object.values(soloChannels)
                  .filter(c => channelSearchTerm.length > 2 ? (c.channelName || c.channelId).toLowerCase().includes(channelSearchTerm.toLowerCase()) : true)
                  .map(channel => {
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
                            name: channel.channelName || channel.channelId,
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
          </>
        </CollapsibleSection>
      </div>
      <div className="form-footer">
        <button
          className="important-button"
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