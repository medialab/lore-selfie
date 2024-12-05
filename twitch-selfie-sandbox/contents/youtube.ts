export {}
import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({
    copiedKeyList: ["shield-modulation"] 
})

export const config: PlasmoCSConfig = {
  // world: "MAIN",
  matches: ["https://www.youtube.com/*"],
}

const waitForYoutubeTitle = async () => {
  const title = document.querySelector('yt-formatted-string.ytd-watch-metadata');
  if (title) {
    const titleString = title.textContent.trim();
    const data = await storage.get("activity");
    const evt = {
      title: titleString,
      platform: 'youtube',
      date: new Date().getTime()
    }
    let updatedData;
    if (data) {
      updatedData = [...data, evt]
    } else {
      updatedData = [evt]
    }
    await storage.set("activity", updatedData);
    // console.log('youtube video title : ', titleString);
    // await storage.set("last-youtube-video", titleString);
    
  } else {
    console.info('waiting 1s for youtube title');
    setTimeout(waitForYoutubeTitle, 1000);
  }
}

waitForYoutubeTitle();
