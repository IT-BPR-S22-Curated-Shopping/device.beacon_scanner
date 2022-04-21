/*
  Libraries used:
    https://github.com/mqttjs/MQTT.js
*/
import * as mqtt from 'mqtt'

function MqttClient(mqttOptions) {
    return mqtt.connect(mqttOptions)
}

export default MqttClient