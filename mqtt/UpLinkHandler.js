function UpLinkHandler(mqttClient) {
    const publish = (topic, message) =>  mqttClient.publish(topic, JSON.stringify(message, null, 2))

    return { publish }
}

export default UpLinkHandler