#Requires -Version 5.1
<#
.SYNOPSIS
  Enforce Windows-safe file and directory names (same rules as GitHub Actions).

.DESCRIPTION
  Runs scripts/validate_windows_filenames.py. Requires Python 3 on PATH (`py -3` or `python`).

.PARAMETER Root
  Root directory to scan. Default: Staging_Zettelkasten repo root.

.EXAMPLE
  .\validate-windows-filenames.ps1
  .\validate-windows-filenames.ps1 -Root 'D:\vault\Staging_Zettelkasten'
#>

param(
  [string]$Root = ''
)

$ErrorActionPreference = 'Stop'

if (-not $Root) {
  $Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
}

$Root = (Resolve-Path -LiteralPath $Root).Path
$pyScript = Join-Path $Root 'scripts\validate_windows_filenames.py'

if (-not (Test-Path -LiteralPath $pyScript)) {
  Write-Error "Missing script: $pyScript"
  exit 2
}

$invocations = @(
  @{ Exe = 'py'; Args = @('-3', $pyScript, '--root', $Root) },
  @{ Exe = 'python'; Args = @($pyScript, '--root', $Root) },
  @{ Exe = 'python3'; Args = @($pyScript, '--root', $Root) }
)

foreach ($inv in $invocations) {
  $bin = Get-Command $inv.Exe -ErrorAction SilentlyContinue
  if (-not $bin) { continue }
  & $bin.Source @inv.Args
  exit $LASTEXITCODE
}

Write-Error "Python 3 not found (tried py -3, python, python3). Install Python or add it to PATH."
exit 3
