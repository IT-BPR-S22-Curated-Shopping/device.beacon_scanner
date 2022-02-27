/*
  Libraries used:
    https://github.com/mqttjs/MQTT.js
*/
import * as mqtt from 'mqtt'

function MqttClient(configuration) {
    return mqtt.connect(configuration.url, configuration.options)
}

export default MqttClient