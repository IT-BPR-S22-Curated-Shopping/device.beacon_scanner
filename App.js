/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import ConfigurationManager from "./utils/ConfigurationManager.js";
import BeaconScanner from "node-beacon-scanner"
import MqttClient from "./mqtt/MqttClient.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import DownLinkHandler from "./mqtt/DownLinkHandler.js";
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { level } from "./utils/MessageLevels.js";
import { logToConsole } from "./utils/ConsoleLogger.js";

const configManager = ConfigurationManager()
const mqttClient = MqttClient(configManager.getMqttConfig().options)
const upLinkHandler = UpLinkHandler(mqttClient, configManager.getMqttConfig().topics)
const scanner = new BeaconScanner();
DownLinkHandler(mqttClient, configManager, upLinkHandler)
BeaconHandler(scanner, configManager, upLinkHandler)

mqttClient.on("error", (error) => {
    logToConsole(level.error, `Can't connect: ${error}`)
    process.exit(1)
});

mqttClient.on("connect", () => {
    logToConsole(level.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.telemetry}`)
    upLinkHandler.sendTelemetry(level.info, 'MQTT connected.') 
    mqttClient.subscribe(configManager.getMqttConfig().topics.config)
    scanner.startScan().then((uplinkHandler) => {
        upLinkHandler.sendTelemetry(level.info, 'Started to scan.')
    }).catch((error, uplinkHandler) => {
        upLinkHandler.sendTelemetry(level.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    upLinkHandler.sendStatus('ONLINE')
})