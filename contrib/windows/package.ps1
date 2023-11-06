#!powershell

# This script is used to build the Windows installer.

Set-PSDebug -Trace 1
$ErrorActionPreference = "Stop"

$version=$env:VERSION
if ($version -eq "") {
    $version = "0.0.1"
}

$daemonRoot=$env:DAEMONROOT
if ($daemonRoot -eq "") {
    $daemonRoot = "webmesh"
}

$daemonX64Path = "$daemonRoot\dist\webmeshd_windows_amd64_v1\webmeshd.exe"
$daemonARM64Path = "$daemonRoot\dist\webmeshd_windows_arm64\webmeshd.exe"

New-Item -Path "build" -Type Directory
New-Item -Path "build\x64" -Type Directory
New-Item -Path "build\arm64" -Type Directory

Write-Output "$version" | Out-File -Force -FilePath "build\x64\version.txt"
Write-Output "$version" | Out-File -Force -FilePath "build\arm64\version.txt"

Move-Item -Force "dist\electron\Packaged\Webmesh-$version-x64.exe" "build\x64\Webmesh.exe"
Move-Item -Force "dist\electron\Packaged\Webmesh-$version-arm64.exe" "build\arm64\Webmesh.exe"

Move-Item -Force "$daemonX64Path" "build\x64\webmeshd.exe"
Move-Item -Force "$daemonARM64Path" "build\arm64\webmeshd.exe"

Copy-Item -Force "src-electron/icons/icon.png" "build\x64\Webmesh.ico"
Copy-Item -Force "src-electron/icons/icon.png" "build\arm64\Webmesh.ico"

Push-Location build\x64
candle "..\contrib\windows\webmesh.wxs"
light -o "webmesh-x64-$version.msi" "webmesh.wixobj"
Pop-Location

Push-Location build\arm64
candle "..\contrib\windows\webmesh.wxs"
light -o "webmesh-arm64-$version.msi" "webmesh.wixobj"
Pop-Location
