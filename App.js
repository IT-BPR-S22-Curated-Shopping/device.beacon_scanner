import ConfigurationManager from "./configuration/ConfigurationManager.js";
import Mqtt from "./mqtt/Mqtt.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import BLEScanner from "./hal/bluetooth/BLEScanner.js"
import { macAddress } from './hal/Information/MacProvider.js'
import { MessageLevel } from "./utils/MessageLevel.js";
import { logToConsole } from "./utils/ConsoleLogger.js";
import { Commands } from "./utils/Commands.js";
import { hello } from "./models/Hello.js"
import { deviceState } from "./utils/DeviceState.js";

const configManager = ConfigurationManager(macAddress())
const mqtt = Mqtt(configManager.getMqttConfig())
const upLinkHandler = UpLinkHandler(mqtt, configManager.getMqttConfig().topics)
const scanner = BLEScanner(configManager, upLinkHandler)

mqtt.client().on("error", (error) => {
    logToConsole(MessageLevel.error, `Can't connect: ${error}`)
    process.exit(1)
});

mqtt.client().on("connect", () => {
    logToConsole(MessageLevel.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.device.telemetry}`)
    
    mqtt.subscribe(mqtt.topics().device.command)
    mqtt.subscribe(mqtt.topics().device.config)
    
    mqtt.subscribe(mqtt.topics().backend.status) 
    upLinkHandler.sendTelemetry(MessageLevel.info, 'Inactive')
})

mqtt.client().on('message', (topic, message) => {
    const msg = message.toString().trim()
    switch (topic) {
        case mqtt.topics().device.config:
            configManager.updateConfiguration(JSON.parse(msg), upLinkHandler.sendTelemetry)
            break
        case mqtt.topics().device.command:
            if (msg.toUpperCase() === Commands.activate) {
                scanner.activate()
            }
            else if (msg.toUpperCase() === Commands.deactivate) {
                scanner.deactivate()
            }
            else if (msg.toUpperCase() === Commands.ready) {
                mqtt.publish(mqtt.topics().device.status, deviceState.online)
                upLinkHandler.sendTelemetry(MessageLevel.info, 'Ready')
            }
            break
        case mqtt.topics().backend.status:
            if (msg.toUpperCase() === deviceState.online) {
                mqtt.publish(mqtt.topics().backend.hello, hello(configManager.getCompanyId(), configManager.getDeviceId()))
            }
            else if (msg.toUpperCase() === deviceState.offline) {
                scanner.deactivate()
            }
            break
        default:
            upLinkHandler.sendTelemetry(MessageLevel.warning, `Unknown topic ${topic} received message: ${message}`)
            break
    }
})
