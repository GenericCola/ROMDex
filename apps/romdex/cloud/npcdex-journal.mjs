import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';import path from 'node:path';
import {sha256} from './github-store.mjs';
export class NPCDexJournal{
 constructor(directory,{fault=()=>{}}={}){
  fs.mkdirSync(directory,{recursive:true});this.fault=fault;this.db=new DatabaseSync(path.join(directory,'npcdex.sqlite'));
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=2000; CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS documents(key TEXT PRIMARY KEY,bytes BLOB NOT NULL); CREATE TABLE IF NOT EXISTS blobs(hash TEXT PRIMARY KEY,bytes BLOB NOT NULL); CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,bytes BLOB NOT NULL); CREATE TABLE IF NOT EXISTS outbox(id TEXT PRIMARY KEY REFERENCES records(id),phase TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0);');
  if(this.db.prepare('PRAGMA quick_check').get().quick_check!=='ok')throw Error('The NPCDex Journal Needs Recovery.');
 }
 transaction(operation){this.db.exec('BEGIN IMMEDIATE');try{const value=operation();this.fault('before-commit');this.db.exec('COMMIT');return value;}catch(error){this.db.exec('ROLLBACK');throw error;}}
 state(){const row=this.db.prepare("SELECT value FROM meta WHERE key='state'").get();return row?JSON.parse(row.value):null;}
 setState(value){this.db.prepare("INSERT INTO meta(key,value) VALUES('state',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(value));}
 document(key='current'){const row=this.db.prepare('SELECT bytes FROM documents WHERE key=?').get(key);return row?Buffer.from(row.bytes):null;}
 setDocument(key,bytes){this.db.prepare('INSERT INTO documents(key,bytes) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET bytes=excluded.bytes').run(key,bytes);}
 blob(id){const row=this.db.prepare('SELECT bytes FROM blobs WHERE hash=?').get(id);if(!row)return null;const b=Buffer.from(row.bytes);if(sha256(b)!==id)throw Error('A Local NPCDex Dependency Failed Its Integrity Check.');return b;}
 putBlob(id,bytes){if(sha256(bytes)!==id)throw Error('Invalid Local NPCDex Dependency.');const existing=this.blob(id);if(existing&&!existing.equals(bytes))throw Error('Immutable NPCDex Blob Changed.');this.db.prepare('INSERT OR IGNORE INTO blobs(hash,bytes) VALUES(?,?)').run(id,bytes);}
 record(id){const row=this.db.prepare('SELECT bytes FROM records WHERE id=?').get(id);if(!row)return null;const b=Buffer.from(row.bytes);if(sha256(b)!==id)throw Error('A Local NPCDex Record Failed Its Integrity Check.');return b;}
 putRecord(id,bytes){if(sha256(bytes)!==id)throw Error('Invalid NPCDex Record.');this.db.prepare('INSERT OR IGNORE INTO records(id,bytes) VALUES(?,?)').run(id,bytes);}
 enqueue(id){this.db.prepare("INSERT OR IGNORE INTO outbox(id,phase) VALUES(?,'queued')").run(id);}
 queue(){return this.db.prepare('SELECT id,phase,attempts FROM outbox ORDER BY rowid').all();}
 attempt(ids){for(const id of ids)this.db.prepare("UPDATE outbox SET phase='uncertain',attempts=attempts+1 WHERE id=?").run(id);}
 acknowledge(ids){for(const id of ids)this.db.prepare('DELETE FROM outbox WHERE id=?').run(id);}
 checkpoint(){this.db.exec('PRAGMA wal_checkpoint(FULL)');}
 close(){this.db.close();}
}
