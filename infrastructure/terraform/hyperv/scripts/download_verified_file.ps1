param(
  [Parameter(Mandatory = $true)]
  [string]$DestinationPath,

  [Parameter(Mandatory = $true)]
  [string]$Url,

  [Parameter(Mandatory = $true)]
  [string]$Checksum
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (Test-Path -LiteralPath $DestinationPath) {
  Write-Host "File already exists: $DestinationPath"
  exit 0
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $DestinationPath) | Out-Null

Write-Host "Downloading: $Url"
Invoke-WebRequest -Uri $Url -OutFile $DestinationPath

$actualChecksum = (Get-FileHash -Path $DestinationPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualChecksum -ne $Checksum.ToLowerInvariant()) {
  Remove-Item -LiteralPath $DestinationPath -Force -ErrorAction SilentlyContinue
  throw "SHA-256 verification failed. Expected $Checksum, got $actualChecksum."
}

Write-Host "Checksum verified: $DestinationPath"
