"use strict"
module.exports = validate20
module.exports.default = validate20
const schema22 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    Annotations: {
      properties: {
        creators: {
          additionalProperties: { $ref: "#/definitions/Creator" },
          type: "object"
        },
        expressions: {
          additionalProperties: { $ref: "#/definitions/Expression" },
          type: "object"
        },
        tags: {
          additionalProperties: { $ref: "#/definitions/Tag" },
          type: "object"
        }
      },
      type: "object"
    },
    BlurOnReactionInputEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "BLUR_ON_REACTION_INPUT", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    BlurTabEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "BLUR_TAB", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    BrowseViewEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        metadata: {
          anyOf: [
            { $ref: "#/definitions/YoutubeVideoMetadata" },
            { $ref: "#/definitions/YoutubeShortMetadata" },
            { $ref: "#/definitions/TwitchLiveMetadata" }
          ]
        },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "BROWSE_VIEW", type: "string" },
        url: { type: "string" },
        viewType: { type: "string" }
      },
      type: "object"
    },
    Browser: {
      properties: {
        name: { type: "string" },
        type: { type: "string" },
        version: { type: "string" }
      },
      type: "object"
    },
    CaptureEvent: {
      anyOf: [
        { $ref: "#/definitions/OpenPlatformInTabEvent" },
        { $ref: "#/definitions/ClosePlatformInTabEvent" },
        { $ref: "#/definitions/BlurTabEvent" },
        { $ref: "#/definitions/FocusTabEvent" },
        { $ref: "#/definitions/BrowseViewEvent" },
        { $ref: "#/definitions/FocusOnReactionInputEvent" },
        { $ref: "#/definitions/BlurOnReactionInputEvent" },
        { $ref: "#/definitions/ChatActivityRecordEvent" },
        { $ref: "#/definitions/LiveUserActivityRecordEvent" }
      ]
    },
    ChatActivityRecordEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        messages: {
          items: { $ref: "#/definitions/TwitchMessageRecord" },
          type: "array"
        },
        messagesAverageCharLength: { type: "number" },
        messagesCount: { type: "number" },
        platform: { type: "string" },
        tabId: { type: "string" },
        timeSpan: { type: "number" },
        type: { const: "CHAT_ACTIVITY_RECORD", type: "string" },
        url: { type: "string" },
        viewersCount: { type: "number" }
      },
      type: "object"
    },
    ClosePlatformInTabEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "CLOSE_PLATFORM_IN_TAB", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    Creator: {
      properties: {
        channels: { items: { type: "string" }, type: "array" },
        description: { type: "string" },
        id: { type: "string" },
        links: {
          properties: { tags: { items: { type: "string" }, type: "array" } },
          type: "object"
        },
        name: { type: "string" }
      },
      type: "object"
    },
    EmoteFromChat: {
      properties: { alt: { type: "string" }, src: { type: "string" } },
      type: "object"
    },
    Expression: {
      properties: {
        definition: { type: "string" },
        id: { type: "string" },
        links: {
          properties: {
            creators: { items: { type: "string" }, type: "array" },
            tags: { items: { type: "string" }, type: "array" }
          },
          type: "object"
        },
        name: { type: "string" },
        queries: { items: { $ref: "#/definitions/Query" }, type: "array" }
      },
      type: "object"
    },
    FocusOnReactionInputEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "FOCUS_ON_REACTION_INPUT", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    FocusTabEvent: {
      properties: {
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "FOCUS_TAB", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    Handle: {
      properties: {
        alias: { type: "string" },
        id: { type: "string" },
        internalId: { type: "string" },
        platform: { type: "string" }
      },
      type: "object"
    },
    LiveUserActivityRecordEvent: {
      properties: {
        currentMediaTime: { type: "string" },
        date: { format: "date-time", type: "string" },
        hasFocus: { type: "boolean" },
        id: { type: "string" },
        injectionId: { type: "string" },
        isPlaying: { type: "boolean" },
        platform: { type: "string" },
        pointerActivityScore: { type: "number" },
        tabId: { type: "string" },
        timeSpan: { type: "number" },
        type: { const: "LIVE_USER_ACTIVITY_RECORD", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    OpenPlatformInTabEvent: {
      properties: {
        browser: { $ref: "#/definitions/Browser" },
        date: { format: "date-time", type: "string" },
        id: { type: "string" },
        injectionId: { type: "string" },
        platform: { type: "string" },
        tabId: { type: "string" },
        type: { const: "OPEN_PLATFORM_IN_TAB", type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    Query: {
      properties: { id: { type: "string" }, query: { type: "string" } },
      type: "object"
    },
    RecommendedContent: {
      properties: {
        channelName: { type: "string" },
        thumbnailImageSrc: { type: "string" },
        title: { type: "string" },
        type: { type: "string" },
        url: { type: "string" }
      },
      type: "object"
    },
    Settings: {
      properties: {
        handles: { items: { $ref: "#/definitions/Handle" }, type: "array" },
        liveRecordingInterval: { type: "number" },
        recordActivity: { type: "boolean" },
        recordChat: { type: "boolean" },
        recordMouse: { type: "boolean" },
        recordOnPlatforms: { items: { type: "string" }, type: "array" },
        recordTabs: { type: "boolean" }
      },
      type: "object"
    },
    Tag: {
      properties: {
        color: { type: "string" },
        description: { type: "string" },
        id: { type: "string" },
        name: { type: "string" }
      },
      type: "object"
    },
    TwitchLiveMetadata: {
      properties: {
        category: { type: "string" },
        categoryHref: { type: "string" },
        channel: { type: "string" },
        channelId: { type: "string" },
        channelImageAvatarSrc: { type: "string" },
        channelName: { type: "string" },
        liveTimeElapsed: { type: "string" },
        tags: { type: "string" },
        title: { type: "string" },
        viewersCount: { type: "string" }
      },
      type: "object"
    },
    TwitchMessageRecord: {
      properties: {
        author: { type: "string" },
        emote: { $ref: "#/definitions/EmoteFromChat" },
        message: { type: "string" }
      },
      type: "object"
    },
    YoutubeShortMetadata: {
      properties: {
        channelId: { type: "string" },
        channelImageSrc: { type: "string" },
        channelName: { type: "string" },
        commentsCount: { type: "string" },
        likesCount: { type: "string" },
        title: { type: "string" }
      },
      type: "object"
    },
    YoutubeVideoMetadata: {
      properties: {
        channelId: { type: "string" },
        channelImageSrc: { type: "string" },
        channelName: { type: "string" },
        description: { type: "string" },
        duration: { type: "string" },
        likesCount: { type: "string" },
        ownerSubcount: { type: "string" },
        recommendedContents: {
          items: { $ref: "#/definitions/RecommendedContent" },
          type: "array"
        },
        shortlinkUrl: { type: "string" },
        title: { type: "string" },
        videoimageSrc: { type: "string" }
      },
      type: "object"
    }
  },
  properties: {
    activities: {
      items: { $ref: "#/definitions/CaptureEvent" },
      type: "array"
    },
    annotations: { $ref: "#/definitions/Annotations" },
    settings: { $ref: "#/definitions/Settings" }
  },
  type: "object"
}
const schema23 = {
  anyOf: [
    { $ref: "#/definitions/OpenPlatformInTabEvent" },
    { $ref: "#/definitions/ClosePlatformInTabEvent" },
    { $ref: "#/definitions/BlurTabEvent" },
    { $ref: "#/definitions/FocusTabEvent" },
    { $ref: "#/definitions/BrowseViewEvent" },
    { $ref: "#/definitions/FocusOnReactionInputEvent" },
    { $ref: "#/definitions/BlurOnReactionInputEvent" },
    { $ref: "#/definitions/ChatActivityRecordEvent" },
    { $ref: "#/definitions/LiveUserActivityRecordEvent" }
  ]
}
const schema26 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "CLOSE_PLATFORM_IN_TAB", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema27 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "BLUR_TAB", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema28 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "FOCUS_TAB", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema34 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "FOCUS_ON_REACTION_INPUT", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema35 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "BLUR_ON_REACTION_INPUT", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema39 = {
  properties: {
    currentMediaTime: { type: "string" },
    date: { format: "date-time", type: "string" },
    hasFocus: { type: "boolean" },
    id: { type: "string" },
    injectionId: { type: "string" },
    isPlaying: { type: "boolean" },
    platform: { type: "string" },
    pointerActivityScore: { type: "number" },
    tabId: { type: "string" },
    timeSpan: { type: "number" },
    type: { const: "LIVE_USER_ACTIVITY_RECORD", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema24 = {
  properties: {
    browser: { $ref: "#/definitions/Browser" },
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "OPEN_PLATFORM_IN_TAB", type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
const schema25 = {
  properties: {
    name: { type: "string" },
    type: { type: "string" },
    version: { type: "string" }
  },
  type: "object"
}
const formats0 = require("ajv-formats/dist/formats").fullFormats["date-time"]
function validate22(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.browser !== undefined) {
      let data0 = data.browser
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        if (data0.name !== undefined) {
          if (typeof data0.name !== "string") {
            const err0 = {
              instancePath: instancePath + "/browser/name",
              schemaPath: "#/definitions/Browser/properties/name/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err0]
            } else {
              vErrors.push(err0)
            }
            errors++
          }
        }
        if (data0.type !== undefined) {
          if (typeof data0.type !== "string") {
            const err1 = {
              instancePath: instancePath + "/browser/type",
              schemaPath: "#/definitions/Browser/properties/type/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err1]
            } else {
              vErrors.push(err1)
            }
            errors++
          }
        }
        if (data0.version !== undefined) {
          if (typeof data0.version !== "string") {
            const err2 = {
              instancePath: instancePath + "/browser/version",
              schemaPath: "#/definitions/Browser/properties/version/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err2]
            } else {
              vErrors.push(err2)
            }
            errors++
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + "/browser",
          schemaPath: "#/definitions/Browser/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err3]
        } else {
          vErrors.push(err3)
        }
        errors++
      }
    }
    if (data.date !== undefined) {
      let data4 = data.date
      if (typeof data4 === "string") {
        if (!formats0.validate(data4)) {
          const err4 = {
            instancePath: instancePath + "/date",
            schemaPath: "#/properties/date/format",
            keyword: "format",
            params: { format: "date-time" },
            message: 'must match format "' + "date-time" + '"'
          }
          if (vErrors === null) {
            vErrors = [err4]
          } else {
            vErrors.push(err4)
          }
          errors++
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/date",
          schemaPath: "#/properties/date/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err5]
        } else {
          vErrors.push(err5)
        }
        errors++
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err6 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err6]
        } else {
          vErrors.push(err6)
        }
        errors++
      }
    }
    if (data.injectionId !== undefined) {
      if (typeof data.injectionId !== "string") {
        const err7 = {
          instancePath: instancePath + "/injectionId",
          schemaPath: "#/properties/injectionId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err7]
        } else {
          vErrors.push(err7)
        }
        errors++
      }
    }
    if (data.platform !== undefined) {
      if (typeof data.platform !== "string") {
        const err8 = {
          instancePath: instancePath + "/platform",
          schemaPath: "#/properties/platform/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err8]
        } else {
          vErrors.push(err8)
        }
        errors++
      }
    }
    if (data.tabId !== undefined) {
      if (typeof data.tabId !== "string") {
        const err9 = {
          instancePath: instancePath + "/tabId",
          schemaPath: "#/properties/tabId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err9]
        } else {
          vErrors.push(err9)
        }
        errors++
      }
    }
    if (data.type !== undefined) {
      let data9 = data.type
      if (typeof data9 !== "string") {
        const err10 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err10]
        } else {
          vErrors.push(err10)
        }
        errors++
      }
      if ("OPEN_PLATFORM_IN_TAB" !== data9) {
        const err11 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "OPEN_PLATFORM_IN_TAB" },
          message: "must be equal to constant"
        }
        if (vErrors === null) {
          vErrors = [err11]
        } else {
          vErrors.push(err11)
        }
        errors++
      }
    }
    if (data.url !== undefined) {
      if (typeof data.url !== "string") {
        const err12 = {
          instancePath: instancePath + "/url",
          schemaPath: "#/properties/url/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err12]
        } else {
          vErrors.push(err12)
        }
        errors++
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err13]
    } else {
      vErrors.push(err13)
    }
    errors++
  }
  validate22.errors = vErrors
  return errors === 0
}
const schema29 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    metadata: {
      anyOf: [
        { $ref: "#/definitions/YoutubeVideoMetadata" },
        { $ref: "#/definitions/YoutubeShortMetadata" },
        { $ref: "#/definitions/TwitchLiveMetadata" }
      ]
    },
    platform: { type: "string" },
    tabId: { type: "string" },
    type: { const: "BROWSE_VIEW", type: "string" },
    url: { type: "string" },
    viewType: { type: "string" }
  },
  type: "object"
}
const schema32 = {
  properties: {
    channelId: { type: "string" },
    channelImageSrc: { type: "string" },
    channelName: { type: "string" },
    commentsCount: { type: "string" },
    likesCount: { type: "string" },
    title: { type: "string" }
  },
  type: "object"
}
const schema33 = {
  properties: {
    category: { type: "string" },
    categoryHref: { type: "string" },
    channel: { type: "string" },
    channelId: { type: "string" },
    channelImageAvatarSrc: { type: "string" },
    channelName: { type: "string" },
    liveTimeElapsed: { type: "string" },
    tags: { type: "string" },
    title: { type: "string" },
    viewersCount: { type: "string" }
  },
  type: "object"
}
const schema30 = {
  properties: {
    channelId: { type: "string" },
    channelImageSrc: { type: "string" },
    channelName: { type: "string" },
    description: { type: "string" },
    duration: { type: "string" },
    likesCount: { type: "string" },
    ownerSubcount: { type: "string" },
    recommendedContents: {
      items: { $ref: "#/definitions/RecommendedContent" },
      type: "array"
    },
    shortlinkUrl: { type: "string" },
    title: { type: "string" },
    videoimageSrc: { type: "string" }
  },
  type: "object"
}
const schema31 = {
  properties: {
    channelName: { type: "string" },
    thumbnailImageSrc: { type: "string" },
    title: { type: "string" },
    type: { type: "string" },
    url: { type: "string" }
  },
  type: "object"
}
function validate25(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.channelId !== undefined) {
      if (typeof data.channelId !== "string") {
        const err0 = {
          instancePath: instancePath + "/channelId",
          schemaPath: "#/properties/channelId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err0]
        } else {
          vErrors.push(err0)
        }
        errors++
      }
    }
    if (data.channelImageSrc !== undefined) {
      if (typeof data.channelImageSrc !== "string") {
        const err1 = {
          instancePath: instancePath + "/channelImageSrc",
          schemaPath: "#/properties/channelImageSrc/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err1]
        } else {
          vErrors.push(err1)
        }
        errors++
      }
    }
    if (data.channelName !== undefined) {
      if (typeof data.channelName !== "string") {
        const err2 = {
          instancePath: instancePath + "/channelName",
          schemaPath: "#/properties/channelName/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err2]
        } else {
          vErrors.push(err2)
        }
        errors++
      }
    }
    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        const err3 = {
          instancePath: instancePath + "/description",
          schemaPath: "#/properties/description/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err3]
        } else {
          vErrors.push(err3)
        }
        errors++
      }
    }
    if (data.duration !== undefined) {
      if (typeof data.duration !== "string") {
        const err4 = {
          instancePath: instancePath + "/duration",
          schemaPath: "#/properties/duration/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err4]
        } else {
          vErrors.push(err4)
        }
        errors++
      }
    }
    if (data.likesCount !== undefined) {
      if (typeof data.likesCount !== "string") {
        const err5 = {
          instancePath: instancePath + "/likesCount",
          schemaPath: "#/properties/likesCount/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err5]
        } else {
          vErrors.push(err5)
        }
        errors++
      }
    }
    if (data.ownerSubcount !== undefined) {
      if (typeof data.ownerSubcount !== "string") {
        const err6 = {
          instancePath: instancePath + "/ownerSubcount",
          schemaPath: "#/properties/ownerSubcount/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err6]
        } else {
          vErrors.push(err6)
        }
        errors++
      }
    }
    if (data.recommendedContents !== undefined) {
      let data7 = data.recommendedContents
      if (Array.isArray(data7)) {
        const len0 = data7.length
        for (let i0 = 0; i0 < len0; i0++) {
          let data8 = data7[i0]
          if (data8 && typeof data8 == "object" && !Array.isArray(data8)) {
            if (data8.channelName !== undefined) {
              if (typeof data8.channelName !== "string") {
                const err7 = {
                  instancePath:
                    instancePath +
                    "/recommendedContents/" +
                    i0 +
                    "/channelName",
                  schemaPath:
                    "#/definitions/RecommendedContent/properties/channelName/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err7]
                } else {
                  vErrors.push(err7)
                }
                errors++
              }
            }
            if (data8.thumbnailImageSrc !== undefined) {
              if (typeof data8.thumbnailImageSrc !== "string") {
                const err8 = {
                  instancePath:
                    instancePath +
                    "/recommendedContents/" +
                    i0 +
                    "/thumbnailImageSrc",
                  schemaPath:
                    "#/definitions/RecommendedContent/properties/thumbnailImageSrc/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err8]
                } else {
                  vErrors.push(err8)
                }
                errors++
              }
            }
            if (data8.title !== undefined) {
              if (typeof data8.title !== "string") {
                const err9 = {
                  instancePath:
                    instancePath + "/recommendedContents/" + i0 + "/title",
                  schemaPath:
                    "#/definitions/RecommendedContent/properties/title/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err9]
                } else {
                  vErrors.push(err9)
                }
                errors++
              }
            }
            if (data8.type !== undefined) {
              if (typeof data8.type !== "string") {
                const err10 = {
                  instancePath:
                    instancePath + "/recommendedContents/" + i0 + "/type",
                  schemaPath:
                    "#/definitions/RecommendedContent/properties/type/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err10]
                } else {
                  vErrors.push(err10)
                }
                errors++
              }
            }
            if (data8.url !== undefined) {
              if (typeof data8.url !== "string") {
                const err11 = {
                  instancePath:
                    instancePath + "/recommendedContents/" + i0 + "/url",
                  schemaPath:
                    "#/definitions/RecommendedContent/properties/url/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err11]
                } else {
                  vErrors.push(err11)
                }
                errors++
              }
            }
          } else {
            const err12 = {
              instancePath: instancePath + "/recommendedContents/" + i0,
              schemaPath: "#/definitions/RecommendedContent/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err12]
            } else {
              vErrors.push(err12)
            }
            errors++
          }
        }
      } else {
        const err13 = {
          instancePath: instancePath + "/recommendedContents",
          schemaPath: "#/properties/recommendedContents/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err13]
        } else {
          vErrors.push(err13)
        }
        errors++
      }
    }
    if (data.shortlinkUrl !== undefined) {
      if (typeof data.shortlinkUrl !== "string") {
        const err14 = {
          instancePath: instancePath + "/shortlinkUrl",
          schemaPath: "#/properties/shortlinkUrl/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err14]
        } else {
          vErrors.push(err14)
        }
        errors++
      }
    }
    if (data.title !== undefined) {
      if (typeof data.title !== "string") {
        const err15 = {
          instancePath: instancePath + "/title",
          schemaPath: "#/properties/title/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err15]
        } else {
          vErrors.push(err15)
        }
        errors++
      }
    }
    if (data.videoimageSrc !== undefined) {
      if (typeof data.videoimageSrc !== "string") {
        const err16 = {
          instancePath: instancePath + "/videoimageSrc",
          schemaPath: "#/properties/videoimageSrc/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err16]
        } else {
          vErrors.push(err16)
        }
        errors++
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err17]
    } else {
      vErrors.push(err17)
    }
    errors++
  }
  validate25.errors = vErrors
  return errors === 0
}
function validate24(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.date !== undefined) {
      let data0 = data.date
      if (typeof data0 === "string") {
        if (!formats0.validate(data0)) {
          const err0 = {
            instancePath: instancePath + "/date",
            schemaPath: "#/properties/date/format",
            keyword: "format",
            params: { format: "date-time" },
            message: 'must match format "' + "date-time" + '"'
          }
          if (vErrors === null) {
            vErrors = [err0]
          } else {
            vErrors.push(err0)
          }
          errors++
        }
      } else {
        const err1 = {
          instancePath: instancePath + "/date",
          schemaPath: "#/properties/date/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err1]
        } else {
          vErrors.push(err1)
        }
        errors++
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err2 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err2]
        } else {
          vErrors.push(err2)
        }
        errors++
      }
    }
    if (data.injectionId !== undefined) {
      if (typeof data.injectionId !== "string") {
        const err3 = {
          instancePath: instancePath + "/injectionId",
          schemaPath: "#/properties/injectionId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err3]
        } else {
          vErrors.push(err3)
        }
        errors++
      }
    }
    if (data.metadata !== undefined) {
      let data3 = data.metadata
      const _errs8 = errors
      let valid1 = false
      const _errs9 = errors
      if (
        !validate25(data3, {
          instancePath: instancePath + "/metadata",
          parentData: data,
          parentDataProperty: "metadata",
          rootData
        })
      ) {
        vErrors =
          vErrors === null
            ? validate25.errors
            : vErrors.concat(validate25.errors)
        errors = vErrors.length
      }
      var _valid0 = _errs9 === errors
      valid1 = valid1 || _valid0
      if (!valid1) {
        const _errs10 = errors
        if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
          if (data3.channelId !== undefined) {
            if (typeof data3.channelId !== "string") {
              const err4 = {
                instancePath: instancePath + "/metadata/channelId",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/channelId/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err4]
              } else {
                vErrors.push(err4)
              }
              errors++
            }
          }
          if (data3.channelImageSrc !== undefined) {
            if (typeof data3.channelImageSrc !== "string") {
              const err5 = {
                instancePath: instancePath + "/metadata/channelImageSrc",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/channelImageSrc/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err5]
              } else {
                vErrors.push(err5)
              }
              errors++
            }
          }
          if (data3.channelName !== undefined) {
            if (typeof data3.channelName !== "string") {
              const err6 = {
                instancePath: instancePath + "/metadata/channelName",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/channelName/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err6]
              } else {
                vErrors.push(err6)
              }
              errors++
            }
          }
          if (data3.commentsCount !== undefined) {
            if (typeof data3.commentsCount !== "string") {
              const err7 = {
                instancePath: instancePath + "/metadata/commentsCount",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/commentsCount/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err7]
              } else {
                vErrors.push(err7)
              }
              errors++
            }
          }
          if (data3.likesCount !== undefined) {
            if (typeof data3.likesCount !== "string") {
              const err8 = {
                instancePath: instancePath + "/metadata/likesCount",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/likesCount/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err8]
              } else {
                vErrors.push(err8)
              }
              errors++
            }
          }
          if (data3.title !== undefined) {
            if (typeof data3.title !== "string") {
              const err9 = {
                instancePath: instancePath + "/metadata/title",
                schemaPath:
                  "#/definitions/YoutubeShortMetadata/properties/title/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err9]
              } else {
                vErrors.push(err9)
              }
              errors++
            }
          }
        } else {
          const err10 = {
            instancePath: instancePath + "/metadata",
            schemaPath: "#/definitions/YoutubeShortMetadata/type",
            keyword: "type",
            params: { type: "object" },
            message: "must be object"
          }
          if (vErrors === null) {
            vErrors = [err10]
          } else {
            vErrors.push(err10)
          }
          errors++
        }
        var _valid0 = _errs10 === errors
        valid1 = valid1 || _valid0
        if (!valid1) {
          const _errs25 = errors
          if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
            if (data3.category !== undefined) {
              if (typeof data3.category !== "string") {
                const err11 = {
                  instancePath: instancePath + "/metadata/category",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/category/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err11]
                } else {
                  vErrors.push(err11)
                }
                errors++
              }
            }
            if (data3.categoryHref !== undefined) {
              if (typeof data3.categoryHref !== "string") {
                const err12 = {
                  instancePath: instancePath + "/metadata/categoryHref",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/categoryHref/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err12]
                } else {
                  vErrors.push(err12)
                }
                errors++
              }
            }
            if (data3.channel !== undefined) {
              if (typeof data3.channel !== "string") {
                const err13 = {
                  instancePath: instancePath + "/metadata/channel",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/channel/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err13]
                } else {
                  vErrors.push(err13)
                }
                errors++
              }
            }
            if (data3.channelId !== undefined) {
              if (typeof data3.channelId !== "string") {
                const err14 = {
                  instancePath: instancePath + "/metadata/channelId",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/channelId/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err14]
                } else {
                  vErrors.push(err14)
                }
                errors++
              }
            }
            if (data3.channelImageAvatarSrc !== undefined) {
              if (typeof data3.channelImageAvatarSrc !== "string") {
                const err15 = {
                  instancePath:
                    instancePath + "/metadata/channelImageAvatarSrc",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/channelImageAvatarSrc/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err15]
                } else {
                  vErrors.push(err15)
                }
                errors++
              }
            }
            if (data3.channelName !== undefined) {
              if (typeof data3.channelName !== "string") {
                const err16 = {
                  instancePath: instancePath + "/metadata/channelName",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/channelName/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err16]
                } else {
                  vErrors.push(err16)
                }
                errors++
              }
            }
            if (data3.liveTimeElapsed !== undefined) {
              if (typeof data3.liveTimeElapsed !== "string") {
                const err17 = {
                  instancePath: instancePath + "/metadata/liveTimeElapsed",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/liveTimeElapsed/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err17]
                } else {
                  vErrors.push(err17)
                }
                errors++
              }
            }
            if (data3.tags !== undefined) {
              if (typeof data3.tags !== "string") {
                const err18 = {
                  instancePath: instancePath + "/metadata/tags",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/tags/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err18]
                } else {
                  vErrors.push(err18)
                }
                errors++
              }
            }
            if (data3.title !== undefined) {
              if (typeof data3.title !== "string") {
                const err19 = {
                  instancePath: instancePath + "/metadata/title",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/title/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err19]
                } else {
                  vErrors.push(err19)
                }
                errors++
              }
            }
            if (data3.viewersCount !== undefined) {
              if (typeof data3.viewersCount !== "string") {
                const err20 = {
                  instancePath: instancePath + "/metadata/viewersCount",
                  schemaPath:
                    "#/definitions/TwitchLiveMetadata/properties/viewersCount/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err20]
                } else {
                  vErrors.push(err20)
                }
                errors++
              }
            }
          } else {
            const err21 = {
              instancePath: instancePath + "/metadata",
              schemaPath: "#/definitions/TwitchLiveMetadata/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err21]
            } else {
              vErrors.push(err21)
            }
            errors++
          }
          var _valid0 = _errs25 === errors
          valid1 = valid1 || _valid0
        }
      }
      if (!valid1) {
        const err22 = {
          instancePath: instancePath + "/metadata",
          schemaPath: "#/properties/metadata/anyOf",
          keyword: "anyOf",
          params: {},
          message: "must match a schema in anyOf"
        }
        if (vErrors === null) {
          vErrors = [err22]
        } else {
          vErrors.push(err22)
        }
        errors++
      } else {
        errors = _errs8
        if (vErrors !== null) {
          if (_errs8) {
            vErrors.length = _errs8
          } else {
            vErrors = null
          }
        }
      }
    }
    if (data.platform !== undefined) {
      if (typeof data.platform !== "string") {
        const err23 = {
          instancePath: instancePath + "/platform",
          schemaPath: "#/properties/platform/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err23]
        } else {
          vErrors.push(err23)
        }
        errors++
      }
    }
    if (data.tabId !== undefined) {
      if (typeof data.tabId !== "string") {
        const err24 = {
          instancePath: instancePath + "/tabId",
          schemaPath: "#/properties/tabId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err24]
        } else {
          vErrors.push(err24)
        }
        errors++
      }
    }
    if (data.type !== undefined) {
      let data22 = data.type
      if (typeof data22 !== "string") {
        const err25 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err25]
        } else {
          vErrors.push(err25)
        }
        errors++
      }
      if ("BROWSE_VIEW" !== data22) {
        const err26 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "BROWSE_VIEW" },
          message: "must be equal to constant"
        }
        if (vErrors === null) {
          vErrors = [err26]
        } else {
          vErrors.push(err26)
        }
        errors++
      }
    }
    if (data.url !== undefined) {
      if (typeof data.url !== "string") {
        const err27 = {
          instancePath: instancePath + "/url",
          schemaPath: "#/properties/url/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err27]
        } else {
          vErrors.push(err27)
        }
        errors++
      }
    }
    if (data.viewType !== undefined) {
      if (typeof data.viewType !== "string") {
        const err28 = {
          instancePath: instancePath + "/viewType",
          schemaPath: "#/properties/viewType/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err28]
        } else {
          vErrors.push(err28)
        }
        errors++
      }
    }
  } else {
    const err29 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err29]
    } else {
      vErrors.push(err29)
    }
    errors++
  }
  validate24.errors = vErrors
  return errors === 0
}
const schema36 = {
  properties: {
    date: { format: "date-time", type: "string" },
    id: { type: "string" },
    injectionId: { type: "string" },
    messages: {
      items: { $ref: "#/definitions/TwitchMessageRecord" },
      type: "array"
    },
    messagesAverageCharLength: { type: "number" },
    messagesCount: { type: "number" },
    platform: { type: "string" },
    tabId: { type: "string" },
    timeSpan: { type: "number" },
    type: { const: "CHAT_ACTIVITY_RECORD", type: "string" },
    url: { type: "string" },
    viewersCount: { type: "number" }
  },
  type: "object"
}
const schema37 = {
  properties: {
    author: { type: "string" },
    emote: { $ref: "#/definitions/EmoteFromChat" },
    message: { type: "string" }
  },
  type: "object"
}
const schema38 = {
  properties: { alt: { type: "string" }, src: { type: "string" } },
  type: "object"
}
function validate29(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.author !== undefined) {
      if (typeof data.author !== "string") {
        const err0 = {
          instancePath: instancePath + "/author",
          schemaPath: "#/properties/author/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err0]
        } else {
          vErrors.push(err0)
        }
        errors++
      }
    }
    if (data.emote !== undefined) {
      let data1 = data.emote
      if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
        if (data1.alt !== undefined) {
          if (typeof data1.alt !== "string") {
            const err1 = {
              instancePath: instancePath + "/emote/alt",
              schemaPath: "#/definitions/EmoteFromChat/properties/alt/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err1]
            } else {
              vErrors.push(err1)
            }
            errors++
          }
        }
        if (data1.src !== undefined) {
          if (typeof data1.src !== "string") {
            const err2 = {
              instancePath: instancePath + "/emote/src",
              schemaPath: "#/definitions/EmoteFromChat/properties/src/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err2]
            } else {
              vErrors.push(err2)
            }
            errors++
          }
        }
      } else {
        const err3 = {
          instancePath: instancePath + "/emote",
          schemaPath: "#/definitions/EmoteFromChat/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err3]
        } else {
          vErrors.push(err3)
        }
        errors++
      }
    }
    if (data.message !== undefined) {
      if (typeof data.message !== "string") {
        const err4 = {
          instancePath: instancePath + "/message",
          schemaPath: "#/properties/message/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err4]
        } else {
          vErrors.push(err4)
        }
        errors++
      }
    }
  } else {
    const err5 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err5]
    } else {
      vErrors.push(err5)
    }
    errors++
  }
  validate29.errors = vErrors
  return errors === 0
}
function validate28(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.date !== undefined) {
      let data0 = data.date
      if (typeof data0 === "string") {
        if (!formats0.validate(data0)) {
          const err0 = {
            instancePath: instancePath + "/date",
            schemaPath: "#/properties/date/format",
            keyword: "format",
            params: { format: "date-time" },
            message: 'must match format "' + "date-time" + '"'
          }
          if (vErrors === null) {
            vErrors = [err0]
          } else {
            vErrors.push(err0)
          }
          errors++
        }
      } else {
        const err1 = {
          instancePath: instancePath + "/date",
          schemaPath: "#/properties/date/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err1]
        } else {
          vErrors.push(err1)
        }
        errors++
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err2 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err2]
        } else {
          vErrors.push(err2)
        }
        errors++
      }
    }
    if (data.injectionId !== undefined) {
      if (typeof data.injectionId !== "string") {
        const err3 = {
          instancePath: instancePath + "/injectionId",
          schemaPath: "#/properties/injectionId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err3]
        } else {
          vErrors.push(err3)
        }
        errors++
      }
    }
    if (data.messages !== undefined) {
      let data3 = data.messages
      if (Array.isArray(data3)) {
        const len0 = data3.length
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate29(data3[i0], {
              instancePath: instancePath + "/messages/" + i0,
              parentData: data3,
              parentDataProperty: i0,
              rootData
            })
          ) {
            vErrors =
              vErrors === null
                ? validate29.errors
                : vErrors.concat(validate29.errors)
            errors = vErrors.length
          }
        }
      } else {
        const err4 = {
          instancePath: instancePath + "/messages",
          schemaPath: "#/properties/messages/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err4]
        } else {
          vErrors.push(err4)
        }
        errors++
      }
    }
    if (data.messagesAverageCharLength !== undefined) {
      let data5 = data.messagesAverageCharLength
      if (!(typeof data5 == "number" && isFinite(data5))) {
        const err5 = {
          instancePath: instancePath + "/messagesAverageCharLength",
          schemaPath: "#/properties/messagesAverageCharLength/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number"
        }
        if (vErrors === null) {
          vErrors = [err5]
        } else {
          vErrors.push(err5)
        }
        errors++
      }
    }
    if (data.messagesCount !== undefined) {
      let data6 = data.messagesCount
      if (!(typeof data6 == "number" && isFinite(data6))) {
        const err6 = {
          instancePath: instancePath + "/messagesCount",
          schemaPath: "#/properties/messagesCount/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number"
        }
        if (vErrors === null) {
          vErrors = [err6]
        } else {
          vErrors.push(err6)
        }
        errors++
      }
    }
    if (data.platform !== undefined) {
      if (typeof data.platform !== "string") {
        const err7 = {
          instancePath: instancePath + "/platform",
          schemaPath: "#/properties/platform/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err7]
        } else {
          vErrors.push(err7)
        }
        errors++
      }
    }
    if (data.tabId !== undefined) {
      if (typeof data.tabId !== "string") {
        const err8 = {
          instancePath: instancePath + "/tabId",
          schemaPath: "#/properties/tabId/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err8]
        } else {
          vErrors.push(err8)
        }
        errors++
      }
    }
    if (data.timeSpan !== undefined) {
      let data9 = data.timeSpan
      if (!(typeof data9 == "number" && isFinite(data9))) {
        const err9 = {
          instancePath: instancePath + "/timeSpan",
          schemaPath: "#/properties/timeSpan/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number"
        }
        if (vErrors === null) {
          vErrors = [err9]
        } else {
          vErrors.push(err9)
        }
        errors++
      }
    }
    if (data.type !== undefined) {
      let data10 = data.type
      if (typeof data10 !== "string") {
        const err10 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err10]
        } else {
          vErrors.push(err10)
        }
        errors++
      }
      if ("CHAT_ACTIVITY_RECORD" !== data10) {
        const err11 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: { allowedValue: "CHAT_ACTIVITY_RECORD" },
          message: "must be equal to constant"
        }
        if (vErrors === null) {
          vErrors = [err11]
        } else {
          vErrors.push(err11)
        }
        errors++
      }
    }
    if (data.url !== undefined) {
      if (typeof data.url !== "string") {
        const err12 = {
          instancePath: instancePath + "/url",
          schemaPath: "#/properties/url/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err12]
        } else {
          vErrors.push(err12)
        }
        errors++
      }
    }
    if (data.viewersCount !== undefined) {
      let data12 = data.viewersCount
      if (!(typeof data12 == "number" && isFinite(data12))) {
        const err13 = {
          instancePath: instancePath + "/viewersCount",
          schemaPath: "#/properties/viewersCount/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number"
        }
        if (vErrors === null) {
          vErrors = [err13]
        } else {
          vErrors.push(err13)
        }
        errors++
      }
    }
  } else {
    const err14 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err14]
    } else {
      vErrors.push(err14)
    }
    errors++
  }
  validate28.errors = vErrors
  return errors === 0
}
function validate21(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  const _errs0 = errors
  let valid0 = false
  const _errs1 = errors
  if (
    !validate22(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData
    })
  ) {
    vErrors =
      vErrors === null ? validate22.errors : vErrors.concat(validate22.errors)
    errors = vErrors.length
  }
  var _valid0 = _errs1 === errors
  valid0 = valid0 || _valid0
  if (!valid0) {
    const _errs2 = errors
    if (data && typeof data == "object" && !Array.isArray(data)) {
      if (data.date !== undefined) {
        let data0 = data.date
        if (typeof data0 === "string") {
          if (!formats0.validate(data0)) {
            const err0 = {
              instancePath: instancePath + "/date",
              schemaPath:
                "#/definitions/ClosePlatformInTabEvent/properties/date/format",
              keyword: "format",
              params: { format: "date-time" },
              message: 'must match format "' + "date-time" + '"'
            }
            if (vErrors === null) {
              vErrors = [err0]
            } else {
              vErrors.push(err0)
            }
            errors++
          }
        } else {
          const err1 = {
            instancePath: instancePath + "/date",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/date/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err1]
          } else {
            vErrors.push(err1)
          }
          errors++
        }
      }
      if (data.id !== undefined) {
        if (typeof data.id !== "string") {
          const err2 = {
            instancePath: instancePath + "/id",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/id/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err2]
          } else {
            vErrors.push(err2)
          }
          errors++
        }
      }
      if (data.injectionId !== undefined) {
        if (typeof data.injectionId !== "string") {
          const err3 = {
            instancePath: instancePath + "/injectionId",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/injectionId/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err3]
          } else {
            vErrors.push(err3)
          }
          errors++
        }
      }
      if (data.platform !== undefined) {
        if (typeof data.platform !== "string") {
          const err4 = {
            instancePath: instancePath + "/platform",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/platform/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err4]
          } else {
            vErrors.push(err4)
          }
          errors++
        }
      }
      if (data.tabId !== undefined) {
        if (typeof data.tabId !== "string") {
          const err5 = {
            instancePath: instancePath + "/tabId",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/tabId/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err5]
          } else {
            vErrors.push(err5)
          }
          errors++
        }
      }
      if (data.type !== undefined) {
        let data5 = data.type
        if (typeof data5 !== "string") {
          const err6 = {
            instancePath: instancePath + "/type",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/type/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err6]
          } else {
            vErrors.push(err6)
          }
          errors++
        }
        if ("CLOSE_PLATFORM_IN_TAB" !== data5) {
          const err7 = {
            instancePath: instancePath + "/type",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/type/const",
            keyword: "const",
            params: { allowedValue: "CLOSE_PLATFORM_IN_TAB" },
            message: "must be equal to constant"
          }
          if (vErrors === null) {
            vErrors = [err7]
          } else {
            vErrors.push(err7)
          }
          errors++
        }
      }
      if (data.url !== undefined) {
        if (typeof data.url !== "string") {
          const err8 = {
            instancePath: instancePath + "/url",
            schemaPath:
              "#/definitions/ClosePlatformInTabEvent/properties/url/type",
            keyword: "type",
            params: { type: "string" },
            message: "must be string"
          }
          if (vErrors === null) {
            vErrors = [err8]
          } else {
            vErrors.push(err8)
          }
          errors++
        }
      }
    } else {
      const err9 = {
        instancePath,
        schemaPath: "#/definitions/ClosePlatformInTabEvent/type",
        keyword: "type",
        params: { type: "object" },
        message: "must be object"
      }
      if (vErrors === null) {
        vErrors = [err9]
      } else {
        vErrors.push(err9)
      }
      errors++
    }
    var _valid0 = _errs2 === errors
    valid0 = valid0 || _valid0
    if (!valid0) {
      const _errs19 = errors
      if (data && typeof data == "object" && !Array.isArray(data)) {
        if (data.date !== undefined) {
          let data7 = data.date
          if (typeof data7 === "string") {
            if (!formats0.validate(data7)) {
              const err10 = {
                instancePath: instancePath + "/date",
                schemaPath: "#/definitions/BlurTabEvent/properties/date/format",
                keyword: "format",
                params: { format: "date-time" },
                message: 'must match format "' + "date-time" + '"'
              }
              if (vErrors === null) {
                vErrors = [err10]
              } else {
                vErrors.push(err10)
              }
              errors++
            }
          } else {
            const err11 = {
              instancePath: instancePath + "/date",
              schemaPath: "#/definitions/BlurTabEvent/properties/date/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err11]
            } else {
              vErrors.push(err11)
            }
            errors++
          }
        }
        if (data.id !== undefined) {
          if (typeof data.id !== "string") {
            const err12 = {
              instancePath: instancePath + "/id",
              schemaPath: "#/definitions/BlurTabEvent/properties/id/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err12]
            } else {
              vErrors.push(err12)
            }
            errors++
          }
        }
        if (data.injectionId !== undefined) {
          if (typeof data.injectionId !== "string") {
            const err13 = {
              instancePath: instancePath + "/injectionId",
              schemaPath:
                "#/definitions/BlurTabEvent/properties/injectionId/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err13]
            } else {
              vErrors.push(err13)
            }
            errors++
          }
        }
        if (data.platform !== undefined) {
          if (typeof data.platform !== "string") {
            const err14 = {
              instancePath: instancePath + "/platform",
              schemaPath: "#/definitions/BlurTabEvent/properties/platform/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err14]
            } else {
              vErrors.push(err14)
            }
            errors++
          }
        }
        if (data.tabId !== undefined) {
          if (typeof data.tabId !== "string") {
            const err15 = {
              instancePath: instancePath + "/tabId",
              schemaPath: "#/definitions/BlurTabEvent/properties/tabId/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err15]
            } else {
              vErrors.push(err15)
            }
            errors++
          }
        }
        if (data.type !== undefined) {
          let data12 = data.type
          if (typeof data12 !== "string") {
            const err16 = {
              instancePath: instancePath + "/type",
              schemaPath: "#/definitions/BlurTabEvent/properties/type/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err16]
            } else {
              vErrors.push(err16)
            }
            errors++
          }
          if ("BLUR_TAB" !== data12) {
            const err17 = {
              instancePath: instancePath + "/type",
              schemaPath: "#/definitions/BlurTabEvent/properties/type/const",
              keyword: "const",
              params: { allowedValue: "BLUR_TAB" },
              message: "must be equal to constant"
            }
            if (vErrors === null) {
              vErrors = [err17]
            } else {
              vErrors.push(err17)
            }
            errors++
          }
        }
        if (data.url !== undefined) {
          if (typeof data.url !== "string") {
            const err18 = {
              instancePath: instancePath + "/url",
              schemaPath: "#/definitions/BlurTabEvent/properties/url/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err18]
            } else {
              vErrors.push(err18)
            }
            errors++
          }
        }
      } else {
        const err19 = {
          instancePath,
          schemaPath: "#/definitions/BlurTabEvent/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err19]
        } else {
          vErrors.push(err19)
        }
        errors++
      }
      var _valid0 = _errs19 === errors
      valid0 = valid0 || _valid0
      if (!valid0) {
        const _errs36 = errors
        if (data && typeof data == "object" && !Array.isArray(data)) {
          if (data.date !== undefined) {
            let data14 = data.date
            if (typeof data14 === "string") {
              if (!formats0.validate(data14)) {
                const err20 = {
                  instancePath: instancePath + "/date",
                  schemaPath:
                    "#/definitions/FocusTabEvent/properties/date/format",
                  keyword: "format",
                  params: { format: "date-time" },
                  message: 'must match format "' + "date-time" + '"'
                }
                if (vErrors === null) {
                  vErrors = [err20]
                } else {
                  vErrors.push(err20)
                }
                errors++
              }
            } else {
              const err21 = {
                instancePath: instancePath + "/date",
                schemaPath: "#/definitions/FocusTabEvent/properties/date/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err21]
              } else {
                vErrors.push(err21)
              }
              errors++
            }
          }
          if (data.id !== undefined) {
            if (typeof data.id !== "string") {
              const err22 = {
                instancePath: instancePath + "/id",
                schemaPath: "#/definitions/FocusTabEvent/properties/id/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err22]
              } else {
                vErrors.push(err22)
              }
              errors++
            }
          }
          if (data.injectionId !== undefined) {
            if (typeof data.injectionId !== "string") {
              const err23 = {
                instancePath: instancePath + "/injectionId",
                schemaPath:
                  "#/definitions/FocusTabEvent/properties/injectionId/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err23]
              } else {
                vErrors.push(err23)
              }
              errors++
            }
          }
          if (data.platform !== undefined) {
            if (typeof data.platform !== "string") {
              const err24 = {
                instancePath: instancePath + "/platform",
                schemaPath:
                  "#/definitions/FocusTabEvent/properties/platform/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err24]
              } else {
                vErrors.push(err24)
              }
              errors++
            }
          }
          if (data.tabId !== undefined) {
            if (typeof data.tabId !== "string") {
              const err25 = {
                instancePath: instancePath + "/tabId",
                schemaPath: "#/definitions/FocusTabEvent/properties/tabId/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err25]
              } else {
                vErrors.push(err25)
              }
              errors++
            }
          }
          if (data.type !== undefined) {
            let data19 = data.type
            if (typeof data19 !== "string") {
              const err26 = {
                instancePath: instancePath + "/type",
                schemaPath: "#/definitions/FocusTabEvent/properties/type/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err26]
              } else {
                vErrors.push(err26)
              }
              errors++
            }
            if ("FOCUS_TAB" !== data19) {
              const err27 = {
                instancePath: instancePath + "/type",
                schemaPath: "#/definitions/FocusTabEvent/properties/type/const",
                keyword: "const",
                params: { allowedValue: "FOCUS_TAB" },
                message: "must be equal to constant"
              }
              if (vErrors === null) {
                vErrors = [err27]
              } else {
                vErrors.push(err27)
              }
              errors++
            }
          }
          if (data.url !== undefined) {
            if (typeof data.url !== "string") {
              const err28 = {
                instancePath: instancePath + "/url",
                schemaPath: "#/definitions/FocusTabEvent/properties/url/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string"
              }
              if (vErrors === null) {
                vErrors = [err28]
              } else {
                vErrors.push(err28)
              }
              errors++
            }
          }
        } else {
          const err29 = {
            instancePath,
            schemaPath: "#/definitions/FocusTabEvent/type",
            keyword: "type",
            params: { type: "object" },
            message: "must be object"
          }
          if (vErrors === null) {
            vErrors = [err29]
          } else {
            vErrors.push(err29)
          }
          errors++
        }
        var _valid0 = _errs36 === errors
        valid0 = valid0 || _valid0
        if (!valid0) {
          const _errs53 = errors
          if (
            !validate24(data, {
              instancePath,
              parentData,
              parentDataProperty,
              rootData
            })
          ) {
            vErrors =
              vErrors === null
                ? validate24.errors
                : vErrors.concat(validate24.errors)
            errors = vErrors.length
          }
          var _valid0 = _errs53 === errors
          valid0 = valid0 || _valid0
          if (!valid0) {
            const _errs54 = errors
            if (data && typeof data == "object" && !Array.isArray(data)) {
              if (data.date !== undefined) {
                let data21 = data.date
                if (typeof data21 === "string") {
                  if (!formats0.validate(data21)) {
                    const err30 = {
                      instancePath: instancePath + "/date",
                      schemaPath:
                        "#/definitions/FocusOnReactionInputEvent/properties/date/format",
                      keyword: "format",
                      params: { format: "date-time" },
                      message: 'must match format "' + "date-time" + '"'
                    }
                    if (vErrors === null) {
                      vErrors = [err30]
                    } else {
                      vErrors.push(err30)
                    }
                    errors++
                  }
                } else {
                  const err31 = {
                    instancePath: instancePath + "/date",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/date/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err31]
                  } else {
                    vErrors.push(err31)
                  }
                  errors++
                }
              }
              if (data.id !== undefined) {
                if (typeof data.id !== "string") {
                  const err32 = {
                    instancePath: instancePath + "/id",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/id/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err32]
                  } else {
                    vErrors.push(err32)
                  }
                  errors++
                }
              }
              if (data.injectionId !== undefined) {
                if (typeof data.injectionId !== "string") {
                  const err33 = {
                    instancePath: instancePath + "/injectionId",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/injectionId/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err33]
                  } else {
                    vErrors.push(err33)
                  }
                  errors++
                }
              }
              if (data.platform !== undefined) {
                if (typeof data.platform !== "string") {
                  const err34 = {
                    instancePath: instancePath + "/platform",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/platform/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err34]
                  } else {
                    vErrors.push(err34)
                  }
                  errors++
                }
              }
              if (data.tabId !== undefined) {
                if (typeof data.tabId !== "string") {
                  const err35 = {
                    instancePath: instancePath + "/tabId",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/tabId/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err35]
                  } else {
                    vErrors.push(err35)
                  }
                  errors++
                }
              }
              if (data.type !== undefined) {
                let data26 = data.type
                if (typeof data26 !== "string") {
                  const err36 = {
                    instancePath: instancePath + "/type",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/type/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err36]
                  } else {
                    vErrors.push(err36)
                  }
                  errors++
                }
                if ("FOCUS_ON_REACTION_INPUT" !== data26) {
                  const err37 = {
                    instancePath: instancePath + "/type",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/type/const",
                    keyword: "const",
                    params: { allowedValue: "FOCUS_ON_REACTION_INPUT" },
                    message: "must be equal to constant"
                  }
                  if (vErrors === null) {
                    vErrors = [err37]
                  } else {
                    vErrors.push(err37)
                  }
                  errors++
                }
              }
              if (data.url !== undefined) {
                if (typeof data.url !== "string") {
                  const err38 = {
                    instancePath: instancePath + "/url",
                    schemaPath:
                      "#/definitions/FocusOnReactionInputEvent/properties/url/type",
                    keyword: "type",
                    params: { type: "string" },
                    message: "must be string"
                  }
                  if (vErrors === null) {
                    vErrors = [err38]
                  } else {
                    vErrors.push(err38)
                  }
                  errors++
                }
              }
            } else {
              const err39 = {
                instancePath,
                schemaPath: "#/definitions/FocusOnReactionInputEvent/type",
                keyword: "type",
                params: { type: "object" },
                message: "must be object"
              }
              if (vErrors === null) {
                vErrors = [err39]
              } else {
                vErrors.push(err39)
              }
              errors++
            }
            var _valid0 = _errs54 === errors
            valid0 = valid0 || _valid0
            if (!valid0) {
              const _errs71 = errors
              if (data && typeof data == "object" && !Array.isArray(data)) {
                if (data.date !== undefined) {
                  let data28 = data.date
                  if (typeof data28 === "string") {
                    if (!formats0.validate(data28)) {
                      const err40 = {
                        instancePath: instancePath + "/date",
                        schemaPath:
                          "#/definitions/BlurOnReactionInputEvent/properties/date/format",
                        keyword: "format",
                        params: { format: "date-time" },
                        message: 'must match format "' + "date-time" + '"'
                      }
                      if (vErrors === null) {
                        vErrors = [err40]
                      } else {
                        vErrors.push(err40)
                      }
                      errors++
                    }
                  } else {
                    const err41 = {
                      instancePath: instancePath + "/date",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/date/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err41]
                    } else {
                      vErrors.push(err41)
                    }
                    errors++
                  }
                }
                if (data.id !== undefined) {
                  if (typeof data.id !== "string") {
                    const err42 = {
                      instancePath: instancePath + "/id",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/id/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err42]
                    } else {
                      vErrors.push(err42)
                    }
                    errors++
                  }
                }
                if (data.injectionId !== undefined) {
                  if (typeof data.injectionId !== "string") {
                    const err43 = {
                      instancePath: instancePath + "/injectionId",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/injectionId/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err43]
                    } else {
                      vErrors.push(err43)
                    }
                    errors++
                  }
                }
                if (data.platform !== undefined) {
                  if (typeof data.platform !== "string") {
                    const err44 = {
                      instancePath: instancePath + "/platform",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/platform/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err44]
                    } else {
                      vErrors.push(err44)
                    }
                    errors++
                  }
                }
                if (data.tabId !== undefined) {
                  if (typeof data.tabId !== "string") {
                    const err45 = {
                      instancePath: instancePath + "/tabId",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/tabId/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err45]
                    } else {
                      vErrors.push(err45)
                    }
                    errors++
                  }
                }
                if (data.type !== undefined) {
                  let data33 = data.type
                  if (typeof data33 !== "string") {
                    const err46 = {
                      instancePath: instancePath + "/type",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/type/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err46]
                    } else {
                      vErrors.push(err46)
                    }
                    errors++
                  }
                  if ("BLUR_ON_REACTION_INPUT" !== data33) {
                    const err47 = {
                      instancePath: instancePath + "/type",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/type/const",
                      keyword: "const",
                      params: { allowedValue: "BLUR_ON_REACTION_INPUT" },
                      message: "must be equal to constant"
                    }
                    if (vErrors === null) {
                      vErrors = [err47]
                    } else {
                      vErrors.push(err47)
                    }
                    errors++
                  }
                }
                if (data.url !== undefined) {
                  if (typeof data.url !== "string") {
                    const err48 = {
                      instancePath: instancePath + "/url",
                      schemaPath:
                        "#/definitions/BlurOnReactionInputEvent/properties/url/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err48]
                    } else {
                      vErrors.push(err48)
                    }
                    errors++
                  }
                }
              } else {
                const err49 = {
                  instancePath,
                  schemaPath: "#/definitions/BlurOnReactionInputEvent/type",
                  keyword: "type",
                  params: { type: "object" },
                  message: "must be object"
                }
                if (vErrors === null) {
                  vErrors = [err49]
                } else {
                  vErrors.push(err49)
                }
                errors++
              }
              var _valid0 = _errs71 === errors
              valid0 = valid0 || _valid0
              if (!valid0) {
                const _errs88 = errors
                if (
                  !validate28(data, {
                    instancePath,
                    parentData,
                    parentDataProperty,
                    rootData
                  })
                ) {
                  vErrors =
                    vErrors === null
                      ? validate28.errors
                      : vErrors.concat(validate28.errors)
                  errors = vErrors.length
                }
                var _valid0 = _errs88 === errors
                valid0 = valid0 || _valid0
                if (!valid0) {
                  const _errs89 = errors
                  if (data && typeof data == "object" && !Array.isArray(data)) {
                    if (data.currentMediaTime !== undefined) {
                      if (typeof data.currentMediaTime !== "string") {
                        const err50 = {
                          instancePath: instancePath + "/currentMediaTime",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/currentMediaTime/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err50]
                        } else {
                          vErrors.push(err50)
                        }
                        errors++
                      }
                    }
                    if (data.date !== undefined) {
                      let data36 = data.date
                      if (typeof data36 === "string") {
                        if (!formats0.validate(data36)) {
                          const err51 = {
                            instancePath: instancePath + "/date",
                            schemaPath:
                              "#/definitions/LiveUserActivityRecordEvent/properties/date/format",
                            keyword: "format",
                            params: { format: "date-time" },
                            message: 'must match format "' + "date-time" + '"'
                          }
                          if (vErrors === null) {
                            vErrors = [err51]
                          } else {
                            vErrors.push(err51)
                          }
                          errors++
                        }
                      } else {
                        const err52 = {
                          instancePath: instancePath + "/date",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/date/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err52]
                        } else {
                          vErrors.push(err52)
                        }
                        errors++
                      }
                    }
                    if (data.hasFocus !== undefined) {
                      if (typeof data.hasFocus !== "boolean") {
                        const err53 = {
                          instancePath: instancePath + "/hasFocus",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/hasFocus/type",
                          keyword: "type",
                          params: { type: "boolean" },
                          message: "must be boolean"
                        }
                        if (vErrors === null) {
                          vErrors = [err53]
                        } else {
                          vErrors.push(err53)
                        }
                        errors++
                      }
                    }
                    if (data.id !== undefined) {
                      if (typeof data.id !== "string") {
                        const err54 = {
                          instancePath: instancePath + "/id",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/id/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err54]
                        } else {
                          vErrors.push(err54)
                        }
                        errors++
                      }
                    }
                    if (data.injectionId !== undefined) {
                      if (typeof data.injectionId !== "string") {
                        const err55 = {
                          instancePath: instancePath + "/injectionId",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/injectionId/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err55]
                        } else {
                          vErrors.push(err55)
                        }
                        errors++
                      }
                    }
                    if (data.isPlaying !== undefined) {
                      if (typeof data.isPlaying !== "boolean") {
                        const err56 = {
                          instancePath: instancePath + "/isPlaying",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/isPlaying/type",
                          keyword: "type",
                          params: { type: "boolean" },
                          message: "must be boolean"
                        }
                        if (vErrors === null) {
                          vErrors = [err56]
                        } else {
                          vErrors.push(err56)
                        }
                        errors++
                      }
                    }
                    if (data.platform !== undefined) {
                      if (typeof data.platform !== "string") {
                        const err57 = {
                          instancePath: instancePath + "/platform",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/platform/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err57]
                        } else {
                          vErrors.push(err57)
                        }
                        errors++
                      }
                    }
                    if (data.pointerActivityScore !== undefined) {
                      let data42 = data.pointerActivityScore
                      if (!(typeof data42 == "number" && isFinite(data42))) {
                        const err58 = {
                          instancePath: instancePath + "/pointerActivityScore",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/pointerActivityScore/type",
                          keyword: "type",
                          params: { type: "number" },
                          message: "must be number"
                        }
                        if (vErrors === null) {
                          vErrors = [err58]
                        } else {
                          vErrors.push(err58)
                        }
                        errors++
                      }
                    }
                    if (data.tabId !== undefined) {
                      if (typeof data.tabId !== "string") {
                        const err59 = {
                          instancePath: instancePath + "/tabId",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/tabId/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err59]
                        } else {
                          vErrors.push(err59)
                        }
                        errors++
                      }
                    }
                    if (data.timeSpan !== undefined) {
                      let data44 = data.timeSpan
                      if (!(typeof data44 == "number" && isFinite(data44))) {
                        const err60 = {
                          instancePath: instancePath + "/timeSpan",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/timeSpan/type",
                          keyword: "type",
                          params: { type: "number" },
                          message: "must be number"
                        }
                        if (vErrors === null) {
                          vErrors = [err60]
                        } else {
                          vErrors.push(err60)
                        }
                        errors++
                      }
                    }
                    if (data.type !== undefined) {
                      let data45 = data.type
                      if (typeof data45 !== "string") {
                        const err61 = {
                          instancePath: instancePath + "/type",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/type/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err61]
                        } else {
                          vErrors.push(err61)
                        }
                        errors++
                      }
                      if ("LIVE_USER_ACTIVITY_RECORD" !== data45) {
                        const err62 = {
                          instancePath: instancePath + "/type",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/type/const",
                          keyword: "const",
                          params: { allowedValue: "LIVE_USER_ACTIVITY_RECORD" },
                          message: "must be equal to constant"
                        }
                        if (vErrors === null) {
                          vErrors = [err62]
                        } else {
                          vErrors.push(err62)
                        }
                        errors++
                      }
                    }
                    if (data.url !== undefined) {
                      if (typeof data.url !== "string") {
                        const err63 = {
                          instancePath: instancePath + "/url",
                          schemaPath:
                            "#/definitions/LiveUserActivityRecordEvent/properties/url/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err63]
                        } else {
                          vErrors.push(err63)
                        }
                        errors++
                      }
                    }
                  } else {
                    const err64 = {
                      instancePath,
                      schemaPath:
                        "#/definitions/LiveUserActivityRecordEvent/type",
                      keyword: "type",
                      params: { type: "object" },
                      message: "must be object"
                    }
                    if (vErrors === null) {
                      vErrors = [err64]
                    } else {
                      vErrors.push(err64)
                    }
                    errors++
                  }
                  var _valid0 = _errs89 === errors
                  valid0 = valid0 || _valid0
                }
              }
            }
          }
        }
      }
    }
  }
  if (!valid0) {
    const err65 = {
      instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf"
    }
    if (vErrors === null) {
      vErrors = [err65]
    } else {
      vErrors.push(err65)
    }
    errors++
  } else {
    errors = _errs0
    if (vErrors !== null) {
      if (_errs0) {
        vErrors.length = _errs0
      } else {
        vErrors = null
      }
    }
  }
  validate21.errors = vErrors
  return errors === 0
}
const schema40 = {
  properties: {
    creators: {
      additionalProperties: { $ref: "#/definitions/Creator" },
      type: "object"
    },
    expressions: {
      additionalProperties: { $ref: "#/definitions/Expression" },
      type: "object"
    },
    tags: {
      additionalProperties: { $ref: "#/definitions/Tag" },
      type: "object"
    }
  },
  type: "object"
}
const schema41 = {
  properties: {
    channels: { items: { type: "string" }, type: "array" },
    description: { type: "string" },
    id: { type: "string" },
    links: {
      properties: { tags: { items: { type: "string" }, type: "array" } },
      type: "object"
    },
    name: { type: "string" }
  },
  type: "object"
}
const schema44 = {
  properties: {
    color: { type: "string" },
    description: { type: "string" },
    id: { type: "string" },
    name: { type: "string" }
  },
  type: "object"
}
const schema42 = {
  properties: {
    definition: { type: "string" },
    id: { type: "string" },
    links: {
      properties: {
        creators: { items: { type: "string" }, type: "array" },
        tags: { items: { type: "string" }, type: "array" }
      },
      type: "object"
    },
    name: { type: "string" },
    queries: { items: { $ref: "#/definitions/Query" }, type: "array" }
  },
  type: "object"
}
const schema43 = {
  properties: { id: { type: "string" }, query: { type: "string" } },
  type: "object"
}
function validate34(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.definition !== undefined) {
      if (typeof data.definition !== "string") {
        const err0 = {
          instancePath: instancePath + "/definition",
          schemaPath: "#/properties/definition/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err0]
        } else {
          vErrors.push(err0)
        }
        errors++
      }
    }
    if (data.id !== undefined) {
      if (typeof data.id !== "string") {
        const err1 = {
          instancePath: instancePath + "/id",
          schemaPath: "#/properties/id/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err1]
        } else {
          vErrors.push(err1)
        }
        errors++
      }
    }
    if (data.links !== undefined) {
      let data2 = data.links
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.creators !== undefined) {
          let data3 = data2.creators
          if (Array.isArray(data3)) {
            const len0 = data3.length
            for (let i0 = 0; i0 < len0; i0++) {
              if (typeof data3[i0] !== "string") {
                const err2 = {
                  instancePath: instancePath + "/links/creators/" + i0,
                  schemaPath:
                    "#/properties/links/properties/creators/items/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err2]
                } else {
                  vErrors.push(err2)
                }
                errors++
              }
            }
          } else {
            const err3 = {
              instancePath: instancePath + "/links/creators",
              schemaPath: "#/properties/links/properties/creators/type",
              keyword: "type",
              params: { type: "array" },
              message: "must be array"
            }
            if (vErrors === null) {
              vErrors = [err3]
            } else {
              vErrors.push(err3)
            }
            errors++
          }
        }
        if (data2.tags !== undefined) {
          let data5 = data2.tags
          if (Array.isArray(data5)) {
            const len1 = data5.length
            for (let i1 = 0; i1 < len1; i1++) {
              if (typeof data5[i1] !== "string") {
                const err4 = {
                  instancePath: instancePath + "/links/tags/" + i1,
                  schemaPath: "#/properties/links/properties/tags/items/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err4]
                } else {
                  vErrors.push(err4)
                }
                errors++
              }
            }
          } else {
            const err5 = {
              instancePath: instancePath + "/links/tags",
              schemaPath: "#/properties/links/properties/tags/type",
              keyword: "type",
              params: { type: "array" },
              message: "must be array"
            }
            if (vErrors === null) {
              vErrors = [err5]
            } else {
              vErrors.push(err5)
            }
            errors++
          }
        }
      } else {
        const err6 = {
          instancePath: instancePath + "/links",
          schemaPath: "#/properties/links/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err6]
        } else {
          vErrors.push(err6)
        }
        errors++
      }
    }
    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        const err7 = {
          instancePath: instancePath + "/name",
          schemaPath: "#/properties/name/type",
          keyword: "type",
          params: { type: "string" },
          message: "must be string"
        }
        if (vErrors === null) {
          vErrors = [err7]
        } else {
          vErrors.push(err7)
        }
        errors++
      }
    }
    if (data.queries !== undefined) {
      let data8 = data.queries
      if (Array.isArray(data8)) {
        const len2 = data8.length
        for (let i2 = 0; i2 < len2; i2++) {
          let data9 = data8[i2]
          if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
            if (data9.id !== undefined) {
              if (typeof data9.id !== "string") {
                const err8 = {
                  instancePath: instancePath + "/queries/" + i2 + "/id",
                  schemaPath: "#/definitions/Query/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err8]
                } else {
                  vErrors.push(err8)
                }
                errors++
              }
            }
            if (data9.query !== undefined) {
              if (typeof data9.query !== "string") {
                const err9 = {
                  instancePath: instancePath + "/queries/" + i2 + "/query",
                  schemaPath: "#/definitions/Query/properties/query/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err9]
                } else {
                  vErrors.push(err9)
                }
                errors++
              }
            }
          } else {
            const err10 = {
              instancePath: instancePath + "/queries/" + i2,
              schemaPath: "#/definitions/Query/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err10]
            } else {
              vErrors.push(err10)
            }
            errors++
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + "/queries",
          schemaPath: "#/properties/queries/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err11]
        } else {
          vErrors.push(err11)
        }
        errors++
      }
    }
  } else {
    const err12 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err12]
    } else {
      vErrors.push(err12)
    }
    errors++
  }
  validate34.errors = vErrors
  return errors === 0
}
function validate33(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.creators !== undefined) {
      let data0 = data.creators
      if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
        for (const key0 in data0) {
          let data1 = data0[key0]
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.channels !== undefined) {
              let data2 = data1.channels
              if (Array.isArray(data2)) {
                const len0 = data2.length
                for (let i0 = 0; i0 < len0; i0++) {
                  if (typeof data2[i0] !== "string") {
                    const err0 = {
                      instancePath:
                        instancePath +
                        "/creators/" +
                        key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                        "/channels/" +
                        i0,
                      schemaPath:
                        "#/definitions/Creator/properties/channels/items/type",
                      keyword: "type",
                      params: { type: "string" },
                      message: "must be string"
                    }
                    if (vErrors === null) {
                      vErrors = [err0]
                    } else {
                      vErrors.push(err0)
                    }
                    errors++
                  }
                }
              } else {
                const err1 = {
                  instancePath:
                    instancePath +
                    "/creators/" +
                    key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/channels",
                  schemaPath: "#/definitions/Creator/properties/channels/type",
                  keyword: "type",
                  params: { type: "array" },
                  message: "must be array"
                }
                if (vErrors === null) {
                  vErrors = [err1]
                } else {
                  vErrors.push(err1)
                }
                errors++
              }
            }
            if (data1.description !== undefined) {
              if (typeof data1.description !== "string") {
                const err2 = {
                  instancePath:
                    instancePath +
                    "/creators/" +
                    key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/description",
                  schemaPath:
                    "#/definitions/Creator/properties/description/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err2]
                } else {
                  vErrors.push(err2)
                }
                errors++
              }
            }
            if (data1.id !== undefined) {
              if (typeof data1.id !== "string") {
                const err3 = {
                  instancePath:
                    instancePath +
                    "/creators/" +
                    key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/id",
                  schemaPath: "#/definitions/Creator/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err3]
                } else {
                  vErrors.push(err3)
                }
                errors++
              }
            }
            if (data1.links !== undefined) {
              let data6 = data1.links
              if (data6 && typeof data6 == "object" && !Array.isArray(data6)) {
                if (data6.tags !== undefined) {
                  let data7 = data6.tags
                  if (Array.isArray(data7)) {
                    const len1 = data7.length
                    for (let i1 = 0; i1 < len1; i1++) {
                      if (typeof data7[i1] !== "string") {
                        const err4 = {
                          instancePath:
                            instancePath +
                            "/creators/" +
                            key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                            "/links/tags/" +
                            i1,
                          schemaPath:
                            "#/definitions/Creator/properties/links/properties/tags/items/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string"
                        }
                        if (vErrors === null) {
                          vErrors = [err4]
                        } else {
                          vErrors.push(err4)
                        }
                        errors++
                      }
                    }
                  } else {
                    const err5 = {
                      instancePath:
                        instancePath +
                        "/creators/" +
                        key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                        "/links/tags",
                      schemaPath:
                        "#/definitions/Creator/properties/links/properties/tags/type",
                      keyword: "type",
                      params: { type: "array" },
                      message: "must be array"
                    }
                    if (vErrors === null) {
                      vErrors = [err5]
                    } else {
                      vErrors.push(err5)
                    }
                    errors++
                  }
                }
              } else {
                const err6 = {
                  instancePath:
                    instancePath +
                    "/creators/" +
                    key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/links",
                  schemaPath: "#/definitions/Creator/properties/links/type",
                  keyword: "type",
                  params: { type: "object" },
                  message: "must be object"
                }
                if (vErrors === null) {
                  vErrors = [err6]
                } else {
                  vErrors.push(err6)
                }
                errors++
              }
            }
            if (data1.name !== undefined) {
              if (typeof data1.name !== "string") {
                const err7 = {
                  instancePath:
                    instancePath +
                    "/creators/" +
                    key0.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/name",
                  schemaPath: "#/definitions/Creator/properties/name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err7]
                } else {
                  vErrors.push(err7)
                }
                errors++
              }
            }
          } else {
            const err8 = {
              instancePath:
                instancePath +
                "/creators/" +
                key0.replace(/~/g, "~0").replace(/\//g, "~1"),
              schemaPath: "#/definitions/Creator/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err8]
            } else {
              vErrors.push(err8)
            }
            errors++
          }
        }
      } else {
        const err9 = {
          instancePath: instancePath + "/creators",
          schemaPath: "#/properties/creators/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err9]
        } else {
          vErrors.push(err9)
        }
        errors++
      }
    }
    if (data.expressions !== undefined) {
      let data10 = data.expressions
      if (data10 && typeof data10 == "object" && !Array.isArray(data10)) {
        for (const key1 in data10) {
          if (
            !validate34(data10[key1], {
              instancePath:
                instancePath +
                "/expressions/" +
                key1.replace(/~/g, "~0").replace(/\//g, "~1"),
              parentData: data10,
              parentDataProperty: key1,
              rootData
            })
          ) {
            vErrors =
              vErrors === null
                ? validate34.errors
                : vErrors.concat(validate34.errors)
            errors = vErrors.length
          }
        }
      } else {
        const err10 = {
          instancePath: instancePath + "/expressions",
          schemaPath: "#/properties/expressions/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err10]
        } else {
          vErrors.push(err10)
        }
        errors++
      }
    }
    if (data.tags !== undefined) {
      let data12 = data.tags
      if (data12 && typeof data12 == "object" && !Array.isArray(data12)) {
        for (const key2 in data12) {
          let data13 = data12[key2]
          if (data13 && typeof data13 == "object" && !Array.isArray(data13)) {
            if (data13.color !== undefined) {
              if (typeof data13.color !== "string") {
                const err11 = {
                  instancePath:
                    instancePath +
                    "/tags/" +
                    key2.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/color",
                  schemaPath: "#/definitions/Tag/properties/color/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err11]
                } else {
                  vErrors.push(err11)
                }
                errors++
              }
            }
            if (data13.description !== undefined) {
              if (typeof data13.description !== "string") {
                const err12 = {
                  instancePath:
                    instancePath +
                    "/tags/" +
                    key2.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/description",
                  schemaPath: "#/definitions/Tag/properties/description/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err12]
                } else {
                  vErrors.push(err12)
                }
                errors++
              }
            }
            if (data13.id !== undefined) {
              if (typeof data13.id !== "string") {
                const err13 = {
                  instancePath:
                    instancePath +
                    "/tags/" +
                    key2.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/id",
                  schemaPath: "#/definitions/Tag/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err13]
                } else {
                  vErrors.push(err13)
                }
                errors++
              }
            }
            if (data13.name !== undefined) {
              if (typeof data13.name !== "string") {
                const err14 = {
                  instancePath:
                    instancePath +
                    "/tags/" +
                    key2.replace(/~/g, "~0").replace(/\//g, "~1") +
                    "/name",
                  schemaPath: "#/definitions/Tag/properties/name/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err14]
                } else {
                  vErrors.push(err14)
                }
                errors++
              }
            }
          } else {
            const err15 = {
              instancePath:
                instancePath +
                "/tags/" +
                key2.replace(/~/g, "~0").replace(/\//g, "~1"),
              schemaPath: "#/definitions/Tag/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err15]
            } else {
              vErrors.push(err15)
            }
            errors++
          }
        }
      } else {
        const err16 = {
          instancePath: instancePath + "/tags",
          schemaPath: "#/properties/tags/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object"
        }
        if (vErrors === null) {
          vErrors = [err16]
        } else {
          vErrors.push(err16)
        }
        errors++
      }
    }
  } else {
    const err17 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err17]
    } else {
      vErrors.push(err17)
    }
    errors++
  }
  validate33.errors = vErrors
  return errors === 0
}
const schema45 = {
  properties: {
    handles: { items: { $ref: "#/definitions/Handle" }, type: "array" },
    liveRecordingInterval: { type: "number" },
    recordActivity: { type: "boolean" },
    recordChat: { type: "boolean" },
    recordMouse: { type: "boolean" },
    recordOnPlatforms: { items: { type: "string" }, type: "array" },
    recordTabs: { type: "boolean" }
  },
  type: "object"
}
const schema46 = {
  properties: {
    alias: { type: "string" },
    id: { type: "string" },
    internalId: { type: "string" },
    platform: { type: "string" }
  },
  type: "object"
}
function validate37(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.handles !== undefined) {
      let data0 = data.handles
      if (Array.isArray(data0)) {
        const len0 = data0.length
        for (let i0 = 0; i0 < len0; i0++) {
          let data1 = data0[i0]
          if (data1 && typeof data1 == "object" && !Array.isArray(data1)) {
            if (data1.alias !== undefined) {
              if (typeof data1.alias !== "string") {
                const err0 = {
                  instancePath: instancePath + "/handles/" + i0 + "/alias",
                  schemaPath: "#/definitions/Handle/properties/alias/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err0]
                } else {
                  vErrors.push(err0)
                }
                errors++
              }
            }
            if (data1.id !== undefined) {
              if (typeof data1.id !== "string") {
                const err1 = {
                  instancePath: instancePath + "/handles/" + i0 + "/id",
                  schemaPath: "#/definitions/Handle/properties/id/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err1]
                } else {
                  vErrors.push(err1)
                }
                errors++
              }
            }
            if (data1.internalId !== undefined) {
              if (typeof data1.internalId !== "string") {
                const err2 = {
                  instancePath: instancePath + "/handles/" + i0 + "/internalId",
                  schemaPath: "#/definitions/Handle/properties/internalId/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err2]
                } else {
                  vErrors.push(err2)
                }
                errors++
              }
            }
            if (data1.platform !== undefined) {
              if (typeof data1.platform !== "string") {
                const err3 = {
                  instancePath: instancePath + "/handles/" + i0 + "/platform",
                  schemaPath: "#/definitions/Handle/properties/platform/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string"
                }
                if (vErrors === null) {
                  vErrors = [err3]
                } else {
                  vErrors.push(err3)
                }
                errors++
              }
            }
          } else {
            const err4 = {
              instancePath: instancePath + "/handles/" + i0,
              schemaPath: "#/definitions/Handle/type",
              keyword: "type",
              params: { type: "object" },
              message: "must be object"
            }
            if (vErrors === null) {
              vErrors = [err4]
            } else {
              vErrors.push(err4)
            }
            errors++
          }
        }
      } else {
        const err5 = {
          instancePath: instancePath + "/handles",
          schemaPath: "#/properties/handles/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err5]
        } else {
          vErrors.push(err5)
        }
        errors++
      }
    }
    if (data.liveRecordingInterval !== undefined) {
      let data6 = data.liveRecordingInterval
      if (!(typeof data6 == "number" && isFinite(data6))) {
        const err6 = {
          instancePath: instancePath + "/liveRecordingInterval",
          schemaPath: "#/properties/liveRecordingInterval/type",
          keyword: "type",
          params: { type: "number" },
          message: "must be number"
        }
        if (vErrors === null) {
          vErrors = [err6]
        } else {
          vErrors.push(err6)
        }
        errors++
      }
    }
    if (data.recordActivity !== undefined) {
      if (typeof data.recordActivity !== "boolean") {
        const err7 = {
          instancePath: instancePath + "/recordActivity",
          schemaPath: "#/properties/recordActivity/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean"
        }
        if (vErrors === null) {
          vErrors = [err7]
        } else {
          vErrors.push(err7)
        }
        errors++
      }
    }
    if (data.recordChat !== undefined) {
      if (typeof data.recordChat !== "boolean") {
        const err8 = {
          instancePath: instancePath + "/recordChat",
          schemaPath: "#/properties/recordChat/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean"
        }
        if (vErrors === null) {
          vErrors = [err8]
        } else {
          vErrors.push(err8)
        }
        errors++
      }
    }
    if (data.recordMouse !== undefined) {
      if (typeof data.recordMouse !== "boolean") {
        const err9 = {
          instancePath: instancePath + "/recordMouse",
          schemaPath: "#/properties/recordMouse/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean"
        }
        if (vErrors === null) {
          vErrors = [err9]
        } else {
          vErrors.push(err9)
        }
        errors++
      }
    }
    if (data.recordOnPlatforms !== undefined) {
      let data10 = data.recordOnPlatforms
      if (Array.isArray(data10)) {
        const len1 = data10.length
        for (let i1 = 0; i1 < len1; i1++) {
          if (typeof data10[i1] !== "string") {
            const err10 = {
              instancePath: instancePath + "/recordOnPlatforms/" + i1,
              schemaPath: "#/properties/recordOnPlatforms/items/type",
              keyword: "type",
              params: { type: "string" },
              message: "must be string"
            }
            if (vErrors === null) {
              vErrors = [err10]
            } else {
              vErrors.push(err10)
            }
            errors++
          }
        }
      } else {
        const err11 = {
          instancePath: instancePath + "/recordOnPlatforms",
          schemaPath: "#/properties/recordOnPlatforms/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err11]
        } else {
          vErrors.push(err11)
        }
        errors++
      }
    }
    if (data.recordTabs !== undefined) {
      if (typeof data.recordTabs !== "boolean") {
        const err12 = {
          instancePath: instancePath + "/recordTabs",
          schemaPath: "#/properties/recordTabs/type",
          keyword: "type",
          params: { type: "boolean" },
          message: "must be boolean"
        }
        if (vErrors === null) {
          vErrors = [err12]
        } else {
          vErrors.push(err12)
        }
        errors++
      }
    }
  } else {
    const err13 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err13]
    } else {
      vErrors.push(err13)
    }
    errors++
  }
  validate37.errors = vErrors
  return errors === 0
}
function validate20(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null
  let errors = 0
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.activities !== undefined) {
      let data0 = data.activities
      if (Array.isArray(data0)) {
        const len0 = data0.length
        for (let i0 = 0; i0 < len0; i0++) {
          if (
            !validate21(data0[i0], {
              instancePath: instancePath + "/activities/" + i0,
              parentData: data0,
              parentDataProperty: i0,
              rootData
            })
          ) {
            vErrors =
              vErrors === null
                ? validate21.errors
                : vErrors.concat(validate21.errors)
            errors = vErrors.length
          }
        }
      } else {
        const err0 = {
          instancePath: instancePath + "/activities",
          schemaPath: "#/properties/activities/type",
          keyword: "type",
          params: { type: "array" },
          message: "must be array"
        }
        if (vErrors === null) {
          vErrors = [err0]
        } else {
          vErrors.push(err0)
        }
        errors++
      }
    }
    if (data.annotations !== undefined) {
      if (
        !validate33(data.annotations, {
          instancePath: instancePath + "/annotations",
          parentData: data,
          parentDataProperty: "annotations",
          rootData
        })
      ) {
        vErrors =
          vErrors === null
            ? validate33.errors
            : vErrors.concat(validate33.errors)
        errors = vErrors.length
      }
    }
    if (data.settings !== undefined) {
      if (
        !validate37(data.settings, {
          instancePath: instancePath + "/settings",
          parentData: data,
          parentDataProperty: "settings",
          rootData
        })
      ) {
        vErrors =
          vErrors === null
            ? validate37.errors
            : vErrors.concat(validate37.errors)
        errors = vErrors.length
      }
    }
  } else {
    const err1 = {
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" },
      message: "must be object"
    }
    if (vErrors === null) {
      vErrors = [err1]
    } else {
      vErrors.push(err1)
    }
    errors++
  }
  validate20.errors = vErrors
  return errors === 0
}
