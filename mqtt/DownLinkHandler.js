function DownLinkHandler(mqttClient, configurationManager) {
    mqttClient.on('message', (topic, message) => {
        switch (topic) {
            case configurationManager.getMqttConfig().topics.config:
                configurationManager.updateConfiguration(message)
                break
            default:
                console.log(`Topic ${topic} received message: ${message}`)
                break
        }
    })
}

export default  DownLinkHandler