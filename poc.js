/*
  Libraries used:
    https://github.com/futomi/node-beacon-scanner
    https://github.com/mqttjs/MQTT.js
*/

const BeaconScanner = require('node-beacon-scanner');
const mqtt = require('mqtt')

console.log('App started.')

const mqttOptions = {
  clientId: 'rpi3',
  username: 'anchor',
  password: 'BLEtracker',
  reconnect: true,
  reconnectPeriod: 1000,
  keepAlive: 60,
  clean: true
}

const mqttClient = mqtt.connect('mqtt://10.0.4.10:1883', mqttOptions)

const scanner = new BeaconScanner();

mqttClient.on('connect', () => {
  console.log('Mqtt connected.')
  // Start scanning

})

mqttClient.on("error", (error) => {
  console.log("Can't connect" + error);
  process.exit(1)
});

const calculateDistance = (ad) => {
  let txPower
  switch (ad.beaconType) {
    case 'iBeacon':
      txPower = ad.iBeacon.txPower
      break
    case 'eddystoneUid':
      txPower = ad.eddystoneUid.txPower
      break
    default:
      txPower = 1
  }
  return 10**((Number(txPower) - Number(ad.rssi)) / (10 * 3)).toFixed(2)
}

// Set an Event handler for beacons
scanner.onadvertisement = (ad) => {
  ad.scannerDevice = 'rpi3'
  ad.distance = calculateDistance(ad)
  const msg = JSON.stringify(ad, null, ' ')
  console.log(msg);
  mqttClient.publish('RPI/3', msg)
};