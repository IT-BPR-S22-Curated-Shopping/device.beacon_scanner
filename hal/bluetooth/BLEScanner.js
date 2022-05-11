/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"
import Beacon from "../../models/Beacon.js"
import { logToConsole } from "../../utils/ConsoleLogger.js"
import { MessageLevel } from "../../utils/MessageLevel.js"
import { detection } from "../../models/Detection.js"
import { rssiToMeters } from "../../utils/Converter.js"

function BLEScanner(configManager, upLinkHandler) {
    const state = { handle: new BeaconScanner(), beacons: new Map() }
    const beaconFound = (advertisement) => {
        let beacon = {}

        if (state.beacons.has(advertisement.iBeacon.uuid)) {
            beacon = state.beacons.get(advertisement.iBeacon.uuid)
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
            state.beacons.set(advertisement.iBeacon.uuid, beacon)
        }

        if (beacon.getNoOfObservations() >= configManager.getScannerConfig().noiseFilter.observations.min) {
            if (inRange(beacon.getRssi(), beacon.getDistance(),
                configManager.getScannerConfig().range.targetSensitivity)) {
                upLinkHandler.sendBeacon(detection(beacon.getUuid(), beacon.getUpdated()))
                logToConsole(MessageLevel.debug, `Sending beacon with rssi: ${beacon.getRssi()}`)
            }
        }
    }
    const isValidAppId = (appId) => {
        if (appId.toUpperCase() === configManager.getAppId().toUpperCase()) {
            return true
        }
        else {
            logToConsole(MessageLevel.debug, `Invalid app ID: ${appId}`)
            return false;
        } 
    }
    const isValidCompanyId = (companyId) => {
        if (companyId.toUpperCase() === configManager.getCompanyId().toUpperCase()) {
            return true
        }
        else {
            logToConsole(MessageLevel.debug, `Invalid company ID: ${companyId}`)
            return false
        }
    }
    const isValidUUID = (uuid) => {
        const parts = uuid.split('-')
        
        if (configManager.getScannerConfig().detectFilter.onAppId
            && configManager.getScannerConfig().detectFilter.onCompanyId) {
            return isValidAppId(parts[1]) && isValidCompanyId(parts[0])
        }
        else if (configManager.getScannerConfig().detectFilter.onAppId) {
            return isValidAppId(parts[1])
        }
        else if (configManager.getScannerConfig().detectFilter.onCompanyId) {
            return isValidCompanyId(parts[0])
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
        state.beacons.forEach((value, key) => {
            if (value.getUpdated() + configManager.getScannerConfig().forgetBeaconMs < Date.now()) {
                state.beacons.delete(key)
                logToConsole(MessageLevel.debug, `Beacon deleted with key: ${key}`)
            }
        })
    }
    state.handle.onadvertisement = (advertisement) => {
        switch (advertisement.beaconType) {
            case 'iBeacon':
                logToConsole(MessageLevel.debug, `iBeacon found: ${advertisement.iBeacon.uuid}`)
                handleIBeacon(advertisement)
                break
            default:
                break
        }
        removeOldBeacons()
    }
    const activate = () => state.handle.startScan()
    .then(() => upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning active'))
    .catch((error) => {
        upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    const deactivate = () => {
        state.handle.stopScan()
        upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning inactive')
    }
    return {
        activate, 
        deactivate
    } 
}

export default BLEScanner