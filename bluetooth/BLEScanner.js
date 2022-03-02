/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"
import Beacon from "./Beacon.js";
import { rssiToMeters } from "./BeaconUtils.js"
import { level, telemetryMessage} from "../utils/TelemetryMessage.js";

function BLEScanner (configurationManager, uplinkHandler) {
    const scanner = new BeaconScanner();
    const beacons = new Map()

    const scan = () => scanner.startScan().then(() => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry,
            telemetryMessage(level.info, 'Started to scan.'))
    }).catch((error) => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry,
            telemetryMessage(level.error, `Beacon scanner: ${error}`))
        setTimeout(() => process.exit(1), 1000)
    });

    const removeOldBeacons = () => {
        beacons.forEach((value, key) => {
            if (value.getUpdated() + configurationManager.getScannerConfig().forgetBeaconMs < Date.now())
            {
                beacons.delete(key)
            }
        })
    }

    const beaconFound = (advertisement) => {
        let beacon = {}
        if (beacons.has(advertisement.iBeacon.uuid)) {
            beacon = beacons.get(advertisement.iBeacon.uuid)
            beacon.addObservation(advertisement.rssi, advertisement.iBeacon.txPower)
        }
        else {
            beacon = new Beacon(advertisement.iBeacon.uuid,
                advertisement.address,
                advertisement.iBeacon.major,
                advertisement.iBeacon.minor,
                advertisement.rssi,
                advertisement.distance)
            beacons.set(advertisement.iBeacon.uuid, beacon)
        }

        if (beacon.getNoOfObservations() > 3) {
            uplinkHandler.publish(configurationManager.getMqttConfig().topics.beacon, beacon.getState())
        }

    }

    const isValidAppId = (appId) => appId.toUpperCase() === configurationManager.getAppId().toUpperCase()

    const isValidCompanyId = (companyId) => companyId.toUpperCase() === configurationManager.getCompanyId().toUpperCase()

    const isValidUUID = (uuid) => {
        const beaconUUID = uuid.split('-')

        if (configurationManager.getScannerConfig().filters.appId
            && configurationManager.getScannerConfig().filters.companyId) {
            return isValidAppId(beaconUUID[0]) && isValidCompanyId(beaconUUID[1])
        }
        else if (configurationManager.getScannerConfig().filters.appId) {
            return isValidAppId(beaconUUID[0])
        }
        else if (configurationManager.getScannerConfig().filters.companyId) {
            return isValidCompanyId(beaconUUID[1])
        }
        else {
            return true
        }
    }

    const inRange = (advertisement) => {
        switch (configurationManager.getScannerConfig().filters.range.unit.toLowerCase()) {
            case 'rssi':
                return advertisement.rssi >= configurationManager.getScannerConfig().filters.range.sensitivity
            case 'm':
                return advertisement.distance <= configurationManager.getScannerConfig().filters.range.sensitivity
            default:
                uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry,
                    telemetryMessage(level.error, 'Range unit not configured.! Options: ["rssi", "m"]'))
        }
    }

    scanner.onadvertisement = (advertisement) => {
        if (advertisement.beaconType === 'iBeacon') {
            advertisement.distance = rssiToMeters(advertisement.iBeacon.txPower, advertisement.rssi)
            if (inRange(advertisement)) {
                if (isValidUUID(advertisement)) {
                    beaconFound(advertisement)
                }
            }
            else {
                //TODO: delete else statement
                console.log(JSON.stringify(advertisement, null, 2))
            }
        }
        removeOldBeacons()
    }

    return { scan }
}

export default BLEScanner
