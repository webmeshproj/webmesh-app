#!powershell

# This script is used to build the Windows installer.
# It is intended for use from CI, but can be used locally by setting
# the DAEMONROOT environment variable to a repository path where the
# webmeshd binary can be found.

# TODO: Download and bundle the wintun driver for the installer.

$ErrorActionPreference = "Stop"

$VERSION=$env:VERSION
if (-not $version) {
    $version = "0.0.1"
}

$DAEMONROOT=$env:DAEMONROOT
if (-not $daemonRoot) {
    $DAEMONROOT = "webmesh"
}

$DAEMONX64PATH = "$DAEMONROOT\dist\webmeshd_windows_amd64_v1\webmeshd.exe"
$DAEMONARM64PATH = "$DAEMONROOT\dist\webmeshd_windows_arm64\webmeshd.exe"

Write-Host "Building Windows installer for version $VERSION"
Remove-Item -Force -Recurse -ErrorAction Ignore "build"
New-Item -Path "build" -Type Directory
New-Item -Path "build\x64" -Type Directory
New-Item -Path "build\arm64" -Type Directory

Write-Host "Copying bundle assets to build directory"

Write-Host "    Copying LICENSE"
Copy-Item "LICENSE" "build\x64\LICENSE.txt"
Copy-Item "LICENSE" "build\arm64\LICENSE.txt"

Write-Host "    Copying Electron App"
Copy-Item -Force "dist\electron\Packaged\Webmesh-$VERSION-x64.exe" "build\x64\Webmesh.exe"
Copy-Item -Force "dist\electron\Packaged\Webmesh-$VERSION-arm64.exe" "build\arm64\Webmesh.exe"

Write-Host "    Copying webmeshd"
Write-Host "        x64: $DAEMONX64PATH"
Write-Host "        arm64: $DAEMONARM64PATH"
Copy-Item -Force "$DAEMONX64PATH" "build\x64\webmeshd.exe"
Copy-Item -Force "$DAEMONARM64PATH" "build\arm64\webmeshd.exe"

Write-Host "    Copying Icon files"
Copy-Item -Force "src-electron/icons/icon.png" "build\x64\Webmesh.ico"
Copy-Item -Force "src-electron/icons/icon.png" "build\arm64\Webmesh.ico"

Write-Host "Setting ProductVersion in Wix file"
sed "s/ProductVersion = \`".*\`"/ProductVersion = \`"$VERSION\`"/" "contrib/windows/webmesh.wxs" `
    | Set-Content "contrib\windows\webmesh.wxs"

Push-Location "build\x64"
Write-Host "Building x64 installer"
candle "..\..\contrib\windows\webmesh.wxs"
light -o "webmesh-x64-$VERSION.msi" "webmesh.wixobj"
Pop-Location

Push-Location "build\arm64"
Write-Host "Building arm64 installer"
candle "..\..\contrib\windows\webmesh.wxs"
light -sval -o "webmesh-arm64-$VERSION.msi" "webmesh.wixobj"
Pop-Location
