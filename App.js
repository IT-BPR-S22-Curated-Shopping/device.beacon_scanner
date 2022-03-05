/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import ConfigurationManager from "./utils/ConfigurationManager.js";
import BeaconScanner from "node-beacon-scanner"
import Mqtt from "./mqtt/Mqtt.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import DownLinkHandler from "./mqtt/DownLinkHandler.js";
import BeaconHandler from "./bluetooth/BeaconHandler.js";
import { level } from "./utils/TelemetryMessage.js";

const configManager = ConfigurationManager()
const mqtt = Mqtt(configManager.getMqttConfig())
const upLinkHandler = UpLinkHandler(mqtt)
const scanner = new BeaconScanner();
DownLinkHandler(mqtt, configManager, upLinkHandler)
BeaconHandler(scanner, configManager.getScannerConfig())

mqtt.client.on("error", (error) => {
    console.log("Can't connect" + error);
    process.exit(1)
});

mqtt.client.on("connect", () => {
    upLinkHandler.sendTelemetry(level.info, 'MQTT connected.')
    mqtt.client.subscribe(mqtt.topics.config)
    scanner.startScan().then((uplinkHandler) => {
        uplinkHandler.sendTelemetry(level.info, 'Started to scan.')
    }).catch((error, uplinkHandler) => {
        uplinkHandler.sendTelemetry(level.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    upLinkHandler.sendStatus('ONLINE')
})