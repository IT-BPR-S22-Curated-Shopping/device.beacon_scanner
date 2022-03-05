import { level } from "../utils/TelemetryMessage.js";

function DownLinkHandler(mqttClient, configurationManager, upLinkHandler) {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case configurationManager.getMqttConfig().topics.config:
                configurationManager.updateConfiguration(message)
                break
            default:
                upLinkHandler.sendTelemetry(level.warning, `Unknown topic ${topic} received message: ${message}`)
                break
        }
    })
}

export default  DownLinkHandler