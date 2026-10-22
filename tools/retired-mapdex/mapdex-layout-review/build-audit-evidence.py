import pathlib, json, hashlib, datetime, collections
root=pathlib.Path('C:/Users/mrgen/Documents/Codex/2026-10-13/can')
comparison=json.loads((root/'work/mapdex-layout-review/timeline-comparison.json').read_text(encoding='utf-8'))
def compact(row):
    return {**{k:v for k,v in row.items() if k not in ('entities','stages')},'stageCount':len(row['stages']),'entityKinds':{kind:{'entities':sum(e['kind']==kind for e in row['entities']),'points':sum(e['points'] for e in row['entities'] if e['kind']==kind),'stagedPoints':sum(e['staged'] for e in row['entities'] if e['kind']==kind)} for kind in ('appearance','interactive','scene')}}
paths=['rom/compile-map.mjs','rom/source-context.mjs','rom/profiles.mjs','rom/MAPDEX.md','rom/workspace.mjs','rom/grouped-document.mjs','rom/extract.mjs','rom/textures.mjs','content/projection.mjs','public/rom-import.html','public/rom-import.css','public/map-character-links.mjs','content/native-projection.mjs','content/character-tiles.mjs','content/timeline-core.js','rdx/youtrack-store.mjs','rdx/document-cloud.mjs','rdx/result-validation.mjs','rdx/result-application.mjs']
data=pathlib.Path('C:/Users/mrgen/AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON')
files=[]
for folder in ('RDX/working','ROMImport/RDX/working'):
    for path in (data/folder).glob('*.rdx'):
        raw=path.read_bytes()
        files.append({'area':folder,'name':path.name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
new=next(s for s in comparison['current'] if s['map']=='New Bark Town' and s['source']=='RDX/working')
prepared=next(s for s in comparison['current'] if s['map']=='New Bark Town' and s['source']=='ROMImport/RDX/working')
evidence={'format':'MAPDexPipelineAuditEvidence/1','reviewDate':'2026-10-21','capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'applicationVersion':'0.5.26','applicationMutated':False,'archiveRestored':False,'archive': [compact(r) for r in comparison['archive']], 'current':[compact(r) for r in comparison['current']], 'newBarkComparison':{'samePreparedAndNpcdexTimelineDefinitions':new['stages']==prepared['stages'],'samePreparedAndNpcdexEntityStageAssignments':new['entities']==prepared['entities']},'files':files,'sourceHashes':{p:hashlib.sha256((root/'outputs/ROMDex'/p).read_bytes()).hexdigest() for p in paths},'readOnlyYouTrackObservations':{'authenticatedLogin':'GenericCola','query':'project: NPCD','returnedIssues':0,'hasNextPage':False,'interpretation':'No fresh backend content/hierarchy verification can be claimed from this connector result.','typeEnum':['Milestone','Task','Subtask'],'stateEnum':['Open','In Progress','In Review','On hold','Done','Canceled']},'checksPerformed':['Read archived working RDX documents without restoration','Decode current prepared and NPCDex working RDX documents without writing them','Compare timeline definitions and per-entity point stage assignments','Read current source and existing delivery evidence','Inspect existing native UI screenshots','Read connector account, project field schema and issue search'],'checksNotRepeated':['No extraction rerun','No application build or install','No live backend write','No new Windows UI acceptance','No full regression suite']}
out=root/'outputs/Documentation/Project/MAPDex-NPCDex-Pipeline-Audit-2026-10-21-Evidence.json'
out.write_text(json.dumps(evidence,indent=2),encoding='utf-8')
print(json.dumps({'path':str(out),'rdxFilesRead':len(files),'sourceHashes':len(paths)}))
