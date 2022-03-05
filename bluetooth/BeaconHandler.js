import Beacon from "./Beacon.js";
import { rssiToMeters } from "./BeaconUtils.js";
import {level} from "../utils/TelemetryMessage.js";

function BeaconHandler (scanner, configuration, upLinkHandler) {
    const beacons = new Map()

    const beaconFound = (advertisement) => {
        let beacon = {}

        if (beacons.has(advertisement.iBeacon.uuid)) {
            beacon = beacons.get(advertisement.iBeacon.uuid)
            beacon.addObservation(advertisement.rssi,
                advertisement.iBeacon.txPower,
                configuration.noiseFilter.lastRssiWeight)
        }
        else {
            beacon = new Beacon(advertisement.iBeacon.uuid,
                advertisement.address,
                advertisement.iBeacon.major,
                advertisement.iBeacon.minor,
                advertisement.rssi,
                advertisement.distance,
                configuration.noiseFilter.observations.max)
            beacons.set(advertisement.iBeacon.uuid, beacon)
        }

        if (beacon.getNoOfObservations() >= configuration.noiseFilter.observations.min) {
            if (inRange(beacon.getState().rssi, beacon.getState().distance, configuration.range.targetSensitivity)) {
                upLinkHandler.sendBeacon(beacon.getState())
                console.log('-> -> -> -> -> -> Sending beacon with rssi ' + beacon.getState().rssi)
            }
        }
    }

    const isValidAppId = (appId) => appId.toUpperCase() === configuration.appId.toUpperCase()

    const isValidCompanyId = (companyId) => companyId.toUpperCase() === configuration.companyId.toUpperCase()

    const isValidUUID = (uuid) => {
        const parts = uuid.split('-')

        if (configuration.filter.onAppId
            && configuration.filter.onCompanyId) {
            return isValidAppId(parts[0]) && isValidCompanyId(parts[1])
        }
        else if (configuration.filter.onAppId) {
            return isValidAppId(parts[0])
        }
        else if (configuration.filter.onCompanyId) {
            return isValidCompanyId(parts[1])
        }
        else {
            return true
        }
    }

    const inRange = (rssi, distance, sensitivity) => {
        switch (configuration.range.unit.toLowerCase()) {
            case 'rssi':
                return rssi >= sensitivity
            case 'm':
                return distance <= sensitivity
            default:
                upLinkHandler.sendTelemetry(level.error, 'Range unit not configured.! Options: ["rssi", "m"]')
        }
    }

    const handleIBeacon = (advertisement) => {
        advertisement.distance = rssiToMeters(advertisement.iBeacon.txPower, advertisement.rssi)
        if (isValidUUID(advertisement.iBeacon.uuid)) {
            if (inRange(advertisement.rssi, advertisement.distance, configuration.range.detectSensitivity)) {
                beaconFound(advertisement)
                console.log('Beacon found rssi' + advertisement.rssi)
            }
            else {
                //TODO: delete else statement
                console.log('*************************************OUT OF RANGE******************** ' + advertisement.rssi)
            }
        }
    }

    const removeOldBeacons = () => {
        beacons.forEach((value, key) => {
            if (value.getUpdated() + configuration.forgetBeaconMs < Date.now())
            {
                beacons.delete(key)
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!Beacon deleted' + key)
            }
        })
    }

    scanner.onadvertisement = (advertisement) => {
        switch (advertisement.beaconType) {
            case 'iBeacon':
                handleIBeacon(advertisement)
                break
            default:
                break
        }
        removeOldBeacons()
    }
}

export default BeaconHandler