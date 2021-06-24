# Electron Kiosk running on Mir-Kiosk Ubuntu Core

npx lerna init

claim cert
27aa913fda

- Fix design doc and diagrams
- Start readme doc
- constants or config file
- provisioning

  - save cert
  - show logging to screen
  - make provisioning template stricter. Limit to the device-id only.
  - delete previous registered certs. one cert per device.

- build windowsSockets into exe
- test windows build, use a bat file.
- linux snap build
- setup lerna

- add logging
- device shadwo
- apis
- tests

# Windows 10

## Build

- `electronKiosk` is built into `exe`
- `windoSockets` is transpiled and minified into `js`.
- Claim certs needs to copied into the right path
- include `install.ps1` This will install `node`, `pm2` and setup `pm2` as service.

All these files will be `zipped`

## First time installation

- Download the `zipped` filed
- Unpacked it
- Run the `install.ps1` as an Administrator
- Now the electron app should be running on start up

### TODOs

- installation script
  - terminal UI
    - show progress bar with logging.
  - install all the dependencies
    - `choco`
    - `node`
    - `pm2`
    - ssh daemon
    - `zerotier-one` for remote ssh access
    - [newrelic infrastructure agent](https://docs.newrelic.com/docs/infrastructure/install-infrastructure-agent/)
      - forward pm2 logs to newrelic
    - [AWS IoT secure tunneling](https://docs.aws.amazon.com/iot/latest/developerguide/secure-tunneling-tutorial.html)
      - [localproxy](https://github.com/aws-samples/aws-iot-securetunneling-localproxy)
  - if possible add a pam icon
  - install pm2 as a service
    - https://github.com/coreybutler/node-windows
    - https://blog.cloudboost.io/nodejs-pm2-startup-on-windows-db0906328d75
- build script that will produce the `zipped` file.

  - maybe use lerna + some script
  - build electron app
  - tsc windowsSockets (maybe add minified version)
  - copy the claim certificates
  - copy installation script
  - release notes

- uninstall script
  remove everything installed will

- consider how to do updates

  - uninstall and install the new zip

- dev and prod env for pm2
- pm2 cli doc and troubleshooting doc
  - like stop, start, view logs
