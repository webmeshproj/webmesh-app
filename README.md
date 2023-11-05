# Webmesh App (webmesh-app)

An application for connecting to Webmesh networks

## Install the dependencies

```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
yarn dev
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
```

### Format the files

```bash
yarn format
```

### Build the app for production

```bash
yarn build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
