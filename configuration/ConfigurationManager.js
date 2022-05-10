import settings from '../settings.json' assert {type: "json"}
import credentials from '../local.credentials.json' assert {type: "json"}
import { MessageLevel } from "../utils/MessageLevel.js";
import { Status } from '../utils/Status.js';
import { networkInterfaces } from 'node:os'


function ConfigurationManager() {
    const deviceId = networkInterfaces().wlan0[0].mac
    const companyId = settings.companyId
    const state = {
        mqttConfig: {
            topics: {
                device: {
                    root: `${companyId}/${deviceId}`,
                    config: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.configuration}`,
                    command: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.command}`,
                    status: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.status}`,
                    telemetry: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.telemetry}`,
                    detection: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.detection}`
                },
                backend: {
                    hello: settings.mqttConfig.topics.backend.hello,
                    status: settings.mqttConfig.topics.backend.status
                }
            },
            options: {
                host: settings.mqttConfig.host,
                port: settings.mqttConfig.port,
                protocol: settings.mqttConfig.protocol,
                clientId: deviceId,
                username: credentials.mqtt.username,
                password: credentials.mqtt.password,
                reconnect: true,
                reconnectPeriod: settings.mqttConfig.reconnectPeriod,
                keepAlive: settings.mqttConfig.keepAlive,
                clean: true,
                will: {
                    topic: `${companyId}/${deviceId}/${settings.mqttConfig.topics.device.status}`,
                    payload: Status.offline,
                    qos: 2,
                    retain: true
                }
            }
        },
        scannerConfig: {
            appId: "010d2108",
            companyId: companyId,
            forgetBeaconMs: settings.scannerConfig.forgetBeaconMs,
            range: {
                unit: settings.scannerConfig.range.unit,
                detectSensitivity: settings.scannerConfig.range.detectSensitivity,
                targetSensitivity: settings.scannerConfig.range.targetSensitivity
            },
            noiseFilter: {
                observations: {
                    min: 2,
                    max: 3,
                },
                kalmanSettings: {
                    r: 0.01,
                    q: 1
                }
            },
            detectFilter: {
                onAppId: settings.scannerConfig.filter.onAppId,
                onCompanyId: settings.scannerConfig.filter.onCompanyId
            }
        }
    }
    const getMqttConfig = () => state.mqttConfig
    const getScannerConfig = () => state.scannerConfig
    const updateConfiguration = (payload, callBack) => {
        switch (payload.type) {
            case 'mqtt':
                callBack(MessageLevel.warning, 'MQTT configuration update not implemented.')
                break
            case 'scanner':
                state.scannerConfig = payload.config
                callBack(MessageLevel.info, 'Scanner configuration updated.')
                break
            default:
                callBack(MessageLevel.warning, `Unknown configuration type received: ${payload}`)
                break
        }
    }

    return { getMqttConfig, getScannerConfig, updateConfiguration }
}

export default ConfigurationManager