const parsers = {
  twitch: {
    sniffer: async url => {
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
    },
    scrapers: {
      live: {
        test: () => document.querySelector('#live-channel-stream-information h1')?.textContent && document.querySelector('#live-channel-stream-information > div > div > div > div > div:nth-child(2n) > div:nth-child(2n) > div:nth-child(1n) > div > div:nth-child(2) > div > div > div:nth-child(1)')?.textContent,
        scrape: () => ({
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
      } else {
        return {
          viewType: "other",
          parsedMetadata: {}
        }
      }
    },
    scrapers: {
      video: {
        test: () => document.querySelector('yt-formatted-string.ytd-watch-metadata')?.textContent.trim(),
        scrape: () => ({
          title: document.querySelector('yt-formatted-string.ytd-watch-metadata')?.textContent.trim(),
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
          // following line is commented because lazy loaded
          // commentsCount: document.querySelector('.count-text.ytd-comments-header-renderer span')?.textContent,
          likesCount: document.querySelector('.top-level-buttons .smartimation .yt-spec-button-shape-next__button-text-content')?.textContent,
        })
      }
    }
  },

}

export default parsers;