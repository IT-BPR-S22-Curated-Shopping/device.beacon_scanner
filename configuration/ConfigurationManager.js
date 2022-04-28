import settings from '../settings.json' assert {type: "json"}
import credentials from '../local.credentials.json' assert {type: "json"}
import { MessageLevel } from "../utils/MessageLevel.js";


function ConfigurationManager() {
    const state = {
        mqttConfig: {
            topics: {
                config: `${settings.companyId}/${settings.deviceId}/config`,
                status: `${settings.companyId}/${settings.deviceId}/status`,
                telemetry: `${settings.companyId}/${settings.deviceId}/telemetry`,
                detection: `${settings.companyId}/${settings.deviceId}/detection`
            },
            options: {
                host: settings.mqttConfig.host,
                port: settings.mqttConfig.port,
                protocol: settings.mqttConfig.protocol,
                clientId: settings.deviceId,
                username: credentials.mqtt.username,
                password: credentials.mqtt.password,
                reconnect: true,
                reconnectPeriod: settings.mqttConfig.reconnectPeriod,
                keepAlive: settings.mqttConfig.keepAlive,
                clean: true,
                will: {
                    topic: `${settings.companyId}/${settings.deviceId}/status`,
                    payload: 'OFFLINE',
                    qos: 2,
                    retain: true
                }
            }
        },
        scannerConfig: {
            appId: settings.appId,
            companyId: settings.companyId,
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