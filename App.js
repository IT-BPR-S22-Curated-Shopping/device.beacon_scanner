/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/

import ConfigurationManager from "./configuration/ConfigurationManager.js";
import BeaconScanner from "node-beacon-scanner"
import Mqtt from "./mqtt/Mqtt.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { MessageLevel } from "./utils/MessageLevel.js";
import { logToConsole } from "./utils/ConsoleLogger.js";

const configManager = ConfigurationManager()
const mqtt = Mqtt(configManager.getMqttConfig())
const upLinkHandler = UpLinkHandler(mqtt, configManager.getMqttConfig().topics)
const scanner = new BeaconScanner();
BeaconHandler(scanner, configManager, upLinkHandler)

mqtt.client().on("error", (error) => {
    logToConsole(MessageLevel.error, `Can't connect: ${error}`)
    process.exit(1)
});

mqtt.client().on("connect", () => {
    logToConsole(MessageLevel.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.device.telemetry}`)
    upLinkHandler.sendStatus('ONLINE')

    mqtt.subscribe(mqtt.topics().device.command)
    upLinkHandler.sendTelemetry(MessageLevel.info, 'Inactive')

    mqtt.subscribe(mqtt.topics().backend.status)
    




    scanner.startScan().then(() => {
        upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning')
    }).catch((error) => {
        upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    
})

mqtt.client().on('message', (topic, message) => {
    switch (topic) {
        case mqtt.topics().device.config:
            configurationManager.updateConfiguration(JSON.parse(message.toString()), upLinkHandler.sendTelemetry)
            break
        case mqtt.topics().device.command:
            console.log(message)
            break
        default:
            upLinkHandler.sendTelemetry(MessageLevel.warning, `Unknown topic ${topic} received message: ${message}`)
            break
    }
})
