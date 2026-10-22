import json, zipfile, zlib, pathlib, collections

root = pathlib.Path('C:/Users/mrgen/Documents/Codex/2026-10-13/can')
data = pathlib.Path('C:/Users/mrgen/AppData/Local/ROMDexDesktop/Data/thegobindsingh-PMON')
archive = root / 'outputs/Protected/NPCDex-Archive-2026-10-20/Complete-ROMDex-Data-Before-Reset.zip'

def document(raw):
    assert raw[:8] == b'ROMDXR01'
    length = int.from_bytes(raw[8:12], 'little')
    manifest = json.loads(raw[12:12+length])
    entry = next(e for e in manifest['entries'] if e['id'] == 'document')
    start = 12+length+entry['offset']
    payload = raw[start:start+entry['storedBytes']]
    return json.loads(zlib.decompress(payload, -15) if entry['codec'] == 'deflate-raw' else payload)

def summarize(doc):
    revisions = {r['revisionId']: r for r in doc['content']['records']}
    records = [revisions[h['revisionId']] for h in doc['content']['recordHeads']]
    map_record = next(r for r in records if r['kind']=='map')
    timeline = next(r for r in records if r['recordId']==map_record['current']['payload']['timelineRef'])
    stages = timeline['current']['payload']['definitions'].get('stages', [])
    points = []
    entities = []
    for record in records:
        payload = record['current']['payload']
        record_points = list(payload.get('points', {}).values())
        points.extend(record_points)
        if record['kind'] in ('appearance', 'interactive', 'scene'):
            entities.append({'name':payload.get('overrides',{}).get('displayName') or payload.get('name'), 'kind':record['kind'], 'points':len(record_points), 'staged':sum(bool(p['stageIds']) for p in record_points), 'stageAssignments':[p['stageIds'] for p in record_points]})
    return {'map':map_record['current']['payload']['name'], 'records':len(records), 'stages':[{'id':s['id'], 'name':s['name']} for s in stages], 'points':len(points), 'stagedPoints':sum(bool(p['stageIds']) for p in points), 'unstagedPoints':sum(not p['stageIds'] for p in points), 'assignments':dict(collections.Counter(s for p in points for s in p['stageIds'])), 'entities':entities}

result = {'archive':[], 'current':[]}
with zipfile.ZipFile(archive) as z:
    for name in z.namelist():
        if '/RDX/working/' in name and name.endswith('.rdx'):
            result['archive'].append(summarize(document(z.read(name))))
    snapshot_name = 'thegobindsingh-PMON/service/npcdex-current.json'
    snapshot = json.loads(z.read(snapshot_name))
    result['archiveSnapshotKeys'] = list(snapshot)
for folder in ('RDX/working', 'ROMImport/RDX/working'):
    for path in (data/folder).glob('*.rdx'):
        summary = summarize(document(path.read_bytes()))
        summary['source'] = folder
        result['current'].append(summary)
output = root/'work/mapdex-layout-review/timeline-comparison.json'
output.write_text(json.dumps(result,indent=2),encoding='utf-8')
for side in ('archive','current'):
    for summary in result[side]:
        print(json.dumps({'side':side, **{k:v for k,v in summary.items() if k not in ('entities','stages')}, 'stageNames':[s['name'] for s in summary['stages']]}))
print('Snapshot keys:',result['archiveSnapshotKeys'])
