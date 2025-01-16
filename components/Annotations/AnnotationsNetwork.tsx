// import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import {
  ControlsContainer,
  FullScreenControl,
  SigmaContainer,
  useLoadGraph,
  ZoomControl
} from "@react-sigma/core"
import { LayoutForceAtlas2Control } from "@react-sigma/layout-forceatlas2"
import Graph from "graphology"
import forceAtlas2 from "graphology-layout-forceatlas2"
import { useEffect, useState } from "react"
import {
  AiFillPauseCircle,
  AiFillPlayCircle,
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiOutlineZoomIn,
  AiOutlineZoomOut
} from "react-icons/ai"
import { MdFilterCenterFocus } from "react-icons/md"
import Measure from "react-measure"

import "@react-sigma/core/lib/react-sigma.min.css"

import type { Annotations } from "~types/annotations"
import { Dimensions, type AvailableChannels } from "~types/common"

interface LoadGraphProps {
  annotations: Annotations
  channels: AvailableChannels
  legend: {
    tag: {
      color: string
    }
    expression: {
      color: string
    }
    channel: {
      color: string
    }
    creator: {
      color: string
    }
  }
}
// Component that load the graph
export const LoadGraph = ({
  annotations,
  channels,
  legend
}: LoadGraphProps) => {
  const loadGraph = useLoadGraph()

  useEffect(() => {
    const graph = new Graph()
    const channelsMap = channels.reduce(
      (res, chan) => ({ ...res, [chan.id]: chan }),
      {}
    )

    channels.forEach((channel, index) => {
      graph.addNode(`channel-${channel.id}`, {
        x: 0,
        y: index,
        size: channel.urlsCount,
        label: `${channel.channelName || channel.channelId} (${channel.platform})`,
        color: legend.channel.color
      })
    })
    Object.values(annotations.tags).forEach((tag, index) => {
      graph.addNode(`tag-${tag.id}`, {
        x: 1,
        y: index,
        size: 5,
        label: `${tag.name} (étiquette)`,
        color: legend.tag.color
      })
    })
    Object.values(annotations.creators).forEach((creator, index) => {
      graph.addNode(`creator-${creator.id}`, {
        x: 2,
        y: index,
        size: 1,
        label: creator.name,
        color: legend.creator.color
      })
      creator?.channels?.forEach((channelId) => {
        const nodeId = `channel-${channelId}`
        graph.addEdge(`creator-${creator.id}`, nodeId)
        graph.updateNodeAttribute(
          `creator-${creator.id}`,
          "size",
          (val) => val + channelsMap[channelId].urlsCount
        )
      })
      creator?.links?.tags?.forEach((tagId) => {
        const nodeId = `tag-${tagId}`
        graph.addEdge(`creator-${creator.id}`, nodeId)
        creator.channels.forEach((channelId) => {
          graph.updateNodeAttribute(
            `tag-${tagId}`,
            "size",
            (val) => val + channelsMap[channelId].urlsCount
          )
        })
      })
    })
    Object.values(annotations.expressions).forEach((expression, index) => {
      graph.addNode(`expression-${expression.id}`, {
        x: 3,
        y: index,
        size: 3,
        label: `${expression.name} (expression)`,
        color: legend.expression.color
      })

      expression.links.tags.forEach((tagId) => {
        const nodeId = `tag-${tagId}`
        graph.addEdge(`expression-${expression.id}`, nodeId)
      })
      expression.links.creators.forEach((creatorId) => {
        const nodeId = `creator-${creatorId}`
        graph.addEdge(`expression-${expression.id}`, nodeId)
        const creator = annotations.creators[creatorId]
        creator.channels.forEach((channelId) => {
          graph.updateNodeAttribute(
            `expression-${expression.id}`,
            "size",
            (val) => val + channelsMap[channelId].urlsCount
          )
        })
      })
    })

    const sensibleSettings = forceAtlas2.inferSettings(graph)

    forceAtlas2.assign(graph, {
      iterations: 50,
      settings: {
        ...sensibleSettings,
        gravity: 10
      }
      // settings: {
      //   gravity: 10
      // }
    })
    // console.log('spatialized', sensibleSettings)

    loadGraph(graph)
  }, [loadGraph, annotations, channels, legend])

  return null
}

export default function AnnotationsNetwork({ annotations, channels }) {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 1000,
    height: 1000
  })
  const [faTime, setFaTime] = useState<number>(2000)

  useEffect(() => {
    // Globally seed the Math.random
    const params = new URLSearchParams(window.location.search)
    const time = params.get("faTime")
    setFaTime(Number.parseInt(time ?? "2000") || 2000)
  }, [window.location])

  const legend = {
    channel: {
      color: "red",
      label: "Chaîne"
    },
    creator: {
      color: "green",
      label: "Créatrice ou créateur de contenus"
    },
    tag: {
      color: "purple",
      label: "Étiquette"
    },
    expression: {
      color: "lightblue",
      label: "Expression"
    }
  }
  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        setDimensions(contentRect.bounds)
      }}>
      {({ measureRef }) => (
        <div ref={measureRef} className="AnnotationsNetwork">
          <SigmaContainer
            style={{
              width: dimensions.width + "px",
              height: dimensions.height + "px",
              background: "rgb(237, 237, 237)"
            }}>
            <LoadGraph
              legend={legend}
              channels={channels}
              annotations={annotations}
            />
            <ControlsContainer position={"bottom-right"}>
              <ZoomControl
                labels={{ zoomIn: "PLUS", zoomOut: "MINUS", reset: "RESET" }}>
                <AiOutlineZoomIn />
                <AiOutlineZoomOut />
                <MdFilterCenterFocus />
              </ZoomControl>
              <FullScreenControl labels={{ enter: "ENTER", exit: "EXIT" }}>
                <AiOutlineFullscreen />
                <AiOutlineFullscreenExit />
              </FullScreenControl>
              <LayoutForceAtlas2Control
                labels={{ stop: "STOP", start: "START" }}
                autoRunFor={faTime}>
                <AiFillPlayCircle />
                <AiFillPauseCircle />
              </LayoutForceAtlas2Control>
            </ControlsContainer>
          </SigmaContainer>

          <div className="legend-container">
            <h4>Légende</h4>
            <ul>
              {Object.entries(legend).map(([id, { label, color }]) => {
                return (
                  <li key={id}>
                    <span
                      className="color-marker"
                      style={{ background: color }}
                    />
                    <span>{label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </Measure>
  )
}
