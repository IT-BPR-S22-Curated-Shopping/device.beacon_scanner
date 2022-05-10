import BeaconScanner from "node-beacon-scanner"
import { MessageLevel } from "../utils/MessageLevel.js"

function BLEScanner(upLinkHandler) {
    const state = { handle: new BeaconScanner() }
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
    const handle = () => state.handle
    return {
        handle,
        activate, 
        deactivate
    } 
}

export default BLEScanner