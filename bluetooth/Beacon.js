import { calculateRssi, rssiToMeters } from './BeaconUtils.js'

function Beacon(uuid, mac, major, minor, rssi, distance) {
    const state = {
        uuid: uuid,
        major: major,
        minor: minor,
        mac: mac,
        time: Date.now(),
        updated: Date.now(),
        rssi: rssi,
        distance: distance,
        observations: [ rssi ]
    }
    const addObservation = (rssi, txPower) => {
        let rssiSum = 0
        state.observations.forEach((obs) => {
            rssiSum += obs
        })
        const rssiAvg = rssiSum / state.observations.length
        state.rssi = calculateRssi(rssiAvg, rssi)
        state.distance = rssiToMeters(txPower, state.rssi)
        if (state.observations.length === 10) {
            state.observations.shift()
        }
        state.observations.push(state.rssi)
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getState = () => state
    return { addObservation, getUpdated, getState }
}

export default Beacon
