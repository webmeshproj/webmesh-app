#!powershell

# This script is used to build the Windows installer.

Set-PSDebug -Trace 1
$ErrorActionPreference = "Stop"

$version=$env:VERSION
if ($version -eq "") {
    $version = "0.0.1"
}

$targetArch=$env:TARGET_ARCH
if ($targetArch -eq "") {
    $targetArch = "x64"
}

$daemonRoot=$env:DAEMON_ROOT
if ($daemonRoot -eq "") {
    $daemonRoot = "webmesh\dist"
}
if ($targetArch -eq "x64") {
    $daemonPath = "$daemonRoot\webmeshd_windows_amd64_v1\webmeshd.exe"
} else {
    $daemonPath = "$daemonRoot\webmeshd_windows_arm64\webmeshd.exe"
}

New-Item -Path build -Type Directory

Write-Output "$version" | Out-File -Force -FilePath "build\version.txt"
Move-Item -Force "dist\electron\Packaged\Webmesh-$version-$targetArch.exe" "build\Webmesh.exe"
Move-Item -Force "$daemonPath" "build\webmeshd.exe"
Copy-Item -Force "src-electron/icons/icon.png" "build\Webmesh.ico"

Push-Location build
candle "..\contrib\windows\webmesh.wxs"
light -o "webmesh-$version.msi" "webmesh.wixobj"
Pop-Location
