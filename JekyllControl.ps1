[CmdletBinding(DefaultParameterSetName="Status")]
param(
  [Parameter(ParameterSetName="Stop")]
  [switch]$Terminate,
  [PSDefaultValue()]
  [Parameter(ParameterSetName="Status")]
  [switch]$Status = ($true -and -not $Terminate)
)

$wmiProc = Get-WmiObject Win32_Process -Filter "name = 'ruby.exe'" | where {$_.CommandLine -like '*jekyll serve*'}

$proc = $null
if ($wmiProc -eq $null) {
  Write-Host "No 'jekyll serve' process running"
  if ($Status) {
    exit 1
  } else {
    exit
  }
} else {
  $proc = Get-Process -PID ($wmiProc).ProcessId
}

if ($Terminate) {
  $cl = $wmiProc.CommandLine
  Write-Host "Terminating '$cl'..."
  $wmiProc | Invoke-WmiMethod -Name Terminate | Out-Null
  ($proc).WaitForExit()
  Write-Host "done."
} else {
  $proc | Add-Member -MemberType AliasProperty -Name PID -Value Id -PassThru | Format-List ProcessName, PID, @{Label="Uptime"; Expression={(Get-Date) - ($_).StartTime}}
}
