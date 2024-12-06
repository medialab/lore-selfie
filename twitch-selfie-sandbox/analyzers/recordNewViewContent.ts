import { v4 as generateId } from 'uuid';
import type { BrowseViewEvent } from "~types/captureEventsTypes";

import parsers from './parsers';

const parseTwitchURL = url => {
  let match;
  if ((match = url.match(/https?:\/\/www.twitch.tv\/([^\/]+)/)) !== null) {
    console.log(match);
    const channelId = match[1];
    return {
      viewType: "live",
      parsedMetadata: {
        channelId
      }
    }
  } else {
    return {
      viewType: "other",
      parsedMetadata: {}
    }
  }
}

function delay(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
}

const tryScrapingYoutubeVideoMetadata = async (currentRetry = 0) => {
  const maxRetries = 10;
  console.log('try scraping youtube video metadata try n°%s', currentRetry);
  const title = document.querySelector('yt-formatted-string.ytd-watch-metadata') && document.querySelector('yt-formatted-string.ytd-watch-metadata').textContent.trim();
  if (title) {
    return {
      title,
      // description: document.querySelector('meta[name="description"]').getAttribute('content'),
      // keywords: document.querySelector('meta[name="keywords"]').getAttribute('content'),

      ...[
        "description",
        "keywords",
        "interactionCount",
        "datePublished",
        "uploadDate",
        "genre"
      ].reduce((cur, id) => ({
        ...cur,
        [id]: document.querySelector(`meta[itemprop="${id}"],meta[name="${id}"]`)?.getAttribute('content')
      }), {}),

      shortlinkUrl: document.querySelector('link[rel="shortlinkUrl"]')?.getAttribute('href'),
      image_src: document.querySelector('link[rel="image_src"]')?.getAttribute('href'),

      channelName: document.querySelector('ytd-channel-name a')?.textContent.trim(),
      channelId: decodeURI(document.querySelector('ytd-channel-name a')?.getAttribute('href'))?.split('@').pop(),
      ownerSubcount: document.querySelector('#owner-sub-count')?.textContent,
      likesCount: document.querySelector('.top-level-buttons .smartimation .yt-spec-button-shape-next__button-text-content')?.textContent,
      // commentsCount: document.querySelector('.count-text.ytd-comments-header-renderer span')?.textContent,
    }
  }
  if (currentRetry < maxRetries) {
    await delay(500);
    currentRetry++;
    return tryScrapingYoutubeVideoMetadata(currentRetry);
  } else {
    throw new Error("no metadata found in time");
  }
}


const tryScrapingTwitchLiveMetadata = async (currentRetry = 0) => {
  const maxRetries = 10;
  console.debug('try scraping twitch video metadata try n°%s', currentRetry);
  const channel = document.querySelector('#live-channel-stream-information h1')?.textContent;
  console.log('channel: ', channel);
  if (channel) {
    return {
      channel,
      title: document.querySelector('#live-channel-stream-information h2')?.textContent,
      viewersCount: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div')?.textContent,
      liveTimeElapsed: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div:nth-child(2)')?.textContent,
      tags: Array.from(new Set(Array.from(document.querySelectorAll('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(2) div'))?.slice(2).map(el => el.textContent))).join(', '),
      category: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1)')?.textContent,
      categoryHref: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1) a')?.getAttribute('href'),
    }
  }
  if (currentRetry < maxRetries) {
    await delay(500);
    currentRetry++;
    return tryScrapingTwitchLiveMetadata(currentRetry);
  } else {
    console.error('no metadata found in time')
    throw new Error("no metadata found in time");
  }
}

const scrapePageMetadata = async ({
  testFn,
  scrapeFn,
  scrapingName,
  maxRetries = 10,
  delayTimeMs = 500,
}, currentRetry = 0) => {
  console.debug('try scraping page metadata (%s) try n°%s', scrapingName, currentRetry);
  const canScrape = testFn();
  if (canScrape) {
    console.debug('will scrape page metadata (%s) try n°%s', scrapingName, currentRetry)
    return scrapeFn();
  }
  if (currentRetry < maxRetries) {
    await delay(delayTimeMs);
    currentRetry++;
    return scrapePageMetadata({
      testFn,
      scrapeFn,
      scrapingName,
      maxRetries,
      delayTimeMs,
    }, currentRetry);
  } else {
    console.error('no metadata found in time (%s)', scrapingName)
    throw new Error('no metadata found in time (%s)', scrapingName);
  }
}

export const recordNewViewContent = async ({
  platform,
  injectionId,
  url,
  addEvent,
}) => {
  await delay(1000);
  let title = document.title;
  let browseViewEvent: BrowseViewEvent;
  // console.debug('record new view content for platform', platform);
  const { viewType, parsedMetadata = {} } = await parsers[platform].sniffer(url);
  let metadata = {
    title,
    ...parsedMetadata
  }
  const scrapedMetadata = await scrapePageMetadata({
    testFn: parsers[platform].scrapers[viewType].test,
    scrapeFn: parsers[platform].scrapers[viewType].scrape,
    scrapingName: `${platform} ${viewType}`,
  });
  metadata = {
    ...metadata,
    ...scrapedMetadata
  }
  browseViewEvent = {
    type: "BROWSE_VIEW",
    id: generateId(),
    date: new Date(),
    url: window.location.href,
    injectionId,
    platform,
    viewType,
    metadata
  }
  await addEvent(browseViewEvent);
}