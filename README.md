# Webmesh App

An application for connecting to Webmesh networks.
For more information on Webmesh, see the [webmesh repository](https://github.com/webmeshproj/webmesh) or [project website](https://webmeshproj.github.io/).

## Installation

Installation packages can be found in the [releases](https://github.com/webmeshproj/webmesh-app/releases) section.
The AppImages and macOS pkg installers are not currently signed and the Windows installers are self-signed.

This means on macOS you may need to right-click the app and select "Open" to bypass Gatekeeper or explicitly allow access via System Preferences > Security & Privacy > General.
On Windows you may need to click "More info" and then "Run anyway" to bypass SmartScreen.

Linux does not bundle the Webmesh daemon with the AppImage.
Instead, follow the [Webmesh installation instructions](https://webmeshproj.github.io/documentation/installation-instructions/#linux) for your distribution and enable the `webmeshd` service.

```bash
sudo systemctl enable --now webmeshd
```

## Demo

_Coming soon_

## Development

### Install the dependencies

```bash
yarn
```

#### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
yarn dev
```

#### Start a local daemon process

This is optional if you already have the application installed and/or a daemon process running.

```bash
docker-compose -f contrib/docker/docker-compose.yaml up  # -d to run in background
```

A gRPC UI will be available at http://localhost:8080.
The daemon listens for app requests on localhost:58080.

#### Lint the files

```bash
yarn lint
```

#### Format the files

```bash
yarn format
```

#### Build the app for production

```bash
yarn build
```
