import ConfigurationManager from "./ConfigurationManager.js";
import MqttClient from "./mqtt/MqttClient.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import DownLinkHandler from "./mqtt/DownLinkHandler.js";
import BLEScanner from "./bluetooth/BLEScanner.js";

const configManager = ConfigurationManager()
const mqttClient = MqttClient(configManager.getMqttConfig())
const upLink = UpLinkHandler(mqttClient)
DownLinkHandler(mqttClient, configManager)
const beaconScanner = BLEScanner(configManager, upLink)

mqttClient.on("error", (error) => {
    console.log("Can't connect" + error);
    process.exit(1)
});

mqttClient.on("connect", () => {
    upLink.publish(configManager.getMqttConfig().topics.telemetry, 'mqtt connected.')
    mqttClient.subscribe(configManager.getMqttConfig().topics.config)
    beaconScanner.scan()
    upLink.publish(configManager.getMqttConfig().topics.status, "ONLINE")
})