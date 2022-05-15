import { exec } from "child_process"
import settings from './settings.json' assert {type: "json"}
import ConfigurationManager from "./configuration/ConfigurationManager.js";
import Mqtt from "./mqtt/Mqtt.js";
import UpLinkHandler from "./mqtt/UpLinkHandler.js"
import BLEScanner from "./hal/bluetooth/BLEScanner.js"
import { macAddress } from './hal/Information/MacProvider.js'
import { MessageLevel } from "./utils/MessageLevel.js";
import { logToConsole } from "./utils/ConsoleLogger.js";
import { Commands } from "./utils/Commands.js";
import { status } from "./utils/Status.js"

const environment = {
    production: 'production',
    development: 'development'
}

const envSettings = (env, bleEnabled) => {
    let s = settings
    s.deviceId = bleEnabled ? macAddress() : process.env.COMPUTERNAME.toString().trim()
    if (env === environment.development) {
        s.backendId = environment.development
    }
    return s
} 

const runEnvironment = (env) => {
    const bleEnabled = process.argv.slice(2).length === 0
    const configManager = ConfigurationManager(envSettings(env, bleEnabled))
    const mqtt = Mqtt(configManager.getMqttConfig())
    const upLinkHandler = UpLinkHandler(mqtt, configManager.getMqttConfig().topics)
    let scanner;
    if (bleEnabled) { scanner = BLEScanner(configManager, upLinkHandler) }

    mqtt.client().on("error", (error) => {
        logToConsole(MessageLevel.error, `MQTT unable to connect: ${error}`)
        process.exit(1)
    });
    
    mqtt.client().on("connect", () => {
        logToConsole(MessageLevel.info, `MQTT Connected. For application status see topic: ${configManager.getMqttConfig().topics.device.telemetry}`)
        
        mqtt.subscribe(mqtt.topics().device.error)
        mqtt.subscribe(mqtt.topics().device.command)
        mqtt.subscribe(mqtt.topics().device.config)
        mqtt.subscribe(mqtt.topics().backend.status) 

        upLinkHandler.sendStatus(status.online)
        upLinkHandler.sendTelemetry(MessageLevel.info, 'Inactive')
    })
    
    mqtt.client().on('message', (topic, message) => {
        const msg = JSON.parse(message.toString('utf-8').trim())
        switch (topic) {
            case mqtt.topics().device.config:
                configManager.updateConfiguration(msg, upLinkHandler.sendTelemetry)
                break
            case mqtt.topics().device.command:
                if (msg.instruction === Commands.activate) {
                    if (bleEnabled) { 
                        scanner.activate() 
                        upLinkHandler.sendStatus(status.active)
                    }
                    else { logToConsole(MessageLevel.warning, 'Device recieved instruction: ' + msg.instruction) }
                }
                else if (msg.instruction === Commands.deactivate) {
                    if (bleEnabled) { 
                        scanner.deactivate() 
                        upLinkHandler.sendStatus(status.online)
                    }
                    else { logToConsole(MessageLevel.warning, 'Device recieved instruction: ' + msg.instruction) }
                }
                else if (msg.instruction === Commands.ready) {
                    upLinkHandler.sendStatus(status.ready)
                    upLinkHandler.sendTelemetry(MessageLevel.info, 'Recieved ready from backend.')
                }
                break
            case mqtt.topics().backend.status:
                if (msg.online) {
                    upLinkHandler.sendHello(configManager.getCompanyId(), configManager.getDeviceId())
                }
                else {
                    if (scanner) { 
                        scanner.deactivate() 
                    }
                    upLinkHandler.sendStatus(status.online)
                    upLinkHandler.sendTelemetry(MessageLevel.warning, "Backend disconnected. Scanning stopped.")
                }
                break
            case mqtt.topics().device.error:
                logToConsole(MessageLevel.error, msg.payload)
                break;
            default:
                upLinkHandler.sendTelemetry(MessageLevel.warning, `Unknown topic ${topic} received message: ${message}`)
                break
        }
    })
}

const initEnvironment = () => exec('git branch --show-current', (err, stdout, stderr) => {
    if (err || stderr) {
        logToConsole(MessageLevel.warning, 'Git branch not found. Starting with development settings.')
        runEnvironment(environment.development)
    }

    if (typeof stdout === 'string') {
      if (stdout.trim() === 'main') {
        logToConsole(MessageLevel.info, 'Starting with production settings.');
        runEnvironment(environment.production)
      } 
      else {
        logToConsole(MessageLevel.info, `On branch: ${stdout.trim()} - Starting with development settings.`);
        runEnvironment(environment.development)
      }
    }
})

initEnvironment()



