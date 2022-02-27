/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
*/
import BeaconScanner from "node-beacon-scanner"

function BeaconScanner (configurationManager, uplinkHandler) {
    const scanner = new BeaconScanner();
    const beacons = []

    const scan = () => scanner.startScan().then(() => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, 'Started to scan.')
    }).catch((error) => {
        uplinkHandler.publish(configurationManager.getMqttConfig().topics.telemetry, `Beacon scanner error: ${error}`)
    });

    scanner.onadvertisement = (advertisement) => {
        if (advertisement.beaconType === 'iBeacon') {
            console.log(advertisement)
        }
    };

    return { scan }
}

export default BeaconScanner