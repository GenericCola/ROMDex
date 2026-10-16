import fs from 'node:fs/promises';
import {openAsBlob} from 'node:fs';
import path from 'node:path';
import {MAX_FILES,validateFile} from '../public/attachment-core.mjs';
export function validateTicket(id){if(typeof id!=='string'||!/^((PMON-\d+)|(local-[-\w]+))$/.test(id))throw Error('Choose a Valid Ticket.');return id;}
export function validateNativeSelection(selection,{dropped=false}={}){
 if(!Array.isArray(selection)||!selection.length||selection.length>MAX_FILES)throw Error('Choose 1–'+MAX_FILES+' Files at a Time.');
 for(const entry of selection){const file=typeof entry==='string'&&!dropped?entry:entry?.path;if(typeof file!=='string'||!path.isAbsolute(file)||file.includes('\0'))throw Error('Drop Files Directly from File Explorer or the Desktop.');if(dropped){validateFile(entry);if(path.basename(file)!==entry.name||!Number.isFinite(entry.lastModified))throw Error('A Dropped File Changed. Drop It Again.');}}
 return selection;
}
export async function chosenFiles(selection,{dropped=false}={}){
 validateNativeSelection(selection,{dropped});const chosen=[];
 for(const entry of selection){const file=typeof entry==='string'?entry:entry.path;let stat;
  try{stat=await fs.lstat(file);}catch{throw Error('A Selected File Is No Longer Available. Choose It Again.');}
  if(!stat.isFile()||stat.isSymbolicLink())throw Error('Choose Regular Files; Folders and Shortcuts to Files Are Not Supported.');
  const metadata={name:path.basename(file),size:stat.size};validateFile(metadata);
  if(dropped&&(entry.name!==metadata.name||entry.size!==metadata.size||Math.abs(entry.lastModified-stat.mtimeMs)>2))throw Error('A Dropped File Changed. Drop It Again.');
  const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.bmp':'image/bmp','.txt':'text/plain'}[path.extname(file).toLowerCase()]||'application/octet-stream';
  try{chosen.push(new File([await openAsBlob(file)],metadata.name,{type:mime}));}catch{throw Error('Cannot Read a Selected File. Choose It Again.');}
 }
 return chosen;
}
