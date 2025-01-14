import "@plasmohq/messaging/background"

import { startHub } from "@plasmohq/messaging/pub-sub"

console.debug(`BGSW - Starting Hub`)
startHub()