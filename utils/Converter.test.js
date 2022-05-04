import { rssiToMeters } from './Converter.js'

const txPower = 65;
const rssi = 50;

test('ConvertRssiToMeters', () => {
    expect(rssiToMeters(txPower, rssi)).toBe((10**((Number(txPower) - Number(rssi)) / (10 * 2))).toFixed(2));
});