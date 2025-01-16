import { useState, useEffect, useMemo } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Select from 'react-select';
import type { Creator, Expression, Tag } from '~types/annotations';
import type { SelectOption } from '~types/common';

interface TagCardProps {
  tag: Tag
  relatedCreators: Array<Creator>
  relatedExpressions: Array<Expression>
  creators: {
    [key: string]: Creator
  }
  expressions: {
    [key: string]: Expression
  }
  onChange: Function
  onDelete: Function
  onLinkCreators: Function
  onLinkExpressions: Function
}

export default function TagCard({
  tag,
  relatedCreators = [],
  relatedExpressions = [],
  creators,
  expressions,
  onChange,
  onDelete,
  onLinkCreators,
  onLinkExpressions,
}: TagCardProps) {
  const [isEdited, setIsEdited] = useState<boolean>(false);
  const [tempTag, setTempTag] = useState<Tag>(tag);

  // @todo put upstream
  const creatorsOptions: Array<SelectOption> = useMemo(() => {
    return Object.values(creators).map(({ id, name }) => ({
      label: name,
      value: id,
    }))
  }, [creators]);
  // @todo put upstream
  const expressionsOptions: Array<SelectOption> = useMemo(() => {
    return Object.values(expressions).map(({ id, name }) => ({
      label: name,
      value: id,
    }))
  }, [creators]);

  useEffect(() => {
    setTempTag(tag);
  }, [tag]);

  const { id, color, description, name } = tag;
  return (
    <li className="TagCard card">
      <div className="card-content">
        <div className="card-body">
          {
            isEdited ?
              <form onSubmit={e => {
                e.preventDefault();
                setIsEdited(false);
                onChange(tempTag);
              }}>
                <div className="input-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    value={tempTag.name}
                    onChange={e => setTempTag({ ...tempTag, name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <div className="color-marker" style={{ background: color }} />
                  <label>Couleur</label>
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={tempTag.color}
                    onChange={e => setTempTag({ ...tempTag, color: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <TextareaAutosize
                    placeholder="Description"
                    value={tempTag.description}
                    onChange={e => setTempTag({ ...tempTag, description: e.target.value })}
                  />
                </div>
                
                <div className="form-subgroup">
                  <h4>Producteurs de contenus associées</h4>
                  <Select
                    value={relatedCreators.map(({id, name}) => ({
                      value: id,
                      label: name,
                    }))}
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      onLinkCreators(itemsIds);
                      // const newExpression = {
                      //   ...tempTag,
                      //   links: {
                      //     ...tempTag.links,
                      //     creators: itemsIds
                      //   }
                      // }
                      // setTempExpression(newExpression);
                    }}
                    options={creatorsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des créateurs et créatrices enregistrées'}
                    isMulti
                  />
                </div>
                {/* <div className="form-subgroup">
                  <h4>Expressions associées</h4>
                  <Select
                    value={relatedExpressions.map(({id, name}) => ({
                      value: id,
                      label: name,
                    }))}
                    onChange={(items) => {
                      const itemsIds = items.map(i => i.value);
                      onLinkExpressions(itemsIds);
                      // const newExpression = {
                      //   ...tempTag,
                      //   links: {
                      //     ...tempTag.links,
                      //     creators: itemsIds
                      //   }
                      // }
                      // setTempExpression(newExpression);
                    }}
                    options={expressionsOptions}
                    noOptionsMessage={() => 'Rien à afficher'}
                    placeholder={'Sélectionner ou rechercher des expressions enregistrées'}
                    isMulti
                  />
                </div> */}
                
              </form>
              :
              <div className="card-readonly-content" onClick={() => setIsEdited(true)}>
                <h4>
                  <span className="color-marker" style={{ background: color }} />
                  <span>{name}</span>
                </h4>
                <div className="description">
                  {description.split('\n').map((t, index) => <p key={index}>{t}</p>)}
                </div>
                {
                  relatedCreators?.length ?
                    <div>
                      Créateurs et créatrices associées : {
                        relatedCreators.map(c => c.name).join(', ')
                      }
                    </div>
                    : null
                }
                {
                  relatedExpressions?.length ?
                    <div>
                      Expressions associées : {
                        relatedExpressions.map(c => c.name).join(', ')
                      }
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
              onChange(tempTag);
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
