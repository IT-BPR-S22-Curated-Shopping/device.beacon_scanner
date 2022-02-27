/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"

function BLEScanner (configurationManager, uplinkHandler) {
    const scanner = new BeaconScanner();
    const beacons = []

    const scan = () => scanner.startScan().then(() => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, 'Started to scan.')
    }).catch((error) => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, `Beacon scanner error: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });

    scanner.onadvertisement = (advertisement) => {
        if (advertisement.beaconType === 'iBeacon') {
            const beaconUUID = advertisement.iBeacon.uuid.split('-')

            if (configurationManager.getScannerConfig().filters.appId
                && configurationManager.getScannerConfig().filters.companyId
                && beaconUUID[0] === configurationManager.getAppId()
                && beaconUUID[1] === configurationManager.getCompanyId()) {
                console.log('App and Company matched')
                console.log(advertisement)

            }
            else if (configurationManager.getScannerConfig().filters.appId
                && beaconUUID[0] === configurationManager.getAppId()) {
                console.log('app matched')
                console.log(advertisement)

            }
            else if (configurationManager.getScannerConfig().filters.companyId
                && beaconUUID[1] === configurationManager.getCompanyId()) {
                console.log('Company matched')
                console.log(advertisement)

            }
            else {
                console.log('No filters applied')
                console.log(advertisement)

            }
        }
    };

    return { scan }
}

export default BLEScanner