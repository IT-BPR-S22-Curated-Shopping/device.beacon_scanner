function UpLinkHandler(mqttClient, topics) {
    const publish = (topic, msg) => mqttClient.publish(topic, JSON.stringify(msg, null, 2))
    const sendStatus = (msg) => publish(topics.status, msg)
    const sendTelemetry = (lvl, msg) => publish(topics.device.telemetry,
        {
            level: lvl,
            message: msg
        }
    )
    const sendBeacon = (beacon) => publish(topics.device.detection, beacon)

    return { sendStatus, sendTelemetry, sendBeacon }
}

export default UpLinkHandler