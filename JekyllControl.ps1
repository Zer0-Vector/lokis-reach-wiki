param( [switch]$Terminate )

$proc = Get-WmiObject Win32_Process -Filter "name = 'ruby.exe'" | where {$_.CommandLine -like '*jekyll serve*'}
if ($proc -eq $null) {
  Write-Host "No 'jekyll serve' process running"
  exit
}

if ($Terminate) {
  $lc = $proc.CommandLine
  Write-Host "Terminating '$cl'..."
  $proc | Invoke-WmiMethod -Name Terminate
} else {
  $proc | Select-Object -Property ProcessId,CommandLine
}
