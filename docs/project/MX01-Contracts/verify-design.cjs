// Design-only fragment/schema and reference checks. No app imports, ROM or network.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.argv[2]?path.resolve(process.argv[2]):fs.existsSync(path.join(__dirname,'features.schema.json'))?__dirname:path.resolve(__dirname,'../../outputs/RDX-Reference/MX01-Contracts');
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const schema=read('features.schema.json'),index=read('condition-index.example.json'),previews=read('location-previews.example.json');
const copy=v=>structuredClone(v),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const resolve=ref=>ref.split('/').slice(1).reduce((r,k)=>r[k],schema);
const allowed=new Set(['$schema','$id','title','description','$defs','$ref','type','oneOf','anyOf','required','additionalProperties','properties','const','enum','pattern','minLength','minimum','maximum','items','minItems','uniqueItems']);
function lint(s){for(const k of Object.keys(s))assert(allowed.has(k),'Unexamined schema construct: '+k);if(s.$ref)assert(resolve(s.$ref));for(const key of ['$defs','properties'])for(const r of Object.values(s[key]||{}))lint(r);for(const key of ['oneOf','anyOf'])for(const r of s[key]||[])lint(r);if(s.items)lint(s.items);}
// Deliberately limited to the constructs above, not advertised as a general JSON Schema engine.
function conforms(v,s,depth=0){
 if(depth>64)return false;
 const test=r=>conforms(v,r,depth+1);
 if(s.$ref&&!test(resolve(s.$ref)))return false;
 if(s.oneOf&&s.oneOf.filter(test).length!==1||s.anyOf&&!s.anyOf.some(test))return false;
 if('const'in s&&!equal(v,s.const)||s.enum&&!s.enum.some(x=>equal(v,x)))return false;
 const type=v===null?'null':Array.isArray(v)?'array':typeof v;
 if(s.type&&s.type!==type&&!(s.type==='integer'&&Number.isSafeInteger(v)))return false;
 if(type==='string'&&(s.minLength!==undefined&&v.length<s.minLength||s.pattern&&!new RegExp(s.pattern).test(v)))return false;
 if(type==='number'&&(s.minimum!==undefined&&v<s.minimum||s.maximum!==undefined&&v>s.maximum))return false;
 if(type==='array'&&(s.minItems!==undefined&&v.length<s.minItems||s.uniqueItems&&new Set(v.map(x=>JSON.stringify(x))).size!==v.length||s.items&&!v.every(x=>conforms(x,s.items,depth+1))))return false;
 if(type==='object'){
  if((s.required||[]).some(k=>!Object.hasOwn(v,k)))return false;
  for(const[k,x]of Object.entries(v)){if(s.properties&&k in s.properties){if(!conforms(x,s.properties[k],depth+1))return false;}else if(s.additionalProperties===false)return false;}
 }
 return true;
}
const records=new Set(['map:example-a','appearance:example-a:assistant','subzone:example-a:house-1f']);
function semantics(v){
 if(!conforms(v,schema))return false;
 if(v.mapRecordId!=='map:example-a')return false;
 if(v.schema==='NPCDexConditionIndex/1'){
  const ids=v.conditions.map(c=>c.id),known=new Set(ids),effects=v.effects.map(e=>e.id);
  if(known.size!==ids.length||new Set(effects).size!==effects.length)return false;
  if(JSON.stringify([...v.displayOrder].sort())!==JSON.stringify([...ids].sort()))return false;
  if(v.effects.some(e=>!records.has(e.target.recordId)||e.conditionIds.some(id=>!known.has(id))))return false;
  if(ids.some(id=>!v.effects.some(e=>e.conditionIds.includes(id))))return false;
  if(v.coverage.some(c=>!records.has(c.recordId)||c.status!=='complete'&&!c.reason))return false;
  if(!v.coverage.some(c=>c.recordId==='appearance:example-a:assistant'))return false;
  return true;
 }
 if(!records.has(v.targetRecordId))return false;
 const ids=new Set(v.candidates.map(c=>c.id));if(ids.size!==v.candidates.length)return false;
 if(v.selectedCandidateId!==null&&!ids.has(v.selectedCandidateId))return false;
 if(v.status==='ready'&&v.selectedCandidateId===null||v.status!=='ready'&&!v.reason||v.ownerOverride&&v.selectedCandidateId===null)return false;
 for(const c of v.candidates){const r=c.crop;if(r.width<=0||r.height<=0||r.x+r.width>1000000||r.y+r.height>1000000)return false;if(c.origin==='generated'&&(!c.sourceRomSha256||!c.renderer||!c.dependencies.length))return false;}
 return true;
}
const checks=[];
function check(name,run){assert(run(),name);checks.push(name);}
function reject(name,base,mutate){check(name,()=>{const v=copy(base);mutate(v);return!semantics(v);});}
lint(schema);
check('fictional condition shape/references accepted',()=>semantics(index));
check('pending image is explicit and valid',()=>semantics(previews));
reject('unknown expression op rejected',index,v=>v.effects[0].requires.op='execute');
reject('unknown source fields rejected',index,v=>v.conditions[0].token='secret');
reject('missing display entry rejected',index,v=>v.displayOrder.pop());
reject('duplicated condition identity rejected',index,v=>v.conditions[1].id=v.conditions[0].id);
reject('dangling effect condition rejected',index,v=>v.effects[0].conditionIds=['condition:absent']);
reject('unrelated map scope rejected',index,v=>v.mapRecordId='map:other');
reject('foreign effect target rejected',index,v=>v.effects[0].target.recordId='appearance:other');
reject('missing coverage rejected',index,v=>v.coverage=[]);
reject('unresolved coverage reason required',index,v=>v.coverage[0].reason='');
reject('ready image without selection rejected',previews,v=>v.status='ready');
reject('dangling image selection rejected',previews,v=>v.selectedCandidateId='candidate:missing');
reject('unsupported image must explain failure',previews,v=>{v.status='unsupported';v.reason='';});
const candidate={id:'candidate:manual',origin:'manual',viewKind:'manual',sourceRecordId:previews.targetRecordId,image:{format:'NPCDexViewImage/1',assetId:'asset:fictional-image-reference'},sourceRomSha256:null,dependencies:[],renderer:null,crop:{x:0,y:0,width:1000000,height:1000000}};
const manual={...copy(previews),status:'ready',reason:'Shape/reference example only; no image bytes provided.',candidates:[candidate],selectedCandidateId:candidate.id,ownerOverride:true};
check('manual override shape accepted without fake ROM provenance',()=>semantics(manual));
reject('out-of-bounds crop rejected',manual,v=>v.candidates[0].crop.x=500000);
reject('generated image requires renderer/dependencies',manual,v=>v.candidates[0].origin='generated');
check('unknown presence remains in both illustrated dialogue guards',()=>index.effects.filter(e=>e.kind==='dialogue').every(e=>e.requires.op==='all'&&e.requires.args.some(x=>x.op==='unknown')));
function tri(op,values){if(op==='not')return values[0]===null?null:!values[0];if(op==='all')return values.includes(false)?false:values.includes(null)?null:true;return values.includes(true)?true:values.includes(null)?null:false;}
check('unknown logic cannot become unconditional',()=>tri('not',[null])===null&&tri('all',[true,null])===null&&tri('all',[false,null])===false&&tri('any',[true,null])===true&&tri('any',[false,null])===null);
const empty={...copy(index),conditions:[],displayOrder:[],effects:[],coverage:[{...index.coverage[0],status:'complete',reason:'Fictional explicit no-speech coverage.'}]};
check('proven no-condition/no-speech map is representable',()=>semantics(empty));
const bindings={schema:'NPCDexFeatureBindings/1',conditionIndexRecordId:'shared:map-example:conditions',locationPreviewViewIds:['view:map:example']};
check('feature binding declaration shape',()=>conforms(bindings,schema));
const result={status:'passed',checks:checks.length,names:checks,limits:'Design-only schema-subset/reference cases. No complete RDX validation, image-byte decode, ROM extraction, installed app, YouTrack or migration proof.'};
fs.writeFileSync(path.join(root,'LP02-Contract-Verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
