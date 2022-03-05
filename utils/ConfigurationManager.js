import settings from '../local.settings.json' assert {type: "json"}
import { level } from "./TelemetryMessage.js";

function ConfigurationManager() {
    const state = {
        mqttConfig: {
            url: `${settings.mqttConfig.protocol}://${settings.mqttConfig.host}:${settings.mqttConfig.port}`,
            topics: {
                config: `${settings.companyId}/${settings.deviceId}/config`,
                status: `${settings.companyId}/${settings.deviceId}/status`,
                telemetry: `${settings.companyId}/${settings.deviceId}/telemetry`,
                beacon: `${settings.companyId}/${settings.deviceId}/beacon`
            },
            options: {
                clientId: settings.deviceId,
                username: settings.mqttConfig.username,
                password: settings.mqttConfig.password,
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
                    min: 1,
                    max: 10,
                },
                lastRssiWeight: 0.4
            },
            filter: {
                onAppId: settings.scannerConfig.filter.onAppId,
                onCompanyId: settings.scannerConfig.filter.onCompanyId
            }
        }
    }
    const getMqttConfig = () => state.mqttConfig
    const getScannerConfig = () => state.scannerConfig
    const updateConfiguration = (payload, telemetryCallBack) => {
        switch (payload.type) {
            case 'mqtt':
                state.mqttConfig = payload.config
                telemetryCallBack(level.info, 'MQTT configuration updated.')
                break
            case 'scanner':
                state.scannerConfig = payload.config
                telemetryCallBack(level.info, 'Scanner configuration updated.')
                break
            default:
                telemetryCallBack(level.error, `Unknown configuration type received: ${payload}`)
                break
        }
    }

    return { getMqttConfig, getScannerConfig, updateConfiguration }
}

export default ConfigurationManager