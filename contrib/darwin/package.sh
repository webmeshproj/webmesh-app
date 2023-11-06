#!/usr/bin/env bash

# This script is used to build the macOS installer.

rm -rf build
mkdir -p build

DAEMONROOT=${DAEMONROOT:-webmesh}
cp "$DAEMONROOT/dist/webmeshd_darwin_amd64_v1/webmeshd" dist/electron/Packaged/mac/Webmesh.app/Contents/MacOS/webmeshd
cp "$DAEMONROOT/dist/webmeshd_darwin_arm64/webmeshd" dist/electron/Packaged/mac-arm64/Webmesh.app/Contents/MacOS/webmeshd

pkgbuild \
		--root contrib/darwin/daemon \
		--install-location "/Library/LaunchDaemons" \
		--identifier com.webmeshproj.webmeshd \
		--ownership recommended \
		--scripts contrib/darwin/scripts \
		build/daemon-scripts.pkg

pkgbuild \
		--root dist/electron/Packaged/mac \
		--install-location "/Applications" \
		--component-plist contrib/darwin/components.plist \
		--identifier com.webmeshproj.app \
		build/app-x64.pkg

pkgbuild \
		--root dist/electron/Packaged/mac-arm64 \
		--install-location "/Applications" \
		--component-plist contrib/darwin/components.plist \
		--identifier com.webmeshproj.app \
		build/app-arm64.pkg

productbuild \
    --package build/daemon-scripts.pkg \
    --package build/app-x64.pkg \
    build/Webmesh-x64-Unsigned.pkg

productbuild \
    --package build/daemon-scripts.pkg \
    --package build/app-arm64.pkg \
    build/Webmesh-arm64-Unsigned.pkg
