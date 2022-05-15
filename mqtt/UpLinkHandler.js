function UpLinkHandler(mqtt) {
    const sendStatus = (deviceState) => mqtt.publish(
        mqtt.topics().device.status, 
        {
            state: deviceState
        }
    )
    const sendTelemetry = (lvl, msg) => mqtt.publish(
        mqtt.topics().device.telemetry,
        {
            level: lvl,
            message: msg
        }
    )
    const sendBeacon = (beacon) => mqtt.publish(
        mqtt.topics().device.detection,
        beacon
    )
    const sendHello = (companyId, deviceId) => mqtt.publish(
        mqtt.topics().backend.hello,
        { 
            company: companyId, 
            device: { 
                id: deviceId,
                type: "BLE"
            }
        }
    )

    return { sendStatus, sendTelemetry, sendBeacon, sendHello }
}

export default UpLinkHandler