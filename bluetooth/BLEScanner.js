import BeaconScanner from "node-beacon-scanner"

function BLEScanner(upLinkHandler) {
    const state = { scanner: new BeaconScanner() }
    const activate = () => state.scanner.startScan()
        .then(() => upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning active'))
        .catch((error) => {
            upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
            setTimeout(() => process.exit(1), 1000)
        });
    const deactivate = () => state.scanner.stopScan()
        .then(() => upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning inactive'))
        .catch((error) => {
            upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
            setTimeout(() => process.exit(1), 1000)
        });
    return {
        activate, 
        deactivate
    } 
}

export default BLEScanner