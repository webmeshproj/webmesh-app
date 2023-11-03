# Webmesh App (webmesh-app)

An application for connecting to Webmesh networks

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Start a local daemon process

```bash
docker-compose -f daemon/docker-compose.yaml up  # -d to run in background
```

A gRPC UI will be available at http://localhost:8080.
The daemon listens for app requests on localhost:58080.

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
