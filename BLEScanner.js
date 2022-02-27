/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"
import Beacon from "./Beacon.js";

function BLEScanner (configurationManager, uplinkHandler) {
    const scanner = new BeaconScanner();
    const beacons = new Map()

    const scan = () => scanner.startScan().then(() => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, 'Started to scan.')
    }).catch((error) => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, `Beacon scanner error: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });

    const inRange = (beacon) => {
        if (configurationManager.getScannerConfig().range.unit.toLowerCase() === 'rssi') {
            return beacon.getRssi() >= configurationManager.getScannerConfig().range.sensitivity
        }
        else {
            return beacon.getDistance() <= configurationManager.getScannerConfig().range.sensitivity
        }
    }

    const removeOldBeacons = () => {
        beacons.forEach((beacon) => {
            if (beacon.updated + configurationManager.getScannerConfig().forgetBeaconMs < Date.now())
            {
                beacons.delete(beacon.uuid)
            }
        })
    }

    const beaconFound = (advertisement) => {
        let beacon = {}
        if (beacons.has(advertisement.iBeacon.uuid)) {
            beacon = beacons.get(advertisement.iBeacon.uuid)
            beacon.addObservation(advertisement.iBeacon.txPower, advertisement.rssi)
        }
        else {
            beacon = new Beacon(advertisement.iBeacon.uuid,
                advertisement.address,
                advertisement.iBeacon.major,
                advertisement.iBeacon.minor)
            beacon.addObservation(advertisement.iBeacon.txPower, advertisement.rssi)
            beacons.set(advertisement.iBeacon.uuid, beacon)
        }

        if (inRange(beacon)) {
            uplinkHandler.publish(configurationManager.getMqttConfig().topics.beacon, JSON.stringify(beacon.getState(), null, ' '))
        }
        else {
            //TODO: Delete else statement
            console.log(JSON.stringify(beacon.getState(), null, 2))
        }
    }

    const filterBeacon = (advertisement) => {
        const beaconUUID = advertisement.iBeacon.uuid.split('-')

        if (configurationManager.getScannerConfig().filters.appId
            && configurationManager.getScannerConfig().filters.companyId) {
            if (beaconUUID[0].toUpperCase() === configurationManager.getAppId().toUpperCase()
                && beaconUUID[1].toUpperCase() === configurationManager.getCompanyId().toUpperCase()) {
                beaconFound(advertisement)
            }
        }
        else if (configurationManager.getScannerConfig().filters.appId) {
            if (beaconUUID[0].toUpperCase() === configurationManager.getAppId().toUpperCase()) {
                beaconFound(advertisement)
            }
        }
        else if (configurationManager.getScannerConfig().filters.companyId) {
            if (beaconUUID[1].toUpperCase() === configurationManager.getCompanyId().toUpperCase()) {
                beaconFound(advertisement)
            }
        }
        else {
            beaconFound(advertisement)
        }
        removeOldBeacons()
    }

    scanner.onadvertisement = (advertisement) => {
        if (advertisement.beaconType === 'iBeacon') {
            filterBeacon(advertisement)
        }
    }

    return { scan }
}

export default BLEScanner
