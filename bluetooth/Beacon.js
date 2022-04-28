import { rssiToMeters } from './BeaconUtils.js'
import {KalmanFilter1D} from "../utils/KalmanFilter1D.js";

function Beacon(uuid, mac, major, minor, rssi, distance, noiseFilter) {
    const kFilter = new KalmanFilter1D({ R: noiseFilter.kalmanSettings.r, Q: noiseFilter.kalmanSettings.q})
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
        state.rssi =  kFilter.filter(rssi)
        if (state.observations.length === noiseFilter.observations.max) {
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
