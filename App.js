import ConfigurationManager from "./ConfigurationManager.js";
import MqttClient from "./MqttClient.js";
import UpLinkHandler from "./UpLinkHandler.js"
import DownLinkHandler from "./DownLinkHandler.js";
import BLEScanner from "./BLEScanner.js";

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
    upLink.publish(configManager.getMqttConfig().topics.telemetry, 'MQTT connected.')
    mqttClient.subscribe(configManager.getMqttConfig().topics.config)
    beaconScanner.scan()
    upLink.publish(configManager.getMqttConfig().topics.status, "ONLINE")
})