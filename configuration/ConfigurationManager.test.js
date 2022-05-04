import settings from '../settings.json' assert {type: "json"}
import credentials from '../local.credentials.json' assert {type: "json"}
import ConfigurationManager from './ConfigurationManager'

let configManager

beforeEach(() => {
    configManager = ConfigurationManager();
});

test('MQTT options host', () => {
    expect(configManager.getMqttConfig().options.host).toBe(settings.mqttConfig.host);
});

test('MQTT options port', () => {
    expect(configManager.getMqttConfig().options.port).toBe(settings.mqttConfig.port);
});

test('MQTT options protocol', () => {
    expect(configManager.getMqttConfig().options.protocol).toBe(settings.mqttConfig.protocol);
});

test('MQTT options username', () => {
    expect(configManager.getMqttConfig().options.username).toBe(credentials.mqtt.username);
});

test('MQTT options password', () => {
    expect(configManager.getMqttConfig().options.password).toBe(credentials.mqtt.password);
});