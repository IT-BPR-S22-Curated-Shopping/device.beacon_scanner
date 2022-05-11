export const hello = (time, companyId, deviceId) => ({ 
    timestamp: time, 
    company: companyId, 
    device: { 
        id: deviceId,
        type: "BLE"
    }
})