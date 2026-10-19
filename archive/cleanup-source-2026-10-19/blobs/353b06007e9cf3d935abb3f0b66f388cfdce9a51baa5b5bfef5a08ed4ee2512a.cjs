const fs=require('node:fs/promises'),{createHash}=require('node:crypto');
function addEmptyFolderCleanup(xml){
 const folders=[...xml.matchAll(/<Directory Id="([^"]+)" Name="([^"]+)">/g)].filter(([,id])=>!['TARGETDIR','DesktopFolder','ApplicationProgramsFolder'].includes(id));
 if(!folders.some(([,id])=>id==='APPLICATIONROOTDIRECTORY')||!xml.includes('<RemoveFolder Id="ApplicationProgramsFolder"'))throw Error('The Generated Installer Directory Layout Changed.');
 if(folders.some(([,id,name])=>['Data','Runtime'].includes(name)))throw Error('Private Data Must Never Be Included in the Installer Directory Table.');
 const cleanup=folders.map(([,id])=>'<RemoveFolder Id="Empty_'+createHash('sha256').update(id).digest('hex').slice(0,24)+'" Directory="'+id+'" On="uninstall" />').join('\n');
 return xml.replace('<RemoveFolder Id="ApplicationProgramsFolder"',cleanup+'\n<RemoveFolder Id="ApplicationProgramsFolder"');
}
function preserveApplicationData(creator){
 let xml=creator.wixTemplate;
 if(!xml.includes('<Component Id="PurgeOnUninstall"')||!xml.includes('<Directory Id="{{ProgramFilesFolder}}">'))throw Error('The Pinned Installer Template Changed; Review Data Preservation Before Building.');
 xml=xml.replace(/<DirectoryRef Id="APPLICATIONROOTDIRECTORY">\s*<Component Id="PurgeOnUninstall"[\s\S]*?<\/DirectoryRef>/,'').replace(/\s*<ComponentRef Id="PurgeOnUninstall"\s*\/>/,'');
 xml=xml.replace('<Directory Id="{{ProgramFilesFolder}}">','<Directory Id="LocalAppDataFolder">').replaceAll('{{ApplicationName}} (Machine - MSI)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (User - MSI)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (Machine)','{{ApplicationName}}').replaceAll('{{ApplicationName}} (User)','{{ApplicationName}}');
 xml=xml.replace('AllowSameVersionUpgrades="yes"','AllowSameVersionUpgrades="no"').replace(/<Property Id="REINSTALLMODE"[^>]*\/>/,'');
 if(/RemoveFolderEx|Component(?:Ref)? Id="PurgeOnUninstall"/.test(xml))throw Error('Installer Would Purge User Data.');
 if(typeof creator.fileComponentTemplate!=='string'||!creator.fileComponentTemplate.includes('KeyPath="yes"'))throw Error('The Pinned File Component Template Changed.');
 // Per-user components need an HKCU key path. Files remain MSI-owned; saves
 // never enter the file/component table and therefore survive uninstall.
 creator.fileComponentTemplate=creator.fileComponentTemplate.replace('KeyPath="yes"','').replace('</Component>','<RegistryValue Root="HKCU" Key="Software\\ROMDex Project\\ROMDexDesktop\\InstallerComponents" Name="{{ComponentId}}" Type="integer" Value="1" KeyPath="yes" /></Component>');
 creator.wixTemplate=xml;
 if(typeof creator.create!=='function')throw Error('The Pinned Installer Create Hook Changed.');
 const create=creator.create.bind(creator);creator.create=async()=>{const output=await create();output.wxsContent=addEmptyFolderCleanup(output.wxsContent);await fs.writeFile(output.wxsFile,output.wxsContent);return output;};
}
module.exports={preserveApplicationData,addEmptyFolderCleanup};
