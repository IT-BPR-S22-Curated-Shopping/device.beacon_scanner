import settings from '../settings.json' assert {type: "json"}
import credentials from '../local.credentials.json' assert {type: "json"}
import { MessageLevel } from "../utils/MessageLevel.js";
import { deviceState } from '../utils/DeviceState.js';

function ConfigurationManager(macAddress) {
    const state = {
        appId: "0462",
        companyId: settings.companyId,
        deviceId: macAddress,
        mqttConfig: {
            topics: {
                device: {
                    config: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.configuration}`,
                    command: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.command}`,
                    status: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.status}`,
                    telemetry: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.telemetry}`,
                    detection: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.detection}`
                },
                backend: {
                    hello: `0462/${settings.mqttConfig.topics.backend.hello}`,
                    status: `0462/${settings.mqttConfig.topics.backend.status}`
                }
            },
            options: {
                host: settings.mqttConfig.host,
                port: settings.mqttConfig.port,
                protocol: settings.mqttConfig.protocol,
                clientId: macAddress,
                username: credentials.mqtt.username,
                password: credentials.mqtt.password,
                reconnect: true,
                reconnectPeriod: settings.mqttConfig.reconnectPeriod,
                keepAlive: settings.mqttConfig.keepAlive,
                clean: true,
                will: {
                    topic: `${settings.companyId}/${macAddress}/${settings.mqttConfig.topics.device.status}`,
                    payload: JSON.stringify(deviceState.offline),
                    qos: 2,
                    retain: false
                }
            }
        },
        scannerConfig: {
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
    const getAppId = () => state.appId
    const getCompanyId = () => state.companyId
    const getDeviceId = () => state.deviceId

    return { getMqttConfig, getScannerConfig, updateConfiguration, getAppId, getCompanyId, getDeviceId}
}

export default ConfigurationManager