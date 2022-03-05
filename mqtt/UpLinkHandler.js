import { telemetryMessage } from "../utils/TelemetryMessage.js";

function UpLinkHandler(mqttClient, topics) {
    const publish = (topic, msg) => mqttClient.publish(topic, JSON.stringify(msg, null, 2))
    const sendStatus = (msg) => publish(topics.status, msg)
    const sendTelemetry = (level, msg) => publish(topics.telemetry,
        telemetryMessage(level, msg))
    const sendBeacon = (beacon) => publish(topics.beacon, beacon)

    return { sendStatus, sendTelemetry, sendBeacon }
}

export default UpLinkHandler