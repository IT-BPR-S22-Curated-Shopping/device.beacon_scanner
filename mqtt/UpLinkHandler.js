import { telemetryMessage } from "../utils/TelemetryMessage.js";

function UpLinkHandler(mqttClient) {
    const sendStatus = (msg) => mqttClient.publish(mqttClient.topics().status, msg)
    const sendTelemetry = (level, msg) => mqttClient.publish(mqttClient.topics().telemetry,
        telemetryMessage(level, msg))
    const sendBeacon = (beacon) => mqttClient.publish(mqttClient.topics().beacon, beacon)

    return { sendStatus, sendTelemetry, sendBeacon }
}

export default UpLinkHandler