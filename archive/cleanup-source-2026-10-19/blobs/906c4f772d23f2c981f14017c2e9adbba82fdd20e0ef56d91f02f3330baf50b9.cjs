const path=require('node:path'),fs=require('node:fs');
const IDENTITY=Object.freeze({name:'ROMDex',shortName:'ROMDexRD08Fixture',appUserModelId:'ROMDexRD08Fixture',upgradeCode:'AC0036C2-C94C-4E02-9419-B84BECC0D1AE',manufacturer:'ROMDex Project'});
function applicationFolder(executable,version,{read=file=>JSON.parse(fs.readFileSync(file,'utf8'))}={}){
 const directory=path.dirname(path.resolve(executable));
 if(path.basename(directory)!=='app-'+version)return directory;
 const parent=path.dirname(directory);let info;try{info=read(path.join(parent,'.installInfo.json'));}catch{throw Error('The ROMDex Installation Marker Is Missing or Invalid. No Save Folder Was Selected.');}
 if(info.appName!==IDENTITY.shortName||info.installVersion!==version||info.arch!=='x64')throw Error('The ROMDex Installation Marker Does Not Match This Build.');return parent;
}
function profilePaths(root,project='thegobindsingh-PMON'){return {base:path.join(root,'Data',project),session:path.join(root,'Data','Runtime',project)};}
module.exports={IDENTITY,applicationFolder,profilePaths};
