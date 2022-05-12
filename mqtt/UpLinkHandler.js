function UpLinkHandler(mqtt) {
    const sendStatus = (isOnline) => mqtt.publish(mqtt.topics().device.status, 
        {
            online: isOnline
        }
    )
    const sendTelemetry = (lvl, msg) => mqtt.publish(mqtt.topics().device.telemetry,
        {
            level: lvl,
            message: msg
        }
    )
    const sendBeacon = (beacon) => mqtt.publish(mqtt.topics().device.detection, beacon)

    return { sendStatus, sendTelemetry, sendBeacon }
}

export default UpLinkHandler