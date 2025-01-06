import { useState, useEffect, useMemo } from 'react';
import { v4 as generateId } from 'uuid';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';
import TagChip from './TagChip';
export default function ExpressionCard({
  expression,
  tags,
  creators,
  onChange,
  onDelete
}) {
  const [isEdited, setIsEdited] = useState();
  const [tempExpression, setTempExpression] = useState(expression);
  const [tempQuery, setTempQuery] = useState('');

  useEffect(() => {
    setTempExpression(expression);
    setTempQuery('');
  }, [expression]);

  const tagsOptions = useMemo(() => {
    return Object.values(tags).map(({ id, name }) => ({
      label: name,
      value: id,
    }))
  }, [tags]);
  // @todo put upstream
  const creatorsOptions = useMemo(() => {
    return Object.values(creators).map(({ id, name }) => ({
      label: name,
      value: id,
    }))
  }, [creators]);

  const { id, definition, name, queries = [], links = {} } = tempExpression;
  const {
    tags: linkedTagsIds = [],
    creators: linkedCreatorsIds = [],
  } = links;

  const handleCreateQuery = () => {
    if (tempQuery.length) {
      const newQueries = [...queries, { id: generateId(), query: tempQuery }];
      const newExpression = {
        ...tempExpression,
        queries: newQueries
      }
      onChange(newExpression)
    }
  }
  return (
    <li className="TagCard card">
      <div className="card-content">
        <div className="card-body">
          {
            isEdited ?
              <>
                <h2>Vous éditez l'expression {name}</h2>
                <form
                  className="form-subgroup"
                  onSubmit={e => {
                    e.preventDefault();
                    setIsEdited(false);
                    onChange(tempExpression);
                  }}>
                  <div className="input-group">
                    <h4>Nom de l'expression</h4>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={tempExpression.name}
                      onChange={e => setTempExpression({ ...tempExpression, name: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <h4>Définition</h4>
                    <TextareaAutosize
                      placeholder="Définition"
                      value={tempExpression.definition}
                      onChange={e => setTempExpression({ ...tempExpression, definition: e.target.value })}
                    />
                  </div>
                </form>
                <div className="form-subgroup">
                  <h4>Variantes (exemples : au pluriel, écrit différemment, etc.)</h4>
                  <ul>
                    {
                      queries.map(({ id, query }, index) => {
                        const handleBlurOrSubmit = () => {
                          if (query?.trim().length) {
                            const newQueries = queries.map(q => {
                              if (q.id === id) {
                                return {
                                  ...q,
                                  query: q.query.trim()
                                }
                              }
                              return q;
                            });
                            const newExpression = { ...tempExpression, queries: newQueries };
                            setTempExpression(newExpression);
                          } else if (queries.length > 1) {
                            const newQueries = queries.filter(q => q.id !== id);
                            const newExpression = { ...tempExpression, queries: newQueries };
                            setTempExpression(newExpression);
                          } else {
                            const newQueries = [...queries];
                            const prevValue = expression.queries.find(q => q.id === id)?.query;
                            newQueries[index].query = prevValue;
                            setTempExpression({ ...tempExpression, queries: newQueries })

                          }
                        }
                        const handleTextChange = value => {
                          const newQueries = [...queries];
                          newQueries[index].query = value;
                          setTempExpression({ ...tempExpression, queries: newQueries })
                        }
                        return (
                          <li key={id}>
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                handleBlurOrSubmit();
                              }}
                            >
                              <input value={query}
                                onChange={e => handleTextChange(e.target.value)}
                                placeholder="ajouter une variante"
                                onBlur={() => {
                                  handleBlurOrSubmit();
                                }}
                              />
                            </form>
                          </li>
                        )
                      })
                    }
                    <li>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          handleCreateQuery();
                        }}
                      >
                        <input value={tempQuery}
                          onChange={e => setTempQuery(e.target.value)}
                          placeholder="ajouter une variante"
                          onBlur={() => {
                            handleCreateQuery();
                          }}
                        />
                      </form>
                    </li>
                  </ul>
                </div>
                <div className="form-subgroup">
                  <h4>Étiquettes associées</h4>
                  <Select
                    value={linkedTagsIds.map(tagId => ({
                      value: tagId,
                      label: tags[tagId]?.name,
                    }))}
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      const newExpression = {
                        ...tempExpression,
                        links: {
                          ...tempExpression.links,
                          tags: itemsIds
                        }
                      }
                      setTempExpression(newExpression);
                    }}
                    options={tagsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des étiquettes que vous avez déjà créées'}
                    isMulti
                  />
                </div>
                <div className="form-subgroup">
                  <h4>Producteurs de contenus associées</h4>
                  <Select
                    value={linkedCreatorsIds.map(creatorId => ({
                      value: creatorId,
                      label: creators[creatorId]?.name,
                    }))}
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      const newExpression = {
                        ...tempExpression,
                        links: {
                          ...tempExpression.links,
                          creators: itemsIds
                        }
                      }
                      setTempExpression(newExpression);
                    }}
                    options={creatorsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des créateurs et créatrices enregistrées'}
                    isMulti
                  />
                </div>
              </>
              :
              <div className="card-readonly-content" onClick={() => setIsEdited(true)}>
                <h4>{name}</h4>
                <div className="definition">
                  <h5>Définition</h5>
                  {(definition || '').split('\n').map((t, index) => <p key={index}>{t}</p>)}
                </div>
                <div>
                    <span>Variantes cherchées dans les contenus :</span>
                    <span>{queries.map(q => '"' + q.query.trim() + '"').join(', ')}</span>
                </div>
                {
                  linkedTagsIds.length ?
                    <div>
                        Étiquettes associées : <span>
                          {
                            linkedTagsIds
                            .map(id => <TagChip key={id} tag={tags[id]} />)
                            // .map(id => tags[id]?.name)
                            // .join(', ')
                          }
                        </span>
                    </div>
                    : null
                }

                {
                  linkedCreatorsIds.length ?
                    <div>
                      <i>
                        Producteurs de contenus associés : <span>
                          {
                            linkedCreatorsIds.map(id => tags[id]?.name).join(', ')
                          }
                        </span>
                      </i>
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
              onChange(tempExpression);
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
