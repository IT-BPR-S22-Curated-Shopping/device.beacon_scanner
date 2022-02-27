function UpLinkHandler(mqttClient) {
    const publish = (topic, message) =>  mqttClient.publish(topic, message)

    return { publish }
}

export default UpLinkHandler