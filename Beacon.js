

function Beacon(uuid, rssi, measuredPower) {
    const state = {
        uuid: uuid,
        mac: "None",
        time: new Date(),
        updated: new Date(),
        filteredRssi: rssi,
        distance: -1,
        observations: [rssi]
    }
    return { state }
}

function iBeacon() {
    const state = {
        ...Beacon,
        major: 0,
        minor: 0,
    }
    return { state }
}

export default iBeacon