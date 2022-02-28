export const level = {
    error: "Error",
    info: "Info"
}

export const telemetryMessage = (lvl, msg) => {
    return {
        level: lvl,
        message: msg
    }
}