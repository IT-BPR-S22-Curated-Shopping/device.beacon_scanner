/*
  Libraries used:
    https://github.com/mqttjs/MQTT.js
*/
import * as mqtt from 'mqtt'

function Mqtt(configuration) {
    const state = { client: mqtt.connect(configuration.options), topics: configuration.topics}
    const subscribe = (topic) => state.client.subscribe(topic) 
    const publish = (topic, msg) => state.client.publish(topic, JSON.stringify(msg, null, 2))
    const topics = () => state.topics
    const client = () => state.client
    return {
        client,
        subscribe,
        publish,
        topics
    }
}

export default Mqtt