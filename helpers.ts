import { type Browser } from "~types/captureEventsTypes"

export function getBrowser(): Browser {
  const ua = navigator.userAgent
  let browser

  // helper functions to deal with common regex
  function getFirstMatch(regex): string {
    const match = ua.match(regex)
    return (match && match.length > 1 && match[1]) || ""
  }

  function getSecondMatch(regex): string {
    const match = ua.match(regex)
    return (match && match.length > 1 && match[2]) || ""
  }

  // start detecting
  if (/opera|opr/i.test(ua)) {
    browser = {
      name: "Opera",
      type: "opera",
      version:
        getFirstMatch(/version\/(\d+(\.\d+)?)/i) ||
        getFirstMatch(/(?:opera|opr)[\s/](\d+(\.\d+)?)/i)
    }
  } else if (/msie|trident/i.test(ua)) {
    browser = {
      name: "Internet Explorer",
      type: "msie",
      version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
    }
  } else if (/chrome.+? edge/i.test(ua)) {
    browser = {
      name: "Microsft Edge",
      type: "msedge",
      version: getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
    }
  } else if (/chrome|crios|crmo/i.test(ua)) {
    browser = {
      name: "Google Chrome",
      type: "chrome",
      version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
    }
  } else if (/firefox/i.test(ua)) {
    browser = {
      name: "Firefox",
      type: "firefox",
      version: getFirstMatch(/(?:firefox)[ /](\d+(\.\d+)?)/i)
    }
  } else if (!/like android/i.test(ua) && /android/i.test(ua)) {
    browser = {
      name: "Android",
      type: "android",
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else if (/safari/i.test(ua)) {
    browser = {
      name: "Safari",
      type: "safari",
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else {
    browser = {
      name: getFirstMatch(/^(.*)\/(.*) /),
      version: getSecondMatch(/^(.*)\/(.*) /)
    }
    browser.type = browser.name.toLowerCase().replace(/\s/g, "")
  }
  return browser
}

export const getPlatform = (url: string): string => {
  const youtubeURLS = [
    "https://www.youtube.com",
    "http://www.youtube.com",
    "https://youtube.com",
    "http://youtube.com",
    "https://youtu.be"
  ]
  if (youtubeURLS.find((pattern) => url.includes(pattern))) {
    return "youtube"
  } else if (url.includes("twitch")) {
    return "twitch"
  } else if (url.includes("tiktok")) {
    return "tiktok"
  }
}

export function downloadJSONData(
  data: object,
  filename = "selfie-data.json"
): void {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
  const dlURL = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = dlURL
  a.download = filename
  document.body.appendChild(a)
  a.click()
}
export function downloadTextfile(
  data: string,
  filename: string = "selfie-data.json",
  mimetype: string = "application/json"
): void {
  const blob = new Blob([data], { type: mimetype })
  const dlURL = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = dlURL
  a.download = filename
  document.body.appendChild(a)
  a.click()
}

export function JSONArrayToCSVStr(items: Array<object> = []): string {
  const replacer = (key, value) => (value === null ? "" : value) // specify how you want to handle null values here
  const header = new Set(Object.keys(items[0]))
  const outputItems = items.map((item) => {
    const outputItem = {}
    Object.entries(item).forEach(([key, value]) => {
      let outputValue = value
      if (!header.has(key)) {
        header.add(key)
      }

      if (value === undefined || value === null) {
        outputItem[key] = ""
      } else if (typeof value === "object") {
        if (Array.isArray(value) && value.length) {
          // const subHeader = Object.keys(value[0]);
          // outputItem[key] = [
          //   subHeader.join('|'),
          //   ...value.map((subValue) => {
          //       console.log(subValue)
          //       return subHeader.map(subKey => {
          //           return subValue[subKey] ? JSON.stringify(subValue[subKey]) : '';
          //       }).join('|')
          //     })

          // ].join('||');
          outputValue = JSON.stringify(value)
          outputValue = outputValue.replace(/,/g, "|") //.replace(/"/g, '\\"').;
          outputItem[key] = outputValue
        } else {
          Object.entries(value).forEach(([subKey, subValue]) => {
            const csvKey = `${key}.${subKey}`
            if (!header.has(csvKey)) {
              header.add(csvKey)
            }
            outputItem[csvKey] = subValue // JSON.stringify(subValue, replacer)
          })
        }
      } else {
        outputValue = value // JSON.stringify(value, replacer);
        outputItem[key] = outputValue
      }
    })
    return outputItem
  })
  // console.log('outputItems', outputItems);
  const headerArray: Array<string> = Array.from(header).sort()
  const csv = [
    headerArray.join(","), // header row first
    ...outputItems.map((row) =>
      headerArray
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    )
  ].join("\r\n")
  return csv
}

/**
 * Format a number so that it is more legible
 * @param {number} n
 * @param {string} style='fr'
 * @returns {string}
 */
export const formatNumber = (n: number, style: string = "fr"): string => {
  if (+n === 0) {
    return "0"
  }
  const [intPart, floatPart] = ("" + n).split(".")
  return (
    intPart
      .split("")
      .reverse()
      .reduce(
        ({ count, result }, digit, index) => {
          const endOfLine =
            intPart.length > 3 &&
            (count === 3 || (count === 0 && index === intPart.length - 1))
          if (endOfLine) {
            return {
              count: 1,
              result: [...result, style === "fr" ? "\u00A0" : ",", digit]
            }
          } else
            return {
              count: count + 1,
              result: [...result, digit]
            }
        },
        {
          count: 0,
          result: []
        }
      )
      .result.reverse()
      .join("") +
    (floatPart === undefined
      ? ""
      : style === "fr"
        ? "," + floatPart
        : "." + floatPart)
  )
}

export function lengthInUtf8Bytes(str: string): number {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  const m = encodeURIComponent(str).match(/%[89ABab]/g)
  return str.length + (m ? m.length : 0)
}
export function timeOfDayToMs(span) {
  const [hours, minutes] = span.split(":")
  return +hours * 3600 * 1000 + +minutes * 60 * 1000
}

export function inferTickTimespan(
  timeSpan: number,
  zoomLevel: number = 1
): number {
  const scale = timeSpan / zoomLevel
  let span
  if (scale < 150000) {
    span = 15000
  } else if (scale < 300000) {
    span = 30000
  } else if (scale < 600000) {
    span = 60000
  } else if (scale < 1000000) {
    span = 60000 * 2
  } else if (scale < 2000000) {
    span = 60000 * 5
  } else if (scale < 5000000) {
    span = 60000 * 10
  } else if (scale < 10000000) {
    span = 60000 * 15
  } else if (scale < 100000000) {
    span = 3600 * 1000
  } else {
    span = 3600 * 1000 * 3
  }
  return span
}

export function buildDateKey(date: Date): string {
  return new Date(date).toJSON().split("T")[0]
}

export function prettyDate(date: Date, daysMap: object, monthsMap: object) {
  return date?.getTime
    ? `${daysMap[date.getDay()].toLowerCase()} ${date.getDate() === 1 ? "1<sup>er</sup>" : date.getDate()} ${monthsMap[date.getMonth()]} ${date.getFullYear()}`
    : ""
}

export function getDateBin(date: Date, binInMs: number): number {
  const timeInMs =
    date.getHours() * 3600 * 1000 +
    date.getMinutes() * 60 * 1000 +
    date.getSeconds() * 1000 +
    date.getMilliseconds()
  return timeInMs - (timeInMs % binInMs)
}

export function numberToDoubleDigit (n: number): string {
  const str = n + '';
  if (str.length === 1) {
    return `0${str}`
  }
  return str;
}

export function msToNiceDuration(d: number): string {
  const hours = Math.floor(d / 3600000)
  const minutes = Math.floor((d - hours * 3600000) / 60000)
  return hours ? `${(hours)} heures ${numberToDoubleDigit(minutes)} minutes` : (minutes) + " minutes"
}

export default function helpers() {}
