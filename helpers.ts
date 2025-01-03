import { Browser } from "~types/captureEventsTypes";

export function getBrowser(): Browser {
  const ua = navigator.userAgent
  let browser;

  // helper functions to deal with common regex
  function getFirstMatch(regex) {
    const match = ua.match(regex);
    return (match && match.length > 1 && match[1]) || '';
  }

  function getSecondMatch(regex) {
    const match = ua.match(regex);
    return (match && match.length > 1 && match[2]) || '';
  }

  // start detecting
  if (/opera|opr/i.test(ua)) {
    browser = {
      name: 'Opera',
      type: 'opera',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i) || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
    }
  } else if (/msie|trident/i.test(ua)) {
    browser = {
      name: 'Internet Explorer',
      type: 'msie',
      version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
    }
  } else if (/chrome.+? edge/i.test(ua)) {
    browser = {
      name: 'Microsft Edge',
      type: 'msedge',
      version: getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
    }
  } else if (/chrome|crios|crmo/i.test(ua)) {
    browser = {
      name: 'Google Chrome',
      type: 'chrome',
      version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
    }
  } else if (/firefox/i.test(ua)) {
    browser = {
      name: 'Firefox',
      type: 'firefox',
      version: getFirstMatch(/(?:firefox)[ \/](\d+(\.\d+)?)/i)
    }
  } else if (!(/like android/i.test(ua)) && /android/i.test(ua)) {
    browser = {
      name: 'Android',
      type: 'android',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else if (/safari/i.test(ua)) {
    browser = {
      name: 'Safari',
      type: 'safari',
      version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
    }
  } else {
    browser = {
      name: getFirstMatch(/^(.*)\/(.*) /),
      version: getSecondMatch(/^(.*)\/(.*) /)
    }
    browser.type = browser.name.toLowerCase().replace(/\s/g, '');
  }
  return browser;
}

export const getPlatform = (url: String): String => {
  const youtubeURLS = [
    "https://www.youtube.com",
    "http://www.youtube.com",
    "https://youtube.com",
    "http://youtube.com",
    "https://youtu.be",
  ]
  if (youtubeURLS.find(pattern => url.includes(pattern))) {
    return 'youtube';
  } else if (url.includes('twitch')) {
    return 'twitch';
  } else if (url.includes('tiktok')) {
    return 'tiktok';
  }
}

export function downloadJSONData(data:Object, filename='selfie-data.json') {
  
  let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  let dlURL = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = dlURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}
export function downloadTextfile(data:Object, filename='selfie-data.json', mimetype = 'application/json') {
  let blob = new Blob([data], { type: mimetype });
  let dlURL = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = dlURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}


/**
 * Format a number so that it is more legible
 * @param {number} n
 * @param {string} style='fr'
 * @returns {string}
 */
export const formatNumber = (n: Number, style: String  = 'fr'): String => {
  if (+n === 0) {
    return '0';
  }
  const [intPart, floatPart] = ('' + n).split('.')
  return intPart
    .split('')
    .reverse()
    .reduce(({ count, result }, digit, index) => {
      const endOfLine = count === 3 || (count === 0 && index === intPart.length - 1);
      if (endOfLine) {
        return {
          count: 1,
          result: [...result, style === 'fr' ? '\u00A0' : ',', digit]
        }
      } else return {
        count: count + 1,
        result: [...result, digit]
      }

    }, {
      count: 0,
      result: []
    })
    .result
    .reverse()
    .join('')
    + (floatPart === undefined ? '' : style === 'fr' ? ',' : '.' + floatPart)
}

export function lengthInUtf8Bytes(str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  const m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
