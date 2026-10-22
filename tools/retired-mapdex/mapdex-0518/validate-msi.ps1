param([Parameter(Mandatory=$true)][string]$MsiPath)
$ErrorActionPreference='Stop'
$installer=New-Object -ComObject WindowsInstaller.Installer
$database=$installer.GetType().InvokeMember('OpenDatabase',[Reflection.BindingFlags]::InvokeMethod,$null,$installer,@($MsiPath,0))
$view=$database.GetType().InvokeMember('OpenView',[Reflection.BindingFlags]::InvokeMethod,$null,$database,@('SELECT `Property`, `Value` FROM `Property`'))
$view.GetType().InvokeMember('Execute',[Reflection.BindingFlags]::InvokeMethod,$null,$view,$null) | Out-Null
$values=@{}
while($true){
 $row=$view.GetType().InvokeMember('Fetch',[Reflection.BindingFlags]::InvokeMethod,$null,$view,$null)
 if($null -eq $row){break}
 $name=$row.GetType().InvokeMember('StringData',[Reflection.BindingFlags]::GetProperty,$null,$row,@(1))
 $value=$row.GetType().InvokeMember('StringData',[Reflection.BindingFlags]::GetProperty,$null,$row,@(2))
 $values[[string]$name]=[string]$value
}
if($values['ProductVersion'] -notin @('0.5.18','0.5.18.0')){throw ('Unexpected installer version: '+$values['ProductVersion'])}
if($values['UpgradeCode'] -ne '{C3861991-512B-4F7D-B1C1-9D8EC7230FDA}'){throw 'Installer upgrade identity changed.'}
@{status='passed';version='0.5.18';windowsInstallerVersion=$values['ProductVersion'];upgradeCode=$values['UpgradeCode'];productName=$values['ProductName'];productCode=$values['ProductCode']} | ConvertTo-Json -Compress
