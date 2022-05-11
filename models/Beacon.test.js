import Beacon from "./Beacon";
import ConfigurationManager from "../configuration/ConfigurationManager";

let b;
let c;
const uuid = '010D2108-0462-4F97-BAB8-000000000004';
const rssi = 80;

beforeEach(() => {
    c = ConfigurationManager();
    b = Beacon(uuid, "mac", 78, 40, rssi, 2, c.getScannerConfig().noiseFilter);
});


test('Beacon add observation', () => {
    // One observation added on initialisation.
    expect(b.getNoOfObservations()).toBe(1);

    for (let i = 2; i < c.getScannerConfig().noiseFilter.observations.max; i ++) 
    {
        b.addObservation(50, 65);
        expect(b.getNoOfObservations()).toBe(i);
    }
   
    // cannot contain more than max observations. Array is shifted.
    b.addObservation(50, 65);
    expect(b.getNoOfObservations()).toBe(c.getScannerConfig().noiseFilter.observations.max);
});

test('Beacon uuid', () => {
    expect(b.getUuid()).toBe(uuid);
});

test('Beacon not uuid', () => {
    expect(b.getUuid()).not.toBe('010D2108-0462-4F97-BAB8-000000000003');
});

test('Beacon rssi', () => {
    expect(b.getRssi()).toBe(rssi);
});