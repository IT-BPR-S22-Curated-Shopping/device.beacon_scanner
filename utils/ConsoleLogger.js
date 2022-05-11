import { MessageLevel } from "./MessageLevel.js"

export const logToConsole = (lvl, msg) => {
    const logLevel = MessageLevel.debug
    if (logLevel === MessageLevel.debug)
    {
        console.log(`Level: ${lvl}, Message: ${msg}`)
    }
    else if (lvl !== MessageLevel.debug)
    {
        console.log(`Level: ${lvl}, Message: ${msg}`)
    }
} 