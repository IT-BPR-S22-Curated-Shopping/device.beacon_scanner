import ConfigurationManager from "./configuration/ConfigurationManager.js";
import Mqtt from "./mqtt/Mqtt.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import BLEScanner from "./bluetooth/BLEScanner.js"
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { MessageLevel } from "./utils/MessageLevel.js";
import { logToConsole } from "./utils/ConsoleLogger.js";
import { Commands } from "./utils/Commands.js";
import { Status } from "./utils/Status.js";

const configManager = ConfigurationManager()
const mqtt = Mqtt(configManager.getMqttConfig())
const upLinkHandler = UpLinkHandler(mqtt, configManager.getMqttConfig().topics)
const scanner = BLEScanner(upLinkHandler)
BeaconHandler(scanner.handle(), configManager, upLinkHandler)

mqtt.client().on("error", (error) => {
    logToConsole(MessageLevel.error, `Can't connect: ${error}`)
    process.exit(1)
});

mqtt.client().on("connect", () => {
    logToConsole(MessageLevel.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.device.telemetry}`)
    upLinkHandler.sendStatus(Status.online)

    mqtt.subscribe(mqtt.topics().device.command)
    upLinkHandler.sendTelemetry(MessageLevel.info, 'Inactive')

    mqtt.subscribe(mqtt.topics().backend.status) 
})

mqtt.client().on('message', (topic, message) => {
    const msg = JSON.parse(message.toString().trim())
    switch (topic) {
        case mqtt.topics().device.config:
            configurationManager.updateConfiguration(msg, upLinkHandler.sendTelemetry)
            break
        case mqtt.topics().device.command:
            if (msg.toUpperCase() === Commands.activate) {
                scanner.activate()
            }
            else if (msg.toUpperCase() === Commands.deactivate) {
                scanner.deactivate()
            }
            break
        case mqtt.topics().backend.status:
            if (msg.toUpperCase() === Status.online) {
                mqtt.publish(mqtt.topics().backend.hello, mqtt.topics().device.root)
            }
            else if (msg.toUpperCase() === Status.offline) {
                scanner.deactivate()
            }
            break
        default:
            upLinkHandler.sendTelemetry(MessageLevel.warning, `Unknown topic ${topic} received message: ${message}`)
            break
    }
})
