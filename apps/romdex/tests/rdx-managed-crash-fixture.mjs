import {ManagedDocuments} from '../rdx/managed-store.mjs';
const [dataDirectory,key,point]=process.argv.slice(2);
const store=await ManagedDocuments.open({dataDirectory});
const current=await store.view(key);current.document.extensions['org.romdex.crash-test']={note:'Durable Newer Draft  ',point};
store.fault=name=>{if(name===point)process.exit(86);};
await store.save(key,{documentBytes:Buffer.from(JSON.stringify(current.document)),expectedRevision:current.status.revision});
throw Error('Expected Crash Point Was Not Reached.');
