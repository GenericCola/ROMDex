// Final read-only confirmation after fixture cleanup. Does not read or change live save payloads.
const fs=require('node:fs/promises'),path=require('node:path');
const {start}=require('./u20b-live-support.cjs');
start(async({api,state,work,report,assert})=>{
 assert.equal(state.stage,'cleaned');
 const content=await api.list('/api/issues?query='+encodeURIComponent('project: NPCD')+'&fields=id,idReadable');
 const tasks=await api.list('/api/issues?query='+encodeURIComponent('project: PMON')+'&fields=id',{pageSize:50});
 const project=await api.request('GET','/api/admin/projects/'+state.project.id+'?fields=id,name,shortName,leader(id,login),team(id,usersCount)');
 assert.equal(project.id,'0-2');assert.equal(project.shortName,'NPCD');
 report.checks.push({label:'Final project and issue inventory after fixture cleanup',contentProject:project,visibleContentIssues:content.length,visiblePMONIssues:tasks.length,fixtureIdsAbsent:state.deleted.length===4});
 const pkg=JSON.parse(await fs.readFile(path.resolve(__dirname,'../outputs/ROMDex/package.json'),'utf8'));
 report.applicationVersion=pkg.version;report.productionProviderChanged=false;report.liveSaveImported=false;report.permissionsChanged=false;
});
