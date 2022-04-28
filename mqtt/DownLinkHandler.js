import { MessageLevel } from "../utils/MessageLevel.js";

function DownLinkHandler(mqttClient, configurationManager, upLinkHandler) {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case configurationManager.getMqttConfig().topics.config:
                configurationManager.updateConfiguration(JSON.parse(message.toString()), upLinkHandler.sendTelemetry)
                break
            default:
                upLinkHandler.sendTelemetry(MessageLevel.warning, `Unknown topic ${topic} received message: ${message}`)
                break
        }
    })
}

export default  DownLinkHandler