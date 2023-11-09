#!powershell

# This script is used to build the Windows installer.
# It is intended for use from CI, but can be used locally by setting
# the DAEMONROOT environment variable to a repository path where the
# webmeshd binary can be found.

$ErrorActionPreference = "Stop"

$VERSION=$env:VERSION
if (-not $version) {
    $VERSION=((git describe --tags --always --dirty) -Split '-')[0]
    $env:VERSION=$VERSION
}

$DAEMONROOT=$env:DAEMONROOT
if (-not $daemonRoot) {
    $DAEMONROOT = "webmesh"
}
$DAEMONX64PATH = "$DAEMONROOT\dist\webmeshd_windows_amd64_v1\webmeshd.exe"
$DAEMONARM64PATH = "$DAEMONROOT\dist\webmeshd_windows_arm64\webmeshd.exe"

$BUILDROOT="build"
$BUILDX64ROOT="$BUILDROOT\x64"
$BUILDARM64ROOT="$BUILDROOT\arm64"

$PACKAGEX64="webmesh-x64-$VERSION.msi"
$PACKAGEARM64="webmesh-arm64-$VERSION.msi"

function Protect-Asset {
    Param
    (
         [Parameter(Mandatory=$true, Position=0)]
         [string] $Name,
         [Parameter(Mandatory=$false, Position=1)]
         [boolean] $Seal
    )
    if ($env:SIGN -eq 'true' -and $env:WINDOWS_SIGNER_NAME) {
        Write-Host "+++        Signing $Name"
        if ($Seal) {
            signtool sign /seal /a /n "$env:WINDOWS_SIGNER_NAME" "$Name"
        } else {
            signtool sign /a /n "$env:WINDOWS_SIGNER_NAME" "$Name"
        }
    } else {
        Write-Host "+++        SIGN and/or SIGNER_NAME not set, skipping signature of $Name"
    }
}

Write-Host "+ Building Windows Installers for Version $VERSION"
Write-Host "++    x64 Build: $BUILDX64ROOT"
Write-Host "++    arm64 Build: $BUILDARM64ROOT"

[void](Remove-Item -Force -Recurse -ErrorAction Ignore "build")
[void](New-Item -Path "$BUILDROOT" -Type Directory)
[void](New-Item -Path "$BUILDX64ROOT" -Type Directory)
[void](New-Item -Path "$BUILDARM64ROOT" -Type Directory)

$WINTUNVERSION="0.14.1"
Write-Host "+ Downloading Wintun drivers - Version: $WINTUNVERSION..."
Invoke-WebRequest -Uri "https://www.wintun.net/builds/wintun-$WINTUNVERSION.zip" -OutFile "$BUILDROOT\wintun-$WINTUNVERSION.zip"
Expand-Archive "$BUILDROOT\wintun-$WINTUNVERSION.zip" -DestinationPath "$BUILDROOT"

Write-Host "++    Copying wintun drivers to package directories"
$WINTUNX64PATH="$BUILDROOT\wintun\bin\amd64\wintun.dll"
$WINTUNARM64PATH="$BUILDROOT\wintun\bin\arm64\wintun.dll"
Write-Host "++++           x64 Source: $WINTUNX64PATH"
Write-Host "++++           arm64 Source: $WINTUNARM64PATH"
Copy-Item "$WINTUNX64PATH" "$BUILDX64ROOT\wintun.dll"
Copy-Item "$WINTUNARM64PATH" "$BUILDARM64ROOT\wintun.dll"

Write-Host "++    Copying bundle assets to package directories"

Write-Host "+++        Copying LICENSE"
Protect-Asset -Name "LICENSE" -Seal $true
Copy-Item "LICENSE" "$BUILDX64ROOT\LICENSE.txt"
Copy-Item "LICENSE" "$BUILDARM64ROOT\LICENSE.txt"

Write-Host "+++        Copying Electron App"
Protect-Asset -Name "dist\electron\Packaged\Webmesh-$VERSION-x64.exe" -Seal $false
Protect-Asset -Name "dist\electron\Packaged\Webmesh-$VERSION-arm64.exe" -Seal $false
Copy-Item -Force "dist\electron\Packaged\Webmesh-$VERSION-x64.exe" "$BUILDX64ROOT\Webmesh.exe"
Copy-Item -Force "dist\electron\Packaged\Webmesh-$VERSION-arm64.exe" "$BUILDARM64ROOT\Webmesh.exe"

Write-Host "+++        Copying Icon files"
Copy-Item -Force "src-electron/icons/icon.png" "$BUILDX64ROOT\Webmesh.ico"
Copy-Item -Force "src-electron/icons/icon.png" "$BUILDARM64ROOT\Webmesh.ico"
Protect-Asset -Name "$BUILDX64ROOT\Webmesh.ico" -Seal $true
Protect-Asset -Name "$BUILDARM64ROOT\Webmesh.ico" -Seal $true

Write-Host "+++        Copying webmeshd"
Write-Host "++++           x64 Source: $DAEMONX64PATH"
Write-Host "++++           arm64 Source: $DAEMONARM64PATH"
Copy-Item -Force "$DAEMONX64PATH" "$BUILDX64ROOT\webmeshd.exe"
Copy-Item -Force "$DAEMONARM64PATH" "$BUILDARM64ROOT\webmeshd.exe"
Protect-Asset -Name "$BUILDX64ROOT\webmeshd.exe" -Seal $false
Protect-Asset -Name "$BUILDARM64ROOT\webmeshd.exe" -Seal $false

$WIXFILE="..\..\contrib\windows\webmesh.wxs"

Write-Host "++    Building x64 installer to $BUILDX64ROOT\$PACKAGEX64"
Push-Location "$BUILDX64ROOT"
wix build -o "$PACKAGEX64" "$WIXFILE"
Protect-Asset -Name "$PACKAGEX64"
Pop-Location

Write-Host "++    Building arm64 installer to $BUILDARM64ROOT\$PACKAGEARM64"
Push-Location "$BUILDARM64ROOT"
wix build -o "$PACKAGEARM64" "$WIXFILE"
Protect-Asset -Name "$PACKAGEARM64"
Pop-Location
