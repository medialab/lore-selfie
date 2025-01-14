import { Link, useParams } from "react-router-dom";
import { usePort } from "@plasmohq/messaging/hook";
import { useEffect, useMemo, useState } from "react";
import { v4 as generateId } from 'uuid';
import Measure from 'react-measure';

import { CREATE_ANNOTATION, DELETE_ANNOTATION, GET_ANNOTATIONS, GET_CHANNELS, UPDATE_ANNOTATION, UPDATE_ANNOTATION_COLLECTION } from "~constants";
import ExpressionsEdition from "~components/Annotations/ExpressionsEdition";
import ChannelsEdition from "~components/Annotations/ChannelsEdition";
import TagsEdition from "~components/Annotations/TagsEdition";
import AnnotationsNetwork from "~components/Annotations/AnnotationsNetwork";


import "../styles/Annotations.scss";
import { useInterval } from "usehooks-ts";
import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Annotations } from "~types/annotations";


function Annotations() {
  const annotationsPort = usePort('annotationscrud')
  const activityPort = usePort("activitycrud");
  const [availableChannels, setAvailableChannels] = useState();
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [annotations, setAnnotations]: [Annotations, Function] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequestsIds, setPendingRequestsIds] = useState(new Set());
  /**
    * Sending cud requests
    */
  interface PlasmoPortType {
    data?: any
    send: Function
    listen: Function
  }
  const requestPort = useMemo(() => async (port: PlasmoPortType, actionType: string, payload: object) => {
    const requestId = generateId();
    pendingRequestsIds.add(requestId);
    // console.log('adding pending request', Array.from(pendingRequestsIds))
    setPendingRequestsIds(pendingRequestsIds);
    await port.send({
      actionType,
      payload,
      requestId
    })
  }, [pendingRequestsIds, annotationsPort, activityPort, setPendingRequestsIds]);

  useEffect(() => {
    if (availableChannels && annotations && isLoading) {
      setIsLoading(false);
    }
  }, [availableChannels, annotations, isLoading, requestPort])

  useEffect(() => {
    requestPort(activityPort, GET_CHANNELS, {});
    requestPort(annotationsPort, GET_ANNOTATIONS, {});
  }, []);

  useInterval(() => {
    requestPort(activityPort, GET_CHANNELS, {});
    // requestPort(annotationsPort, GET_ANNOTATIONS, {});
  }, 10000)


  useEffect(() => {
    [activityPort, annotationsPort].forEach(p => p.listen(response => {
      // console.log('response', response, 'pending requests', Array.from(pendingRequestsIds), 'has pending request', pendingRequestsIds.has(response.requestId))
      if (!pendingRequestsIds.has(response.requestId)) {
        return;
      }
      if (response.result.status === 'error') {
        console.error('error : ', response);
        return;
      }
      pendingRequestsIds.delete(response.requestId);
      setPendingRequestsIds(pendingRequestsIds);
      const { result: { data } } = response;
      if (data === undefined) {
        return;
      }
      switch (response.actionType) {
        case GET_ANNOTATIONS:
        case CREATE_ANNOTATION:
        case UPDATE_ANNOTATION:
        case DELETE_ANNOTATION:
        case UPDATE_ANNOTATION_COLLECTION:
          setAnnotations(data);
          break;

        case GET_CHANNELS:
          setAvailableChannels(data);
          break;
        default:
          break;
      }
    }))
  }, [pendingRequestsIds, setPendingRequestsIds])

  const { tab = 'channels' } = useParams();
  const tabs = [
    {
      id: 'channels',
      label: 'Chaînes'
    },
    {
      id: 'tags',
      label: 'Étiquettes'
    },
    {
      id: 'expressions',
      label: 'Expressions'
    }
  ]


  return (
    <div className="contents-wrapper Annotations">
      <Measure
        bounds
        onResize={contentRect => {
          setDimensions(contentRect.bounds)
        }}
      >
        {({ measureRef }) => (
          <div ref={measureRef} className="contents width-limited-contents">
            <div className="column form-column">
              <div className="tabs-container">
                <ul>
                  {
                    tabs.map(({ id, label }) => {
                      return (
                        <li className={`tab ${tab === id ? 'active' : ''}`} key={id}>
                          <h2>
                          <Link to={`/annotations/${id}`}>
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
                  isLoading ? <div>Chargement...</div>
                    :
                    <>
                      {
                        tab === 'channels' ?
                          <ChannelsEdition
                            {...{
                              availableChannels,
                              // expressions: annotations.expressions,
                              // tags: annotations.tags,
                              // creators: annotations.creators,
                              ...annotations,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { value: data, id: 'creators' })
                              },
                              onDeleteItem: id => {
                                requestPort(annotationsPort, DELETE_ANNOTATION, { collection: 'creators', id })
                              }
                            }}
                          />
                          : null
                      }
                      {
                        tab === 'tags' ?
                          <TagsEdition
                            {...{
                              ...annotations,
                              onLinkCreators: (tagId, ids) => {
                                const newCreators = Object.entries(annotations?.creators || {}).reduce((res, [key, obj]) => {
                                  let tags = obj.links.tags || [];
                                  if (tags.includes(tagId) && !ids.includes(obj.id)) {
                                    tags = tags.filter(t => t !== tagId);
                                  } else if (!tags.includes(tagId) && ids.includes(obj.id)) {
                                    tags = [...tags, tagId];
                                  }
                                  return {
                                    ...res,
                                    [key]: {
                                      ...obj,
                                      links: {
                                        ...obj.links,
                                        tags
                                      }
                                    }
                                  }
                                }, {})
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { value: newCreators, id: 'creators' })
                              },
                              onLinkExpressions: console.log,
                              // @todo finish this
                              // onLinkExpressions: (expressionId, ids) => {
                              //   const newExpressions = Object.entries(annotations?.expressions || {}).reduce((res, [key, obj]) => {
                              //     let expressions = obj.links.expressions || [];
                              //     // if (expressions.includes(expressionId) && !ids.includes(obj.id)) {
                              //     //   expressions = expressions.filter(t => t !== expressionId);
                              //     // } else if (!expressions.includes(expressionId) && ids.includes(obj.id)) {
                              //     //   expressions = [...expressions, expressionId];
                              //     // }
                              //     return {
                              //       ...res,
                              //       [key]: {
                              //         ...obj,
                              //         links: {
                              //           ...obj.links,
                              //           expressions
                              //         }
                              //       }
                              //     }
                              //   }, {})
                              //   requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { value: newExpressions, id: 'creators' })
                              // },
                              // tags: annotations.tags,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { value: data, id: 'tags' })
                              },
                              onDeleteItem: id => {
                                requestPort(annotationsPort, DELETE_ANNOTATION, { collection: 'tags', id })
                              }
                              
                            }}
                          />
                          : null
                      }
                      {
                        tab === 'expressions' ?
                          <ExpressionsEdition
                            {...{
                              ...annotations,
                              
                              // expressions: annotations.expressions,
                              // tags: annotations.tags,
                              // creators: annotations.creators,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { value: data, id: 'expressions' })
                              },
                              onDeleteItem: id => {
                                requestPort(annotationsPort, DELETE_ANNOTATION, { collection: 'expressions', id })
                              }
                            }}
                          />
                          : null
                      }
                    </>
                }

              </div>
            </div>
            <div className="column viz-column">

              {
                isLoading ? <div>Chargement ...</div>
                :
                <AnnotationsNetwork
                  annotations={annotations}
                  channels={availableChannels}
                />
              }
             
            </div>
          </div>
        )}
      </Measure>

    </div>
  )
}
export default Annotations;