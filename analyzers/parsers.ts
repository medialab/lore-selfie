import type { YoutubeVideoMetadata, RecommendedContent, TwitchLiveMetadata, YoutubeShortMetadata } from "~types/captureEventsTypes";

const parsers = {
  twitch: {
    // sniffs URL to determine view type
    sniffer: async url => {
      let match;
      if ((match = url.match(/https?:\/\/www.twitch.tv\/([^\/]+)/)) !== null) {
        console.log(match);
        const channelId = match[1].split('?')[0];
        return {
          viewType: "live",
          parsedMetadata: {
            channelId,
            channelName: channelId
          }
        }
      } else {
        return {
          viewType: "other",
          parsedMetadata: {}
        }
      }
    },
    scrapers: {
      live: {
        test: () : Boolean => !!document.querySelector('#live-channel-stream-information h1')?.textContent && document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1)')?.textContent.trim().length > 0,
        scrape: () : TwitchLiveMetadata => ({
          channel: document.querySelector('#live-channel-stream-information h1')?.textContent,
          channelImageAvatarSrc: document.querySelector('#live-channel-stream-information .tw-image-avatar')?.getAttribute('src'),
          title: document.querySelector('#live-channel-stream-information h2')?.textContent,
          viewersCount: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div')?.textContent,
          liveTimeElapsed: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(2n) > div > div > div > div:nth-child(2)')?.textContent,
          tags: Array.from(new Set(Array.from(document.querySelectorAll('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(2) div'))?.slice(2).map(el => el.textContent))).join(', '),
          category: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1)')?.textContent,
          categoryHref: document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1) a')?.getAttribute('href'),
        })
      }
    }
  },
  youtube: {
    sniffer: async url => {
      let match;
      if ((match = url.match(/https?:\/\/www\.youtube\.com\/watch\?v=([^&]+)/)) !== null) {
        const videoId = match[1];
        return {
          viewType: "video",
          parsedMetadata: {
            videoId
          }
        }
      } else if ((match = url.match(/https:\/\/www\.youtube\.com\/shorts\/([^\/]+)/)) !== null) { 
        const videoId = match[1];
        return {
          viewType: "short",
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
    },
    scrapers: {
      short: {
        test: () : Boolean => !!document.querySelector('.YtReelMetapanelViewModelHost,.YtShortsVideoTitleViewModelShortsVideoTitle,.ytReelMultiFormatLinkViewModelTitle,.ytShortsVideoTitleViewModelShortsVideoTitle')?.textContent.trim().length,
        scrape: () : YoutubeShortMetadata => ({
          title: document.querySelector('.YtShortsVideoTitleViewModelShortsVideoTitle, .ytd-shorts[is-active]  .ytReelMultiFormatLinkViewModelTitle, .ytd-shorts[is-active] .ytShortsVideoTitleViewModelShortsVideoTitle')?.textContent.trim(),
          // following commented bc it only works with the first short being watched
          // ...[
          //   // "title",
          //   // "description",
          //   "keywords",
          //   "interactionCount",
          //   "datePublished",
          //   "uploadDate",
          //   "genre"
          // ].reduce((cur, id) => ({
          //   ...cur,
          //   [id]: document.querySelector(`meta[itemprop="${id}"],meta[name="${id}"]`)?.getAttribute('content')
          // }), {}),
          // shortlinkUrl: document.querySelector('link[rel="shortlinkUrl"]')?.getAttribute('href'),
          // videoimageSrc: document.querySelector('link[rel="image_src"]')?.getAttribute('href'),

          channelName: document.querySelector('.YtReelChannelBarViewModelChannelName a, .ytReelChannelBarViewModelChannelName a')?.textContent.trim().replace(/^@/, ''),
          channelId: decodeURI(document.querySelector('.YtReelChannelBarViewModelChannelName a, .ytReelChannelBarViewModelChannelName a')?.getAttribute('href'))?.split('@').pop().split('/')[0],
          channelImageSrc: document.querySelector('.yt-spec-avatar-shape img')?.getAttribute('src'),
          commentsCount: document.querySelector('#actions #comments-button .yt-spec-button-shape-with-label')?.textContent.trim(),
          likesCount: document.querySelector('#actions #like-button #like-button .yt-spec-button-shape-with-label, .ytLikeButtonViewModelHost')?.textContent.trim(),
        })
      },
      video: {
        test: () : Boolean => !!document.querySelector('yt-formatted-string.ytd-watch-metadata')?.textContent.trim().length,
        scrape: () : YoutubeVideoMetadata => ({
          title: document.querySelector('yt-formatted-string.ytd-watch-metadata')?.textContent.trim(),
          // @todo retrieve only if it's the first video loaded in view (bc it's not uploaded in spa mode)
          // ...[
          //   // "description",
          //   "keywords",
          //   "interactionCount",
          //   "datePublished",
          //   "uploadDate",
          //   "genre"
          // ].reduce((cur, id) => ({
          //   ...cur,
          //   [id]: document.querySelector(`meta[itemprop="${id}"],meta[name="${id}"]`)?.getAttribute('content')
          // }), {}),
          
          description: (document.querySelector('.ytd-watch-metadata #description') as HTMLElement)?.innerText.trim(),
          shortlinkUrl: document.querySelector('link[rel="shortlinkUrl"]')?.getAttribute('href'),
          videoimageSrc: document.querySelector('link[rel="image_src"]')?.getAttribute('href'),

          channelName: document.querySelector('.ytd-watch-metadata ytd-channel-name a')?.textContent.trim(),
          channelId: decodeURI(document.querySelector('.ytd-watch-metadata ytd-channel-name a')?.getAttribute('href'))?.split('@').pop(),
          ownerSubcount: document.querySelector('.ytd-watch-metadata #owner-sub-count')?.textContent,
          channelImageSrc: document.querySelector('.ytd-watch-metadata .yt-img-shadow')?.getAttribute('src'),
          duration: document.querySelector('.ytp-time-duration')?.textContent,

          recommendedContents: Array.from(document.querySelectorAll('#related #dismissible'))
          .map((el: HTMLElement) : RecommendedContent => {
            return {
              title: (el.querySelector('#video-title') as HTMLElement)?.innerText.trim(),
              channelName: (el.querySelector('.ytd-channel-name') as HTMLElement)?.innerText.trim(),
              url: 'https:/youtube.com' + el.querySelector('#thumbnail')?.getAttribute('href'),
              thumbnailImageSrc: el.querySelector('.ytd-thumbnail img')?.getAttribute('src'),
              type: 'video'
            }
          }),
          
          // following line is commented because lazy loaded
          // commentsCount: document.querySelector('.count-text.ytd-comments-header-renderer span')?.textContent,
          likesCount: document.querySelector('.top-level-buttons .smartimation .yt-spec-button-shape-next__button-text-content')?.textContent,
        })
      }
    }
  },

}

export default parsers;