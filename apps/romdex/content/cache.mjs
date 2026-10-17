import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
import {sha,requireThat,parseJSON} from './contracts.mjs';

// This phase deliberately has no path to the live profile or active-provider switch.
export class ContentCache{
 constructor({directory,workspace,isolation=false,maxBytes=256*1024*1024,fault=()=>{}}){
  requireThat(isolation===true&&typeof workspace==='string'&&workspace.startsWith('fixture:'),'U20C Requires an Explicitly Isolated Fixture Workspace.');
  directory=path.resolve(directory);requireThat(!/[\\/]ROMDexDesktop[\\/]Data(?:[\\/]|$)/i.test(directory),'The Production Data Folder Is Not a Preview Cache.');
  let ancestor=directory;while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);requireThat(!/[\\/]ROMDexDesktop[\\/]Data(?:[\\/]|$)/i.test(fs.realpathSync(ancestor)),'A Preview Path Cannot Resolve Into Production Data.');
  fs.mkdirSync(directory,{recursive:true});requireThat(!fs.lstatSync(directory).isSymbolicLink(),'Preview Cache Links Are Not Allowed.');
  const marker=path.join(directory,'content-isolation.json'),identity={format:'ROMDexContentPreview/1',workspace};
  if(fs.existsSync(marker))requireThat(JSON.stringify(parseJSON(fs.readFileSync(marker)))===JSON.stringify(identity),'Preview Cache Belongs to Another Workspace.');
  else fs.writeFileSync(marker,JSON.stringify(identity),{flag:'wx'});
  Object.assign(this,{directory,workspace,maxBytes,fault});this.db=new DatabaseSync(path.join(directory,'content.sqlite'));
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=2000; CREATE TABLE IF NOT EXISTS objects(hash TEXT PRIMARY KEY,bytes BLOB NOT NULL); CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,bytes BLOB NOT NULL,hash TEXT NOT NULL);');
  requireThat(this.db.prepare('PRAGMA quick_check').get().quick_check==='ok','The Content Cache Needs Recovery.');
 }
 transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.fault('before-commit');this.db.exec('COMMIT');return result;}catch(error){this.db.exec('ROLLBACK');throw error;}}
 object(hash){const row=this.db.prepare('SELECT bytes FROM objects WHERE hash=?').get(hash);if(!row)return null;const bytes=Buffer.from(row.bytes);requireThat(sha(bytes)===hash,'Cached Content Object Failed Verification.');return bytes;}
 putObject(bytes){const hash=sha(bytes),existing=this.object(hash);if(existing){requireThat(existing.equals(bytes),'Cached Object Collision.');return hash;}const size=Number(this.db.prepare('SELECT (SELECT coalesce(sum(length(bytes)),0) FROM objects)+(SELECT coalesce(sum(length(bytes)),0) FROM state) AS size').get().size);requireThat(size+bytes.length<=this.maxBytes,'The Content Cache Reached Its Storage Bound.');this.db.prepare('INSERT INTO objects(hash,bytes) VALUES(?,?)').run(hash,bytes);return hash;}
 get(key){const row=this.db.prepare('SELECT bytes,hash FROM state WHERE key=?').get(key);if(!row)return null;const bytes=Buffer.from(row.bytes);requireThat(sha(bytes)===row.hash,'Cached Content State Failed Verification.');return parseJSON(bytes);}
 set(key,value){const bytes=Buffer.from(JSON.stringify(value));parseJSON(bytes);const size=Number(this.db.prepare('SELECT (SELECT coalesce(sum(length(bytes)),0) FROM objects)+(SELECT coalesce(sum(length(bytes)),0) FROM state WHERE key<>?) AS size').get(key).size);requireThat(size+bytes.length<=this.maxBytes,'The Content Cache Reached Its Storage Bound.');this.db.prepare('INSERT INTO state(key,bytes,hash) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET bytes=excluded.bytes,hash=excluded.hash').run(key,bytes,sha(bytes));}
 checkpoint(){this.db.exec('PRAGMA wal_checkpoint(FULL)');}
 close(){this.checkpoint();this.db.close();}
}
