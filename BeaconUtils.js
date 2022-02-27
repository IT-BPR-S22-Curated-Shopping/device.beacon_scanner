const rssiToMeters = (measuredPower, rssi) => 10**((Number(measuredPower) - Number(rssi)) / (10 * 3)).toFixed(2)

