import { networkInterfaces } from 'node:os'

export const macAddress = () => networkInterfaces().wlan0[0].mac