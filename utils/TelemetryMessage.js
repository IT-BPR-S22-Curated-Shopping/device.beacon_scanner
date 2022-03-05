export const level = {
    info: "info",
    warning: "warning",
    error: "error"
}

export const telemetryMessage = (lvl, msg) => {
    return {
        level: lvl,
        message: msg
    }
}