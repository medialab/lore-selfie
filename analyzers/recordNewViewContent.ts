import { v4 as generateId } from "uuid"

import { BROWSE_VIEW } from "~constants"
import type { BrowseViewEvent } from "~types/captureEventsTypes"

import parsers from "./parsers"

const DYNAMIC_LOADING_DELAY = 2000

function delay(t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}

const scrapePageMetadata = async (
  { testFn, scrapeFn, scrapingName, maxRetries = 10, delayTimeMs = 500 },
  currentRetry = 0
) => {
  console.debug(
    "try scraping page metadata (%s) try n°%s",
    scrapingName,
    currentRetry + 1
  )
  const canScrape = testFn()
  if (canScrape) {
    console.debug(
      "will scrape page metadata (%s) try n°%s",
      scrapingName,
      currentRetry + 1
    )
    return scrapeFn()
  }
  if (currentRetry < maxRetries) {
    await delay(delayTimeMs)
    currentRetry++
    return scrapePageMetadata(
      {
        testFn,
        scrapeFn,
        scrapingName,
        maxRetries,
        delayTimeMs
      },
      currentRetry
    )
  } else {
    console.error("no metadata found in time (%s)", scrapingName)
    // throw new Error('no metadata found in time (%s)', scrapingName);
  }
}

export const recordNewViewContent = async ({
  platform,
  injectionId,
  url,
  addEvent
}) => {
  // wait for metadata loading (youtube essentially)
  // @todo find a more robust way to ensure new video metadata is loaded
  console.log(
    "will record new view in contents, waiting %s seconds",
    DYNAMIC_LOADING_DELAY / 1000
  )
  await delay(DYNAMIC_LOADING_DELAY)
  // let title = document.title;
  // console.debug('record new view content for platform', platform);
  const { viewType, parsedMetadata = {} } = await parsers[platform].sniffer(url)
  let metadata = {
    // title,
    ...parsedMetadata
  }
  let scrapedMetadata = {}

  if (parsers[platform]?.scrapers[viewType]) {
    console.debug("scraping with %s %s script", platform, viewType)
    scrapedMetadata = await scrapePageMetadata({
      testFn: parsers[platform].scrapers[viewType].test,
      scrapeFn: parsers[platform].scrapers[viewType].scrape,
      scrapingName: `${platform} ${viewType}`
    })
    console.debug("scraped metadata", scrapedMetadata)
  }
  metadata = {
    ...metadata,
    ...scrapedMetadata
  }
  const browseViewEvent: BrowseViewEvent = {
    type: BROWSE_VIEW,
    id: generateId(),
    date: new Date(),
    url: window.location.href,
    injectionId,
    platform,
    viewType,
    metadata
  }
  await addEvent(browseViewEvent)
  return viewType
}
