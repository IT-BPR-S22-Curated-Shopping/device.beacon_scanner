/*
  Libraries used:
    https://github.com/mqttjs/MQTT.js
*/
import * as mqtt from 'mqtt'

function Mqtt(configuration) {
    const client = mqtt.connect(configuration.url, configuration.options)
    const publish = (topic, msg) => client.publish(topic, JSON.stringify(msg, null, 2))
    const topics = () => {
        return {
            config: configuration.topics.config,
            status: configuration.topics.status,
            telemetry: configuration.topics.telemetry,
            beacon: configuration.topics.beacon
        }
    }
    return { client, publish, topics }
}

export default Mqtt