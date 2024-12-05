import { v4 as generateId } from 'uuid';
import type { BrowseViewEvent } from "~types/captureEventsTypes";

const parseYoutubeURL = url => {
  let match;
  if ((match = url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/)) !== null) {
    console.log(match);
    const videoId = match[1];
    return {
      viewType: "video",
      parsedMetadata: {
        videoId
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
  const maxRetries = 5;
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
export const recordNewViewContent = async ({
  platform,
  injectionId,
  url,
  addEvent,
}) => {
  await delay(1000);
  let title = document.title;
  let browseViewEvent: BrowseViewEvent;
  switch (platform) {
    case 'YOUTUBE':
      let metadata = {
        title
      }
      const { viewType, parsedMetadata = {} } = parseYoutubeURL(url);
      metadata = {
        ...metadata,
        ...parsedMetadata
      }
      switch(viewType) {
        case 'video':
          const scrapedMetadata = await tryScrapingYoutubeVideoMetadata();
          if (scrapedMetadata) {
            metadata = {
              ...metadata,
              ...scrapedMetadata,
            }
          }
          break;
        default:
          break;
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
      addEvent(browseViewEvent);
      break;
    default:
      break;
  }
}