import { level, telemetryMessage } from "../utils/TelemetryMessage.js";

function DownLinkHandler(mqttClient, configurationManager, upLinkHandler) {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case configurationManager.getMqttConfig().topics.config:
                configurationManager.updateConfiguration(message)
                break
            default:
                upLinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry,
                    telemetryMessage(level.error, `Unknown topic ${topic} received message: ${message}`))
                break
        }
    })
}

export default  DownLinkHandler