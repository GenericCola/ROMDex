export class FileStorage {
 constructor(){this.connection=null;}
 async db(){if(!this.connection)this.connection=new Promise((resolve,reject)=>{const req=indexedDB.open('romdex-files-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('files');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return this.connection;}
 async get(id){const db=await this.db();return new Promise((resolve,reject)=>{const req=db.transaction('files').objectStore('files').get(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
 async set(id,file){return this.write(id,file);}
 async remove(id){return this.write(id);}
 async write(id,file){const db=await this.db();return new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite'),store=tx.objectStore('files');file===undefined?store.delete(id):store.put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Local File Storage Was Interrupted.'));});}
}
export async function uploadRequest(uploadId,file,name){
 const form=new FormData();form.append('uploadId',uploadId);form.append('file',file,name);
 const response=await fetch('/api/uploads',{method:'POST',body:form,signal:AbortSignal.timeout(120000)}),data=await response.json();if(!response.ok){const error=Error(data.error||'Cannot Keep This File in the Local Service.');error.syncStatus=data;throw error;}return data;
}
