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

            console.log(beaconUUID[0].toUpperCase())

            if (configurationManager.getScannerConfig().filters.appId
                && configurationManager.getScannerConfig().filters.companyId) {
                if (beaconUUID[0].toUpperCase() === configurationManager.getAppId().toUpperCase()
                    && beaconUUID[1].toUpperCase() === configurationManager.getCompanyId().toUpperCase()) {
                    console.log('App and Company matched')
                    console.log(advertisement)
                }
            }
            else if (configurationManager.getScannerConfig().filters.appId) {
                if (beaconUUID[0].toUpperCase() === configurationManager.getAppId().toUpperCase()) {
                    console.log('app matched')
                    console.log(advertisement)
                }
            }
            else if (configurationManager.getScannerConfig().filters.companyId) {
                if (beaconUUID[1].toUpperCase() === configurationManager.getCompanyId().toUpperCase()) {
                    console.log('Company matched')
                    console.log(advertisement)
                }
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