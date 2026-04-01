#Requires -Version 5.1
<#
.SYNOPSIS
  Pull Staging_Zettelkasten from origin, then mirror the working tree into OneDrive (backup only).

.NOTES
  - Repo copy:     Staging_Zettelkasten/operator/Windows/staging-zettel-backup.ps1
  - Canonical clone: C:\The ARX Foundation\Staging_Zettelkasten (work here).
  - Backup copy:     %OneDrive%\The ARX Foundation\Staging_Zettelkasten (do not edit; mirror).
  - Logs:            %LOCALAPPDATA%\TheARXFoundation\logs\ (not next to script, so clones stay clean).
  - Excludes .git from the mirror to avoid duplicate repo metadata and sync noise.
#>

$ErrorActionPreference = 'Stop'
# Robocopy uses exit 1–7 for success; PowerShell would otherwise exit with that code and Task Scheduler reports a bogus failure (e.g. 0xC000013A-style codes in some hosts).
$global:LASTEXITCODE = 0

$Source = 'C:\The ARX Foundation\Staging_Zettelkasten'
$OneDriveRoot = if ($env:OneDrive) { $env:OneDrive } else { Join-Path $env:USERPROFILE 'OneDrive' }
$Dest = Join-Path $OneDriveRoot 'The ARX Foundation\Staging_Zettelkasten'
$LogDir = Join-Path $env:LOCALAPPDATA 'TheARXFoundation\logs'
$null = New-Item -ItemType Directory -Force -Path $LogDir
$LogFile = Join-Path $LogDir ("backup-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

function Write-Log {
  param($Message)
  $text = if ($null -eq $Message) { '' } else { [string]$Message }
  $line = '[{0:u}] {1}' -f (Get-Date), $text
  Add-Content -LiteralPath $LogFile -Encoding utf8 -Value $line
  Write-Host $line
}

try {
if (-not (Test-Path -LiteralPath $Source)) {
  throw "Source missing: $Source"
}

$validator = Join-Path $Source 'operator\Windows\validate-windows-filenames.ps1'
if (Test-Path -LiteralPath $validator) {
  Write-Log "Validating Windows-safe filenames under $Source"
  $prevEapVal = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $validator -Root $Source 2>&1 | ForEach-Object { Write-Log ($_.ToString()) }
  } finally {
    $ErrorActionPreference = $prevEapVal
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Filename validation failed (exit $LASTEXITCODE). Fix names or run: operator\Windows\validate-windows-filenames.ps1"
  }
}

Write-Log "Starting backup (pull + mirror)."
Write-Log "OneDrive root: $OneDriveRoot"

Push-Location -LiteralPath $Source
try {
  if (-not (Test-Path -LiteralPath '.git')) {
    throw "Not a git repo: $Source"
  }
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  Write-Log "Branch: $branch"
  Write-Log "git pull --ff-only origin $branch"
  # Git writes progress to stderr; with $ErrorActionPreference = 'Stop' that would terminate unless ignored here.
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    git pull --ff-only origin $branch 2>&1 | ForEach-Object { Write-Log ($_.ToString()) }
  } finally {
    $ErrorActionPreference = $prevEap
  }
  if ($LASTEXITCODE -ne 0) {
    throw "git pull failed (exit $LASTEXITCODE)."
  }
} finally {
  Pop-Location
}

$null = New-Item -ItemType Directory -Force -Path $Dest
Write-Log "Robocopy mirror -> $Dest"

# /MIR = mirror (delete extras in dest); /XD .git = no second repo copy in OneDrive
# /FFT = tolerate 2s timestamp fuzz; /Z = restartable; /XJ = exclude junctions; /R:2 /W:5 = retries
$robocopyArgs = @(
  $Source, $Dest, '/MIR'
  '/XD', '.git'
  '/FFT', '/Z', '/XJ', '/R:2', '/W:5', '/MT:4'
  '/NFL', '/NDL', '/NP'
)
& robocopy.exe @robocopyArgs
$rc = $LASTEXITCODE
Write-Log "Robocopy exit code: $rc (0-7 = success)"
if ($rc -ge 8) {
  Write-Log "ERROR: Robocopy failed (exit $rc)."
  exit 1
}

Write-Log "Done."
$global:LASTEXITCODE = 0
exit 0
} catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  exit 1
}
