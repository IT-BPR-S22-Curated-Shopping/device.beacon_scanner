/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"
import MqttClient from "./mqtt/MqttClient.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import DownLinkHandler from "./mqtt/DownLinkHandler.js";
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { level } from "./utils/TelemetryMessage.js";

const configManager = ConfigurationManager()
const mqttClient = MqttClient(configManager.getMqttConfig())
const upLinkHandler = UpLinkHandler(mqttClient)
const scanner = new BeaconScanner();
DownLinkHandler(mqttClient, configManager, upLinkHandler)
BeaconHandler(scanner, configManager.getScannerConfig())

mqttClient.on("error", (error) => {
    console.log("Can't connect" + error);
    process.exit(1)
});

mqttClient.on("connect", () => {
    upLinkHandler.sendTelemetry(level.info, 'MQTT connected.')
    mqttClient.subscribe(mqttClient.topics.config)
    scanner.startScan().then((uplinkHandler) => {
        uplinkHandler.sendTelemetry(level.info, 'Started to scan.')
    }).catch((error, uplinkHandler) => {
        uplinkHandler.sendTelemetry(level.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    upLinkHandler.sendStatus('ONLINE')
})