import { calculateRssi } from './BeaconUtils.js'

function Beacon(uuid, mac, major, minor, rssi, distance) {
    const state = {
        uuid: uuid,
        major: major,
        minor: minor,
        mac: mac,
        time: Date.now(),
        updated: Date.now(),
        rssi: rssi,
        distance: distance
    }
    const addObservation = (rssi, distance) => {
        state.rssi = calculateRssi(state.rssi, rssi)
        state.distance = distance
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getState = () => state
    return { addObservation, getUpdated, getState }
}

export default Beacon
