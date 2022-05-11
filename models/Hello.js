export const hello = (companyId, deviceId) => ({ 
    company: companyId, 
    device: { 
        id: deviceId,
        type: "BLE"
    }
})