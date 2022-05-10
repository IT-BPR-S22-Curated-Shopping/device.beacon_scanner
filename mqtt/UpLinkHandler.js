function UpLinkHandler(mqtt) {
    const sendStatus = (msg) => mqtt.publish(mqtt.topics().device.status, msg)
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