/*
  Libraries used:
    https://github.com/mqttjs/MQTT.js
*/
import * as mqtt from 'mqtt'

function MqttClient(configuration) {
    const getClient = () => mqtt.connect(configuration.url, configuration.options)
    const publish = (topic, msg) => getClient().publish(topic, JSON.stringify(msg, null, 2))
    const topics = () => {
        return {
            config: configuration.topics.config,
            status: configuration.topics.status,
            telemetry: configuration.topics.telemetry,
            beacon: configuration.topics.beacon
        }
    }
    return { getClient, publish, topics }
}

export default MqttClient