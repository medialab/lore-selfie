import {v4 as generateId} from 'uuid';
import ExpressionCard from "./ExpressionCard";
import type { Expression } from '~types/annotations';


export default function ExpressionsEdition({
  expressions,
  tags,
  creators,
  onChange,
  onDeleteItem,
}) {
  return (
    <section className="ExpressionsEdition annotation-form">
      <div className="form-header">
        <h4>À quoi ça sert ?</h4>
        <p>
          À décrire les lores dont vous êtes familier ou familière, en repérant des manières de s'exprimer spécifiques (dans les extraits de chat enregistrés, les titres des contenus, etc.) qui seront annotées dans les visualisations.
        </p>
      </div>
      <div className="form-actions">
      
            </div>
            <div className="form-list">
              {
                Object.values(expressions).length ?
                  <ul className="cards-list">
                    {
                      Object.values(expressions).map(expression => {
                        return (
                          <ExpressionCard
                            key={expression.id}
                            expression={expression}
                            {...{tags, creators}}
                            onChange={newExpression => {
                              const newExpressions = {
                                ...expressions,
                                [newExpression.id]: newExpression
                              }
                              onChange(newExpressions);
                            }}
                            onDelete={() => {
                              onDeleteItem(expression.id)
                            }}
                          />
                        )
                      })
                    }
                  </ul>
                  : <div>{`Pas d'expressions à afficher`}</div>
              }
            </div>
            <div className="form-footer">
              <button
                onClick={() => {
                  const name = prompt('Quelle est l\'expression que vous voulez ajouter (note : vous pourrez la modifier ensuite) ?');
                  if (name.length) {
                    const newExpression : Expression = {
                      id: generateId(),
                      name,
                      queries: [{
                        id: generateId(),
                        query: name
                      }],
                      definition: '',
                      links: {
                        creators: [],
                        tags: []
                      }
                    }
                    const newExpressions = {
                      ...expressions,
                      [newExpression.id]: newExpression
                    }
                    onChange(newExpressions);
                  }
                }}
              >
                Nouvelle expression
              </button>
            </div>
    </section>
  )
}