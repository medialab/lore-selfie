import { useState, useEffect, useMemo } from 'react';
import { v4 as generateId } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';
import TagChip from './TagChip';

export default function CreatorCard({
  creator,
  availableChannels,
  soloChannels,
  tags,
  // creators,
  onChange,
  onDelete
}) {
  const [isEdited, setIsEdited] = useState();
  const [tempCreator, setTempCreator] = useState(creator);

  useEffect(() => {
    setTempCreator(creator);
  }, [creator]);


  const availableChannelsMap = useMemo(() => {
    return availableChannels.reduce((res, channel) => ({ ...res, [channel.id]: channel }), {})
  }, [availableChannels])
  const tagsOptions = useMemo(() => {
    return Object.values(tags).map(({ id, name }) => ({
      label: name,
      value: id,
    }))
  }, [tags]);

  const channelsOptions = useMemo(() => {
    return Object.values(soloChannels).map(({ id, channelName, channelId, platform }) => ({
      label: `${channelName  || channelId} (${platform})`,
      value: id,
    }))
  }, [soloChannels]);

  const { id, description, name, channels = [], links = {} } = useMemo(() => tempCreator, [tempCreator]);
  const {
    tags: linkedTagsIds = [],
    // creators: linkedCreatorsIds = [],
  } = links;

  return (
    <li className="TagCard card">
      <div className="card-content">
        <div className="card-body">
          {
            isEdited ?
              <>
                <h2>Vous éditez la fiche de {name}</h2>
                <form
                  className="form-subgroup"
                  onSubmit={e => {
                    e.preventDefault();
                    setIsEdited(false);
                    onChange(tempCreator);
                  }}>
                  <div className="input-group">
                    <h4>Nom de la créatrice ou du créateur</h4>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={tempCreator.name}
                      onChange={e => setTempCreator({ ...tempCreator, name: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <h4>Description</h4>
                    <TextareaAutosize
                      placeholder="Votre description de la chaîne"
                      value={tempCreator.description}
                      onChange={e => setTempCreator({ ...tempCreator, description: e.target.value })}
                    />
                  </div>
                </form>
                <div className="form-subgroup">
                  <h4>Chaînes associées</h4>
                  <Select
                    value={channels
                      .filter(channelId => availableChannelsMap[channelId])
                      .map(channelId => {
                        const chan = availableChannelsMap[channelId];
                        return {
                          value: channelId,
                          label: `${chan.channelName} (${chan.platform})`
                        }
                      })}
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      const newCreator = {
                        ...tempCreator,
                        channels: itemsIds,
                        links: {
                          ...tempCreator.links,
                        }
                      }
                      setTempCreator(newCreator);
                    }}
                    options={channelsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des créateurs et créatrices enregistrées'}
                    isMulti
                  />
                </div>
                <div className="form-subgroup">
                  <h4>Étiquettes associées</h4>
                  <Select
                    value={
                      linkedTagsIds
                      .map(tagId => ({
                        value: tagId,
                        label: tags[tagId]?.name,
                      }))
                    }
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      const newCreator = {
                        ...tempCreator,
                        links: {
                          ...tempCreator.links,
                          tags: itemsIds
                        }
                      }
                      setTempCreator(newCreator);
                    }}
                    options={tagsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des étiquettes que vous avez déjà créées'}
                    isMulti
                  />
                </div>
                
              </>
              :
              <div className="card-readonly-content" onClick={() => setIsEdited(true)}>
                <h4>{name}</h4>
                <div className="description">
                  {(description || '').split('\n').map((t, index) => <p key={index}>{t}</p>)}
                </div>

                {
                  channels.length ?
                    <div>
                        Chaînes : <span>
                          {
                            channels
                              .filter(channelId => availableChannelsMap[channelId])
                              .map(channelId => {
                                const chan = availableChannelsMap[channelId];
                                return `${chan.channelName} (${chan.platform})`
                              })
                              .join(', ')
                          }
                        </span>
                    </div>
                    : null
                }
                {
                  linkedTagsIds.length ?
                    <div>
                        Étiquettes associées : <span>
                          {
                            linkedTagsIds
                            .map(id => <TagChip key={id} tag={tags[id]} />)
                            
                            // .map(id => tags[id]?.name).join(', ')
                          }
                        </span>
                    </div>
                    : null
                }

              </div>
          }
        </div>
        <div className="card-actions">
          <button onClick={() => {
            if (!isEdited) {
              setIsEdited(true);
            } else {
              onChange(tempCreator);
              setIsEdited(false)
            }
          }}>
            {isEdited ? 'Sauvegarder' : 'Éditer'}
          </button>
          <button onClick={() => { onDelete() }}>
            Supprimer
          </button>
        </div>
      </div>
    </li>
  )
}
