import fs from 'node:fs/promises';
async function replace(file,from,to){let text=await fs.readFile(file,'utf8');if(!text.includes(from)||text.indexOf(from)!==text.lastIndexOf(from))throw Error('Expected one patch target: '+file+' '+from.slice(0,70));await fs.writeFile(file,text.replace(from,to));}
const base='outputs/ROMDex/content/';
await replace(base+'reader.mjs',"review.push({kind:'native-metadata-changed',issueId:pin.issueId,message:'Native Metadata Changed Without a Validated Content Event.'})","review.push({kind:'native-metadata-changed',issueId:pin.issueId,recordId:entry.carrier.bindings.find(b=>b.issueId===pin.issueId)?.recordId||null,before:pin,observed:{issueId:pin.issueId,summary:native.summary,parentIssueId:native.parentIssueId,descriptionSha256:native.descriptionSha256,commentsSha256:native.commentsSha256},message:'Native Metadata Changed Without a Validated Content Event.'})");
await replace(base+'writer.mjs',"const nativeMetadata=[];for(const issueId of new Set([this.transport.registryIssueId,...prior.values()]))nativeMetadata.push({issueId,...await this.transport.native(issueId)});","const nativeMetadata=await readNativePins(this.transport,[...new Set([this.transport.registryIssueId,...prior.values()])]);");
await replace(base+'writer.mjs',"requireThat(current&&same(pin,current),'Native Content Changed Before Publication.');","const reviewed=op.nativeReview?.find(r=>r.issueId===pin.issueId);requireThat(current&&same(reviewed?.observed||pin,current),'Native Content Changed Before Publication.');if(reviewed)requireThat(same(reviewed.before,pin),'The Reviewed Native Baseline Changed.');");
await replace(base+'writer.mjs',"const reviewingDrafts=", "const reviewingDrafts=");
// The preflight may contain only the exact native discrepancies reviewed by this operation.
await replace(base+'writer.mjs',"if(!resolving&&(!reviewingDrafts&&remote.review.length||", "const reviewingNative=op.nativeReview&&same(remote.review,op.nativeReview);\n   if(!resolving&&(!reviewingNative&&!reviewingDrafts&&remote.review.length||");
await replace(base+'writer.mjs',"await this.reader.cycle(true,{audit:manual});if(this.isAncestor", "await this.reader.cycle(true,{audit:false});if(this.isAncestor");
await replace(base+'writer.mjs',"await this.object(op,'manifest'", "if(op.nativeReview)for(const pin of op.nativeReview){const now={issueId:pin.issueId,...await this.transport.native(pin.issueId)};requireThat(same(now,pin.observed),'Native Metadata Changed During Review Publication.');}\n  await this.object(op,'manifest'");
await replace(base+'writer.mjs',"export class ContentEditor{",`async function readNativePins(transport,ids){
 const values=new Array(ids.length);let next=0,failure;
 await Promise.all(Array.from({length:Math.min(4,ids.length)},async()=>{while(!failure){const i=next++;if(i>=ids.length)return;try{values[i]={issueId:ids[i],...await transport.native(ids[i])};}catch(e){failure||=e;}}}));
 if(failure)throw failure;return values;
}
export class ContentEditor{`);
await replace(base+'desktop-provider.mjs',"if(input?.action==='resolve')", "if(input?.action==='native'){const result=editor.queueNativeReview(input.reviews,input.expectedHead);if(enabled())queueMicrotask(()=>editor.sync());return result;}if(input?.action==='resolve')");
await replace(base+'preview-server.mjs',"if(input.action==='resolve')", "if(input.action==='native')return send(200,JSON.stringify(editor.queueNativeReview(input.reviews,input.expectedHead)));if(input.action==='resolve')");
// Reuse the same stylesheet in native and isolated verification views.
await replace(base+'preview-server.mjs',"if(editor)html=html.replace('</head>','<style>","if(editor)html=html.replace('</head>','<style>'+await fs.readFile(new URL('./native.css',import.meta.url),'utf8')+'</style><style>");
// Remove the obsolete duplicated field rules, which would override shared padding.
await replace(base+'preview-server.mjs',".content-editor-dialog label{display:grid;gap:5px}</style>",".content-editor-dialog label{gap:5px}</style>");
