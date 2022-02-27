import { rssiToMeters , calculateRssi } from './BeaconUtils.js'
import {KalmanFilter} from "kalman-filter";

function Beacon(uuid, mac, major, minor) {
    const kFilter = new KalmanFilter()
    const state = {
        uuid: uuid,
        major: major,
        minor: minor,
        mac: mac,
        time: new Date(),
        updated: new Date(),
        rssi: undefined,
        distance: undefined,
        observations: []
    }
    const getDistance = () => state.distance
    const getRssi = () => state.rssi
    const addObservation = (txPower, rssi) => {
        if (state.observations.length === 0) {
            state.rssi = rssi
            state.observations.push(rssi)
            state.distance = rssiToMeters(txPower, rssi)
        }
        else {
            const cr = calculateRssi(state.observations[state.observations.length - 1], rssi)
            state.observations.push(cr)
            state.rssi = kFilter.filterAll(state.observations)
            state.observations.pop()
            state.distance = rssiToMeters(txPower, state.rssi)
            state.observations.push(state.rssi)
        }
        state.updated = new Date()
    }
    const getState = () => JSON.stringify(state)
    return { getDistance, getRssi, addObservation, getState }
}

export default Beacon