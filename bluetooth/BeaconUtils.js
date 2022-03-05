export const rssiToMeters = (txPower, rssi) => (10**((Number(txPower) - Number(rssi)) / (10 * 3))).toFixed(2)

