import { rssiToMeters } from './BeaconUtils.js'
import {KalmanFilter1D} from "../utils/KalmanFilter1D.js";

function Beacon(uuid, mac, major, minor, rssi, distance, maxObservations) {
    const kFilter = new KalmanFilter1D({ R: 0.01, Q: 1})
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
        if (state.observations.length === maxObservations) {
            state.observations.shift()
        }
        state.observations.push(state.rssi)
        state.distance = rssiToMeters(txPower, state.rssi)
        state.updated = Date.now()
    }
    const getUpdated = () => state.updated
    const getNoOfObservations = () => state.observations.length
    const getState = () => state
    return { addObservation, getUpdated, getState, getNoOfObservations }
}

export default Beacon
