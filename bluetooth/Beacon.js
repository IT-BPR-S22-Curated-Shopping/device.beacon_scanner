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
        distance: undefined
    }
    const getDistance = () => state.distance
    const getRssi = () => state.rssi
    const addObservation = (txPower, rssi) => {
        if (typeof state.rssi === 'undefined') {
            state.rssi = rssi
            state.distance = rssiToMeters(txPower, rssi)
        }
        else {
            state.rssi = calculateRssi(state.rssi, rssi)
            state.distance = rssiToMeters(txPower, state.rssi)
        }
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getState = () => state
    return { getDistance, getRssi, addObservation, getUpdated, getState }
}

export default Beacon
