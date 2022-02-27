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
            console.log(advertisement)
        }
    };

    return { scan }
}

export default BLEScanner