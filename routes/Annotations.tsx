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


function Annotations() {
  const annotationsPort = usePort('annotationscrud')
  const activityPort = usePort("activitycrud");
  const [availableChannels, setAvailableChannels] = useState();
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });
  const [annotations, setAnnotations] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequestsIds, setPendingRequestsIds] = useState(new Set());
  /**
    * Sending cud requests
    */
  const requestPort = useMemo(() => async (port: Object, actionType: string, payload: object) => {
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
      // const today = new Date().toJSON().split('T')[0];
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
                              tags: annotations.tags,
                              creators: annotations.creators,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { data, id: 'creators' })
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
                              tags: annotations.tags,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { data, id: 'tags' })
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
                              expressions: annotations.expressions,
                              tags: annotations.tags,
                              creators: annotations.creators,
                              onChange: (data) => {
                                requestPort(annotationsPort, UPDATE_ANNOTATION_COLLECTION, { data, id: 'expressions' })
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