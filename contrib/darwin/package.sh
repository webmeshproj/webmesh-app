#!/usr/bin/env bash

# This script is used to build the macOS installer.
# It is intended for use from CI, but can be used locally by setting
# the DAEMONROOT environment variable to a repository path where the
# webmeshd binary can be found.

set -e -o pipefail

rm -rf build
mkdir -p build

APPID="com.webmeshproj.app"
VERSION=${VERSION:-0.0.2}
DAEMONROOT=${DAEMONROOT:-webmesh}
SIGN=${SIGN:-"false"}
SIGNER="${MAC_APP_SIGNER_NAME}"
INSTALL_SIGNER="${MAC_INSTALL_SIGNER_NAME}"
NOTARIZATION_TEAMID="${MAC_NOTARIZATION_TEAMID}"
NOTARIZATION_USERNAME="${MAC_NOTARIZATION_USERNAME}"
NOTARIZATION_PASSWORD="${MAC_NOTARIZATION_PASSWORD}"

echo "+ Building macOS installer for version $VERSION"

echo "++ Copying webmeshd to App directories"
cp "$DAEMONROOT/dist/webmeshd_darwin_amd64_v1/webmeshd" dist/electron/Packaged/mac/Webmesh.app/Contents/MacOS/webmeshd
cp "$DAEMONROOT/dist/webmeshd_darwin_arm64/webmeshd" dist/electron/Packaged/mac-arm64/Webmesh.app/Contents/MacOS/webmeshd

SIGN_ARGS=""
if [[ "${SIGN}" == "true" && "${SIGNER}" != "" ]] ; then
    echo "+++ Signing binaries"
    SIGN_ARGS="--sign ${SIGNER}"
    codesign --force --deep --options runtime \
        --sign "${SIGNER}" \
        -i "${APP_ID}" \
        dist/electron/Packaged/mac/Webmesh.app/Contents/MacOS/Webmesh
    codesign --force --deep --options runtime \
        --sign "${SIGNER}" \
        -i "${APP_ID}" \
        dist/electron/Packaged/mac-arm64/Webmesh.app/Contents/MacOS/Webmesh
    codesign --force --deep --options runtime \
        --sign "${SIGNER}" \
        -i "${APP_ID}" \
        dist/electron/Packaged/mac/Webmesh.app/Contents/MacOS/webmeshd
    codesign --force --deep --options runtime \
        --sign "${SIGNER}" \
        -i "${APP_ID}" \
        dist/electron/Packaged/mac-arm64/Webmesh.app/Contents/MacOS/webmeshd
fi

echo "++ Building packages"

pkgbuild ${SIGN_ARGS} \
		--root contrib/darwin/daemon \
		--install-location "/Library/LaunchDaemons" \
		--identifier com.webmeshproj.webmeshd \
		--ownership recommended \
		--scripts contrib/darwin/scripts \
		build/daemon-scripts.pkg

pkgbuild ${SIGN_ARGS} \
		--root dist/electron/Packaged/mac \
		--install-location "/Applications" \
		--component-plist contrib/darwin/components.plist \
		--identifier com.webmeshproj.app \
		build/app-x64.pkg

pkgbuild ${SIGN_ARGS} \
		--root dist/electron/Packaged/mac-arm64 \
		--install-location "/Applications" \
		--component-plist contrib/darwin/components.plist \
		--identifier com.webmeshproj.app \
		build/app-arm64.pkg

productbuild \
    --package build/daemon-scripts.pkg \
    --package build/app-x64.pkg \
    build/Webmesh-x64-$VERSION-Unsigned.pkg

productbuild \
    --package build/daemon-scripts.pkg \
    --package build/app-arm64.pkg \
    build/Webmesh-arm64-$VERSION-Unsigned.pkg

if [[ "${SIGN}" == "true" && "${INSTALL_SIGNER}" != "" ]] ; then
    echo "+++ Signing installer packages"
    productsign --sign "${INSTALL_SIGNER}" \
        build/Webmesh-x64-$VERSION-Unsigned.pkg build/Webmesh-x64-$VERSION.pkg
    productsign --sign "${INSTALL_SIGNER}" \
        build/Webmesh-arm64-$VERSION-Unsigned.pkg build/Webmesh-arm64-$VERSION.pkg

    echo "+++ Notarizing installer packages"
    echo "++++ Uploading x64 package"
    UUID=$(xcrun altool -t osx -f build/Webmesh-x64-$VERSION.pkg \
      --primary-bundle-id com.webmeshproj.app \
      --team-id "${NOTARIZATION_TEAMID}" \
      --notarize-app \
      --username "${NOTARIZATION_USERNAME}" \
      -p "${NOTARIZATION_PASSWORD}" \
        | grep RequestUUID \
        | awk '{print $NF}')
    while true; do
        sleep 5
        echo "++++ Checking notary status...."
        xcrun altool --notarization-info "${UUID}" -p "${NOTARIZATION_PASSWORD}" --username "${NOTARIZATION_USERNAME}" | grep -s Approved && break
    done
    echo "++++ Stapling x64 package"
    xcrun stapler staple -v build/Webmesh-x64-$VERSION.pkg
    echo "++++ Uploading arm64 package"
    UUID=$(xcrun altool -t osx -f build/Webmesh-arm64-$VERSION.pkg \
      --primary-bundle-id com.webmeshproj.app \
      --team-id "${NOTARIZATION_TEAMID}" \
      --notarize-app \
      --username "${NOTARIZATION_USERNAME}" \
      -p "${NOTARIZATION_PASSWORD}" \
        | grep RequestUUID \
        | awk '{print $NF}')
    while true; do
        sleep 5
        echo "++++ Checking notary status...."
        xcrun altool --notarization-info "${UUID}" -p "${NOTARIZATION_PASSWORD}" --username "${NOTARIZATION_USERNAME}" | grep -s Approved && break
    done
    echo "++++ Stapling arm64 package"
    xcrun stapler staple -v build/Webmesh-arm64-$VERSION.pkg
fi
