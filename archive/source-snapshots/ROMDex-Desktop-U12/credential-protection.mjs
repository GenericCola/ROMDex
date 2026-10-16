import {spawn} from 'node:child_process';
let desktopProtector=null;
export function setDesktopProtector(protector){if(desktopProtector)throw Error('A Credential Protector Is Already Registered.');desktopProtector=protector;}
export async function protectCredential(value,decrypt=false){
 if(desktopProtector)return desktopProtector(value,decrypt);
 if(process.platform!=='win32')throw Error('Remembering the Connection Is Supported on Windows Only.');
 const script=decrypt?"Add-Type -AssemblyName System.Security; $romdexBytes=[Convert]::FromBase64String([Console]::In.ReadToEnd()); [Console]::Out.Write([Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect($romdexBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))":"Add-Type -AssemblyName System.Security; $romdexBytes=[Text.Encoding]::UTF8.GetBytes([Console]::In.ReadToEnd()); [Console]::Out.Write([Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect($romdexBytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)))";
 return new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{windowsHide:true,stdio:['pipe','pipe','pipe']});let output='';child.stdout.on('data',chunk=>output+=chunk);child.stderr.resume();child.on('error',()=>reject(Error('Windows Could Not Protect the Connection.')));child.on('close',code=>code===0?resolve(output):reject(Error('Windows Could Not Protect or Restore the Connection.')));child.stdin.end(value);});
}
