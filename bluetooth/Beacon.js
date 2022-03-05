import { rssiToMeters } from './BeaconUtils.js'

function Beacon(uuid, mac, major, minor, rssi, distance, maxObservations) {
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
    const calculateRssi = (lastRssi, currentRssi, alpha) => alpha * lastRssi + (1 - alpha) * currentRssi
    const addObservation = (rssi, txPower, lastRssiWeight) => {
        let rssiSum = 0
        state.observations.forEach((obs) => {
            rssiSum += obs
        })
        const rssiAvg = rssiSum / state.observations.length
        console.log('last Avg: ' + rssiAvg)
        state.rssi = calculateRssi(rssiAvg, rssi)
        if (state.observations.length === maxObservations) {
            state.observations.shift()
        }
        state.observations.push(state.rssi)
        state.distance = rssiToMeters(txPower, state.rssi, lastRssiWeight)
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getNoOfObservations = () => state.observations.length
    const getState = () => state
    return { addObservation, getUpdated, getState, getNoOfObservations }
}

export default Beacon
