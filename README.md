# Raspberry Pi iBeacon Scanner
Node app for detecting BLE iBeacon presense.

## Requirements

* Raspberry Pi
* Micro SD card 

## Setup 
Download and install the Raspberry Pi Imager from https://www.raspberrypi.com/software/

Flash the SD card:
* Choose Raspberry Pi OS Lite 64-bit image
* Select advanced and set the desired configuration

Open a terminal and connect to the pi 
```
ssh <user>@<hostname>
```

Update the Pi
```
sudo apt update
sudo apt upgrade
```

### git
```
sudo apt install git
```
### node & npm
```
sudo apt install nodejs
```
### Clone the repository
```
git clone https://github.com/IT-BPR-S22-Curated-Shopping/device.beacon_scanner.git
```
### Install dependencies 
``` 
cd device.beacon_scanner/

npm install
```

### Add Mqtt credentials
Create a file
```
nano local.credentials.json
```
with content
```
{
    "mqtt": {
        "username": <"username">,
        "password": <"password">
    }
}
```

### install pm2 for auto start on boot
```
sudo npm install pm2

sudo pm2 start App.js

sudo pm2 startup systemd

sudo pm2 save
```

now reboot and enjoy

```
sudo reboot
```




