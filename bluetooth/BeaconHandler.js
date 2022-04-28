import Beacon from "./Beacon.js";
import { rssiToMeters } from "../utils/Converter.js";
import {MessageLevel} from "../utils/MessageLevel.js";
import { logToConsole } from "../utils/ConsoleLogger.js";
import { detection } from "./Detection.js";

function BeaconHandler (scanner, configManager, upLinkHandler) {
    const beacons = new Map()

    const beaconFound = (advertisement) => {
        let beacon = {}

        if (beacons.has(advertisement.iBeacon.uuid)) {
            beacon = beacons.get(advertisement.iBeacon.uuid)
            beacon.addObservation(advertisement.rssi,
                advertisement.iBeacon.txPower)
        }
        else {
            beacon = new Beacon(advertisement.iBeacon.uuid,
                advertisement.address,
                advertisement.iBeacon.major,
                advertisement.iBeacon.minor,
                advertisement.rssi,
                advertisement.distance,
                configManager.getScannerConfig().noiseFilter)
            beacons.set(advertisement.iBeacon.uuid, beacon)
        }

        if (beacon.getNoOfObservations() >= configManager.getScannerConfig().noiseFilter.observations.min) {
            if (inRange(beacon.getRssi(), beacon.getDistance(),
                configManager.getScannerConfig().range.targetSensitivity)) {
                upLinkHandler.sendBeacon(detection(beacon.getUuid(), beacon.getUpdated()))
                logToConsole(MessageLevel.debug, `Sending beacon with rssi: ${beacon.getRssi()}`)
            }
        }
    }
    
    const isValidAppId = (appId) => appId.toUpperCase() === configManager.getScannerConfig().appId.toUpperCase()
    
    const isValidCompanyId = (companyId) => companyId.toUpperCase() === configManager.getScannerConfig().companyId.toUpperCase()
    
    const isValidUUID = (uuid) => {
        const parts = uuid.split('-')
        
        if (configManager.getScannerConfig().detectFilter.onAppId
            && configManager.getScannerConfig().detectFilter.onCompanyId) {
            return isValidAppId(parts[0]) && isValidCompanyId(parts[1])
        }
        else if (configManager.getScannerConfig().detectFilter.onAppId) {
            return isValidAppId(parts[0])
        }
        else if (configManager.getScannerConfig().detectFilter.onCompanyId) {
            return isValidCompanyId(parts[1])
        }
        else {
            return true
        }
    }

    const inRange = (rssi, distance, sensitivity) => {
        switch (configManager.getScannerConfig().range.unit.toLowerCase()) {
            case 'rssi':
                return rssi >= sensitivity
                case 'm':
                return distance <= sensitivity
            default:
                upLinkHandler.sendTelemetry(MessageLevel.error, 'Range unit not configured.! Options: ["rssi", "m"]')
                return false
        }
    }
        
    const handleIBeacon = (advertisement) => {
        advertisement.distance = rssiToMeters(advertisement.iBeacon.txPower, advertisement.rssi)
        if (isValidUUID(advertisement.iBeacon.uuid)) {
            if (inRange(advertisement.rssi, advertisement.distance, configManager.getScannerConfig().range.detectSensitivity)) {
                beaconFound(advertisement)
                logToConsole(MessageLevel.debug, `Beacon found with rssi: ${advertisement.rssi}`)
            }
            else {
                logToConsole(MessageLevel.debug, `Beacon out of range: ${advertisement.rssi}`)
            }
        }
    }
        
    const removeOldBeacons = () => {
        beacons.forEach((value, key) => {
            if (value.getUpdated() + configManager.getScannerConfig().forgetBeaconMs < Date.now()) {
                beacons.delete(key)
                logToConsole(MessageLevel.debug, `Beacon deleted with key: ${key}`)
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