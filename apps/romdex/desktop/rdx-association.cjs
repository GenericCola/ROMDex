// Per-user, application-owned registration. Do not write .rdx's default value
// or Windows UserChoice: users choose their default handler through Windows.
const xml=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function addRdxAssociation(source,{progId='ROMDexDesktop.RDX',application='ROMDex',iconFileId}={}){
 if(!/^[A-Za-z][\w.]+$/.test(progId)||!iconFileId||!source.includes('<Feature Id="MainApplication"'))throw Error('Invalid RDX Association Build Inputs.');
 const root='Software\\Classes\\',key=root+progId,cap='Software\\'+progId+'\\Capabilities';
 const value=(key,name,text,keyPath=false)=>'<RegistryValue Root="HKCU" Key="'+xml(key)+'"'+(name?' Name="'+xml(name)+'"':'')+' Type="string" Value="'+xml(text)+'"'+(keyPath?' KeyPath="yes"':'')+' />';
 const rows=[value(key,null,application+' Document',true),value(key,'FriendlyTypeName',application+' Document'),value(key+'\\DefaultIcon',null,'[#'+iconFileId+'],0'),value(key+'\\shell\\open',null,'Open in '+application),value(key+'\\shell\\open\\command',null,'"[APPLICATIONROOTDIRECTORY]ROMDex.exe" "%1"'),value(root+'.rdx\\OpenWithProgids',progId,''),value(cap,'ApplicationName',application),value(cap,'ApplicationDescription','Review Portable ROMDex Plans and NPCDex Maps'),value(cap+'\\FileAssociations','.rdx',progId),value('Software\\RegisteredApplications',progId,cap)];
 const component='<DirectoryRef Id="APPLICATIONROOTDIRECTORY"><Component Id="RdxFileAssociation" Guid="*" Win64="yes">'+rows.join('\n')+'</Component></DirectoryRef>';
 return source.replace('<Feature Id="Complete"',component+'\n<Feature Id="Complete"').replace('<ComponentRef Id="ApplicationShortcut" />','<ComponentRef Id="ApplicationShortcut" /><ComponentRef Id="RdxFileAssociation" />');
}
function registerRdxAssociation(creator,options={}){
 const create=creator.create.bind(creator);creator.create=async()=>{const output=await create(),files=[...output.wxsContent.matchAll(/<File\b[^>]*\bId="([^"]+)"[^>]*\bSource="([^"]+)"[^>]*>/g)],icon=files.find(([,id,source])=>/[\\/]desktop[\\/]rdx\.ico$/i.test(source));
  if(!icon)throw Error('The Exact Pokéball RDX Icon Is Missing From the Installer.');
  output.wxsContent=addRdxAssociation(output.wxsContent,{...options,iconFileId:icon[1]});await require('node:fs/promises').writeFile(output.wxsFile,output.wxsContent);return output;};
}
module.exports={addRdxAssociation,registerRdxAssociation};
