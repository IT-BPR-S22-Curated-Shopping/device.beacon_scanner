import { level } from "./MessageLevels.js"

export const logToConsole = (lvl, msg) => {
    const logLevel = level.info
    if (logLevel === level.debug)
    {
        console.log(`Level: ${lvl}, Message: ${msg}`)
    }
    else if (lvl !== level.debug)
    {
        console.log(`Level: ${lvl}, Message: ${msg}`)
    }
} 