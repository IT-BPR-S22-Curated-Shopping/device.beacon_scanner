import { rssiToMeters , calculateRssi } from './BeaconUtils.js'


function Beacon(uuid, mac, major, minor) {
    const state = {
        uuid: uuid,
        major: major,
        minor: minor,
        mac: mac,
        time: new Date(),
        updated: new Date(),
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
        state.updated = new Date()
    }
    const getState = () => state
    return { getDistance, getRssi, addObservation, getState }
}

export default Beacon
