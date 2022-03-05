import { telemetryMessage } from "../utils/TelemetryMessage.js";

function UpLinkHandler(mqtt) {
    const sendStatus = (msg) => mqtt.publish(mqtt.topics().status, msg)
    const sendTelemetry = (level, msg) => mqtt.publish(mqtt.topics().telemetry,
        telemetryMessage(level, msg))
    const sendBeacon = (beacon) => mqtt.publish(mqtt.topics().beacon, beacon)

    return { sendStatus, sendTelemetry, sendBeacon }
}

export default UpLinkHandler