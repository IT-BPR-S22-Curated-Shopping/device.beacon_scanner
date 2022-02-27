import { rssiToMeters , calculateRssi } from './BeaconUtils.js'


function Beacon(uuid, mac, major, minor) {
    const state = {
        uuid: uuid,
        major: major,
        minor: minor,
        mac: mac,
        time: Date.now(),
        updated: Date.now(),
        rssi: undefined,
        distance: undefined,
        observations: []
    }
    const getDistance = () => state.distance
    const getRssi = () => state.rssi
    const addObservation = (txPower, rssi) => {
        if (typeof state.rssi === 'undefined') {
            state.rssi = rssi
            state.distance = rssiToMeters(txPower, rssi)
            state.observations.push(state.rssi)
        }
        else if (state.observations.length < 3) {
            state.rssi = calculateRssi(state.rssi, rssi)
            state.distance = rssiToMeters(txPower, state.rssi)
            state.observations.push(state.rssi)
        }
        else {
            let rssiSum = 0
            state.observations.forEach((rssi) => {
                rssiSum += rssi
            })
            state.rssi = calculateRssi(rssiSum / 3, rssi)
            state.distance = rssiToMeters(txPower, state.rssi)
            state.observations.shift()
            state.observations.push(state.rssi)
        }
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getState = () => state
    return { getDistance, getRssi, addObservation, getUpdated, getState }
}

export default Beacon
