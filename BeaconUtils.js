const alpha = 0.4
export const rssiToMeters = (txPower, rssi) => (10**((Number(txPower) - Number(rssi)) / (10 * 4))).toFixed(2)
export const calculateRssi = (lastRssi, currentRssi) => alpha * lastRssi + (1 - alpha) * currentRssi
