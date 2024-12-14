import { v4 as generateId } from 'uuid';
import type { BrowseViewEvent } from "~types/captureEventsTypes";

import parsers from './parsers';

function delay(t) {
  return new Promise(resolve => {
    setTimeout(resolve, t);
  });
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
      // throw new Error('no metadata found in time (%s)', scrapingName);
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
    let scrapedMetadata = {}

    if (parsers[platform]?.scrapers[viewType]) {
      scrapedMetadata = await scrapePageMetadata({
        testFn: parsers[platform].scrapers[viewType].test,
        scrapeFn: parsers[platform].scrapers[viewType].scrape,
        scrapingName: `${platform} ${viewType}`,
      });
    }
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
    return viewType;
  }