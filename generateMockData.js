// https://twitchtracker.com/channels/ranking/french
// Array.from(document.querySelectorAll('td:nth-child(odd) a')).map(el => el.getAttribute('href').slice(1)).join('\n')

import { readFile } from 'fs/promises';
import { writeFile, writeFileSync } from 'fs';
import { csvFormat } from 'd3-dsv';
import { Language } from 'voynich-ipsum';
import { v4 as genId } from 'uuid';

import { PLATFORMS } from '~constants';

const lang = new Language({ seed: 1 });

const MIN_NUMBER_OF_SESSIONS = 1;
const MAX_NUMBER_OF_SESSIONS = 12;

const tossCoin = prob => {
  return Math.random() <= prob;
}

const buildMockData = ({
  streamersList,
  numberOfPastDays
}) => {
  let events = [];
  const DAY = 24 * 3600 * 1000;
  let today = new Date();
  today.setHours(0)
  today.setMinutes(0)
  today = today.getTime();
  today = today - today % DAY;

  for (let i = 0; i < numberOfPastDays; i++) {
    const day = today - DAY * i;
    // decide if it was an active day
    const wasActive = tossCoin(0.6);
    if (wasActive) {
      // set number of sessions
      const numberOfSessions = Math.round(Math.random() * (MAX_NUMBER_OF_SESSIONS - MIN_NUMBER_OF_SESSIONS) + MIN_NUMBER_OF_SESSIONS)
      // for each session create fake activity
      let time = day + Math.random() * DAY;
      let sessionIndex = 0;
      while (time < day + DAY && sessionIndex < numberOfSessions) {
        const sessionDuration = Math.floor(Math.random() * 2 * 3600 * 1000);
        const sessionStart = time + Math.floor(Math.random() * 3 * 3600 * 1000);
        const sessionId = genId()
        time = sessionStart;
        if (time < day + DAY) {
          const sessionEnd = sessionStart + sessionDuration;

          // choose platform
          const platform = PLATFORMS[Math.floor(Math.random() * (PLATFORMS.length - 1))]
          console.log('====')
          console.log('day: ', new Date(day));
          console.log('session start: ', new Date(sessionStart));
          console.log('session end: ', new Date(sessionEnd));
          console.log('platform', platform);
          // set user actions sequence: ['watches', 'engages', 'blurs', 'changes']
          const ACTION_TYPES = ['moves', 'blurs', 'changes'];
          const numberOfActions = Math.round(Math.random() * 20)
          let actionsSequence = [{
            type: 'changes',
            absStart: 0,
          }]
          let lastWasBlurred = false;
          let absStart = 0;
          for (let i = 0; i < numberOfActions; i++) {
            let actionType = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
            if (actionType === 'blurs') {
              if (lastWasBlurred) {
                actionType = 'focuses'
                lastWasBlurred = false;
              } else {
                lastWasBlurred = true;
              }
            } else if (lastWasBlurred) {
              actionsSequence.push({
                type: 'focuses',
                absStart
              })
              lastWasBlurred = false;
            }
            absStart += Math.random()
            actionsSequence.push({
              type: actionType,
              absStart
            })
          }
          const maxAbsStart = actionsSequence[actionsSequence.length - 1].absStart;
          const absStartToRelStart = ab => {
            return ab === 0 ? sessionStart : Math.floor(sessionStart + sessionDuration / ab)
          }
          actionsSequence = actionsSequence.map(a => ({
            ...a,
            date: absStartToRelStart(a.absStart)
          }))
          actionsSequence.forEach(({ type, date }) => {
            const typeMap = {
              'changes': 'BROWSE_VIEW',
              'focuses': 'FOCUS_TAB',
              'blurs': 'BLUR_TAB',
              'moves': 'POINTER_ACTIVITY_RECORD'
            }
            let payload = {}
            let event = {
              id: genId(),
              type: typeMap[type],
              date: new Date(date),
              platform,
              injectionId: sessionId,
              ...payload
            };
            switch (type) {
              case 'changes':
                if (platform === 'youtube') {
                  const channelName = youtubersList[Math.floor(Math.random() * youtubersList.length)]
                  payload = {
                    metadata: {
                      "description": "mock",
                      "keywords": "mock",
                      "interactionCount": "mock",
                      "datePublished": "mock",
                      "uploadDate": "mock",
                      "genre": "mock",
                      url: "mock url",
                      viewType: 'video',
                      title: lang.exclamation(id),
                      shortlinkUrl: "random",
                      videoimageSrc: 'https://i.ytimg.com/vi/14NGU7KpFRI/maxresdefault.jpg',
                      channelName,
                      channelId: channelName,
                      ownerSubcount: Math.round(Math.random() * 10000000000),
                      likesCount: Math.round(Math.random() * 10000000000),
                      channelImageSrc: 'https://yt3.ggpht.com/rTCMq4spCIuBBSRMamqqPZnksnMCc8KA7575JX1_ogBUe1kTAe1aRINxgVOiZj7chSh6KoQACA=s68-c-k-c0x00ffffff-no-rj',

                    }
                    
                    // metadata
                  }
                } else if (platform === 'twitch') {

                }
                break;

              case 'moves':
                payload = {
                  timeSpan: 5000,
                  activityScore: 1
                }
                event = {
                  ...event,
                  ...payload
                }
                events.push(event);
                break;
              case 'focus':
              case 'blurs':
              default:
                event = {
                  ...event,
                }
                events.push(event);
                break;
            }
          })
        }

        sessionIndex++;
      }
    }

  }
  console.log(events);

  return events;
}


let streamersList;
let youtubersList;
readFile('mockGenerationResources/top-youtubers.txt', 'utf8')
  .then(str => {
    youtubersList = str.split('\n');
    return readFile('mockGenerationResources/top-streamers.txt', 'utf8')
  })
  .then(streamers => {
    streamersList = streamers.split('\n');

    // [10,100,1000]

    [10]
      .forEach((numberOfPastDays) => {

        const mockHistory = buildMockData({
          streamersList,
          youtubersList,
          numberOfPastDays,
        })
        //   writeFileSync(`mockData/mock-history-${numberOfPastDays}-days.json`, mockHistory, 'utf8')
      })

  })
