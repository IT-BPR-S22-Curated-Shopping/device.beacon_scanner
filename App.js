/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/

import ConfigurationManager from "./configuration/ConfigurationManager.js";
import BeaconScanner from "node-beacon-scanner"
import MqttClient from "./mqtt/MqttClient.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import DownLinkHandler from "./mqtt/DownLinkHandler.js";
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { MessageLevel } from "./utils/MessageLevel.js";
import { logToConsole } from "./utils/ConsoleLogger.js";

const configManager = ConfigurationManager()
const mqttClient = MqttClient(configManager.getMqttConfig().options)
const upLinkHandler = UpLinkHandler(mqttClient, configManager.getMqttConfig().topics)
const scanner = new BeaconScanner();
DownLinkHandler(mqttClient, configManager, upLinkHandler)
BeaconHandler(scanner, configManager, upLinkHandler)

mqttClient.on("error", (error) => {
    logToConsole(MessageLevel.error, `Can't connect: ${error}`)
    process.exit(1)
});

mqttClient.on("connect", () => {
    logToConsole(MessageLevel.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.telemetry}`)
    upLinkHandler.sendTelemetry(MessageLevel.info, 'MQTT connected.') 
    mqttClient.subscribe(configManager.getMqttConfig().topics.config)
    scanner.startScan().then((upLinkHandler) => {
        upLinkHandler.sendTelemetry(MessageLevel.info, 'Started to scan.')
    }).catch((error, upLinkHandler) => {
        upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    upLinkHandler.sendStatus('ONLINE')
})