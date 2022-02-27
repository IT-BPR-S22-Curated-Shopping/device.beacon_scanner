const settings = require('./local.settings.json');

function ConfigurationManager() {
    const state = {
        deviceId: settings.deviceId,
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
            beaconTypes: settings.scannerConfig.beaconTypes,
            range: settings.scannerConfig.range,
            noiseFilterSamples: settings.scannerConfig.filterSamples,
            forgetBeaconMs: settings.scannerConfig.forgetBeaconMs,
            filter: settings.scannerConfig.filters
        }
    }
    const getDeviceId = () => state.deviceId
    const getMqttConfig = () => state.mqttConfig
    const getScannerConfig = () => state.scannerConfig
    const updateConfiguration = (config) => console.log(`Configuration update not implemented. Received: ${config}`)

    return { getDeviceId, getMqttConfig, getScannerConfig, updateConfiguration }
}

export default ConfigurationManager