import BeaconScanner from "node-beacon-scanner"
import { MessageLevel } from "../utils/MessageLevel.js"

function BLEScanner(upLinkHandler) {
    const state = { scanner: new BeaconScanner() }
    const activate = () => state.scanner.startScan()
    .then(() => upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning active'))
    .catch((error) => {
        upLinkHandler.sendTelemetry(MessageLevel.error, `Beacon scanner: ${error}`)
        setTimeout(() => process.exit(1), 1000)
    });
    const deactivate = () => {
        state.scanner.stopScan()
        upLinkHandler.sendTelemetry(MessageLevel.info, 'Scanning inactive')
    }
    return {
        activate, 
        deactivate
    } 
}

export default BLEScanner