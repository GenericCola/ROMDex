const path=require('node:path'),{pathToFileURL}=require('node:url');
module.exports=function run(mode){require('./u20c-live-support.cjs').start(async context=>{
 const {api,state,save,work,root,report,assert}=context;assert(state.content.seed);const load=name=>import(pathToFileURL(path.join(root,'outputs/ROMDex/content',name+'.mjs'))),{ContentCache}=await load('cache'),{ContentReader}=await load('reader'),{YouTrackContentReader}=await load('youtrack-reader');
 const blocked=state.content.update?.carrier.artifacts[2].object.chunks[0];let injected=0,gets=0;
 const transport=new YouTrackContentReader({projectId:'0-2',registryIssueId:state.issues.registry.id,ownerId:'2-2',credential:async()=>api.token,pageSize:2,fetch:async(url,options)=>{assert.equal(options.method,'GET');gets++;if(mode==='interrupted'&&new URL(url).pathname==='/api/issues/'+blocked.issueId+'/attachments/'+blocked.attachmentId){injected++;return new Response('{}',{status:503});}return fetch(url,options);}});
 const cache=new ContentCache({directory:path.join(work,'live-reader-cache'),workspace:'fixture:workspace',isolation:true}),reader=new ContentReader({transport,cache,workspace:'fixture:workspace',bootstrapPublication:state.content.seed.pub.digest,enabled:()=>false});
 try{
  const before=reader.view();await reader.cycle();assert.equal(gets,0,'Auto-Sync Off Issued a Request');
  const view=await reader.cycle(true);assert(view.active,JSON.stringify(view.review));assert.equal(view.status.automaticRemote,false);assert.equal(view.snapshot.contentPreview.plans.length,4);assert(!JSON.stringify(view).includes('/api/files/'));
  if(mode==='baseline'){assert.equal(view.head,state.content.seed.pub.digest);assert.equal(view.status.attention,false,JSON.stringify(view.review));}
  else if(mode==='interrupted'){assert(injected>0);assert.equal(before.head,state.content.seed.pub.digest);assert.equal(view.head,before.head);assert(view.status.attention);assert.equal(view.snapshot.towns[0].areas[0].elements.find(e=>e.id==='fixture:guide').points[0].blocks[0].text,'Welcome.');}
  else{assert.equal(before.head,state.content.seed.pub.digest);assert.equal(view.head,state.content.update.pub.digest);assert.equal(view.status.attention,false,JSON.stringify(view.review));const area=view.snapshot.towns[0].areas[0];assert.equal(area.elements.find(e=>e.id==='fixture:guide').points[0].blocks[0].text,state.content.update.expected.guideText);assert.equal(area.elements.find(e=>e.id==='fixture:scene').name,state.content.update.expected.sceneName);}
  state.content.readProcesses=state.content.readProcesses||{};state.content.readProcesses[mode]={pid:process.pid,head:view.head,at:new Date().toISOString()};await save();
  report.checks.push({label:'Read-only production module exercised against real YouTrack fixture attachments',mode,head:view.head,GETRequests:gets,remoteWritesByReader:0,injectedResponses:injected,manualCycleKeptAutomaticSyncOff:true,plansPreserved:4,priorCacheHead:before.head,readProcess:process.pid});
 }finally{await reader.stop();cache.close();}
});};
