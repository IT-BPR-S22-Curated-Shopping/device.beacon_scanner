import { level } from "../utils/TelemetryMessage.js";

function DownLinkHandler(mqtt, configurationManager, upLinkHandler) {
    mqtt.client.on('message', (topic, message) => {
        switch (topic) {
            case mqtt.topics().config:
                configurationManager.updateConfiguration(message)
                break
            default:
                upLinkHandler.sendTelemetry(level.warning, `Unknown topic ${topic} received message: ${message}`)
                break
        }
    })
}

export default  DownLinkHandler