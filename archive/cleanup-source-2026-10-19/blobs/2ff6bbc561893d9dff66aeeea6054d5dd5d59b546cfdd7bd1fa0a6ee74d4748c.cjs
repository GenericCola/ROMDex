function preserveApplicationData(creator){
 let xml=creator.wixTemplate;
 if(!xml.includes('<Component Id="PurgeOnUninstall"')||!xml.includes('<Directory Id="{{ProgramFilesFolder}}">'))throw Error('The Pinned Installer Template Changed; Review Data Preservation Before Building.');
 xml=xml.replace(/<DirectoryRef Id="APPLICATIONROOTDIRECTORY">\s*<Component Id="PurgeOnUninstall"[\s\S]*?<\/DirectoryRef>/,'').replace(/\s*<ComponentRef Id="PurgeOnUninstall"\s*\/>/,'');
 xml=xml.replace('<Directory Id="{{ProgramFilesFolder}}">','<Directory Id="LocalAppDataFolder">').replaceAll('{{ApplicationName}} (Machine - MSI)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (User - MSI)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (Machine)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (User)','{{ApplicationName}}');
 if(/RemoveFolderEx|Component(?:Ref)? Id="PurgeOnUninstall"/.test(xml))throw Error('Installer Would Purge User Data.');
 if(typeof creator.fileComponentTemplate!=='string'||!creator.fileComponentTemplate.includes('KeyPath="yes"'))throw Error('The Pinned File Component Template Changed.');
 // Per-user components need an HKCU key path. Files remain MSI-owned; saves
 // never enter the file/component table and therefore survive uninstall.
 creator.fileComponentTemplate=creator.fileComponentTemplate.replace('KeyPath="yes"','').replace('</Component>','<RegistryValue Root="HKCU" Key="Software\\ROMDex Project\\ROMDexDesktop\\InstallerComponents" Name="{{ComponentId}}" Type="integer" Value="1" KeyPath="yes" /></Component>');
 creator.wixTemplate=xml;
}
module.exports={preserveApplicationData};
