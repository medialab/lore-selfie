// https://twitchtracker.com/channels/ranking/french
// Array.from(document.querySelectorAll('td:nth-child(odd) a')).map(el => el.getAttribute('href').slice(1)).join('\n')

import { readFile } from 'fs/promises';
import {writeFile, writeFileSync} from 'fs';
import { csvFormat } from 'd3-dsv';
import { Language } from 'voynich-ipsum';
import { v4 as genId } from 'uuid';

const lang = new Language({ seed: 1 });

const PLATFORMS = ['twitch', 'youtube']

const buildMockData = ({
  streamersList,
  startOfUse,
  endOfUse,
}) => {
  // build list of watched streamers
  const numberOfWatchedStreamers = Math.round(Math.random() * 9) + 1;
  const watchedStreamers = [];
  const toPick = [...streamersList];
  for (let i = 0; i < numberOfWatchedStreamers; i++) {
    const index = parseInt(Math.random() * toPick.length);
    watchedStreamers.push(toPick[index]);
    toPick.splice(index, 1);
  }
  // compute period of logging
  const endOfUseReal = endOfUse || new Date().getTime();
  const startOfUseReal = startOfUse || endOfUseReal - (3 * 30 * 24 * 3600 * 1000) // 3 months;

  const DAY = 24 * 3600 * 1000;
  const slices = [];
  for (let i = startOfUseReal; i < endOfUseReal + DAY; i += DAY) {
    const numberOfSlices = parseInt(Math.random() * 5);
    let sliceStartRel = parseInt(Math.random() * (DAY * .2));
    let currentSliceIndex = 0;
    while (currentSliceIndex < numberOfSlices && sliceStartRel < DAY) {
      const remainingTime = DAY - sliceStartRel;
      const duration = parseInt(Math.random() * remainingTime * .8);
      const sliceStart = i + sliceStartRel;
      const sliceEnd = i + sliceStartRel + duration;
      const slicePlatform = PLATFORMS[parseInt(Math.random() * PLATFORMS.length)];
      const isReplay = slicePlatform === 'twitch' ? Math.random() * .2 > .5 : true;
      const slice = {
        startTime: sliceStart,
        endTime: sliceEnd,
        startTimeStr: new Date(sliceStart),
        endTimeStr: new Date(sliceEnd),
        contentChannel: streamersList[parseInt(Math.random() * streamersList.length)],
        contentTitle: lang.assertion('pwet'),
        contentPlatform: slicePlatform,
        isReplay,
        id: genId()
      }
      slices.push(slice)
      sliceStartRel += duration + parseInt(Math.random() * remainingTime * .8);
      currentSliceIndex++;
    }

  }
  const minutes = [];
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    let startMinute = slice.startTime - slice.startTime % 60000;
    const avgMessagesPerMinutes = parseInt(Math.random() * 1000);
    const messagesVariation = avgMessagesPerMinutes * Math.random() * .1;

    const avgNumberOfViewers = parseInt(avgMessagesPerMinutes * 10 * Math.random());
    const viewersVariation = avgNumberOfViewers * Math.random() * .1;

    const isFocused = Math.random() > .5;
    const isActive = isFocused ? Math.random() * .5 : false;

    let userChatMessages;
    if (!slice.isReplay) {
      const hasMessaged = Math.round(Math.random() * .6);
      if (hasMessaged) {
        const numberOfMessages = parseInt(Math.random() * 3);
        userChatMessages = [];
        for (let j = 0 ; j < numberOfMessages ; j++) {
          userChatMessages.push(lang.exclamation('pfew'))
        }
        userChatMessages = userChatMessages.join('|')
      }
    }

    while (startMinute < slice.endTime + 60000) {
      const minute = {
        sliceId: slice.id,
        startTime: startMinute,
        startTimeStr: new Date(startMinute),
        nbMessages: parseInt(avgMessagesPerMinutes - messagesVariation + Math.random() * messagesVariation * 2),
        nbViewers: parseInt(avgNumberOfViewers - viewersVariation + Math.random() * viewersVariation * 2),
        userIsFocused: isFocused,
        userIsActive: isActive,
        userChatMessages
      }
      minutes.push(minute)
      startMinute += 60000;
    }
  }
  // console.log(minutes)
  return {
    slices,
    minutes
  }
}

readFile('top-streamers.txt', 'utf8')
  .then(streamers => {
    const streamersList = streamers.split('\n')
    const {
      slices,
      minutes
    } = buildMockData({ streamersList });

    writeFileSync('mockData/mock-slices.csv', csvFormat(slices), 'utf8')
    writeFileSync('mockData/mock-minutes.csv', csvFormat(minutes), 'utf8')
  })