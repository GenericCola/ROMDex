// A character identity may own several ROM placements. Only the presentation
// roster is grouped: source records, prompts, annotations and mappings stay put.
export function groupCharacterTiles(town, records, gender='male') {
 const byId=new Map(records.map(r=>[r.recordId,r])),groups=new Map(),out=[];
 for(const character of town.characters){
  const source=byId.get(character.contentRecordId),profileId=character.profileId||(source?.kind==='appearance'?(source.current.payload.profileByPlayerGender[gender]||source.current.payload.profileId):null);
  if(!profileId||character.archived){out.push(character);continue;}
  const prior=groups.get(profileId);
  if(!prior){const copy={...character,profileId,elementIds:[...character.elementIds],sceneIds:[...character.sceneIds]};groups.set(profileId,copy);out.push(copy);continue;}
  prior.id=profileId;prior.identityId=profileId;prior.name=byId.get(profileId).current.payload.name;prior.placementIds=[...new Set([...(prior.placementIds||[prior.contentRecordId]),character.contentRecordId])];
  prior.elementIds=[...new Set([...prior.elementIds,...character.elementIds])];prior.sceneIds=[...new Set([...prior.sceneIds,...character.sceneIds])];
 }
 for(const c of out.filter(c=>c.placementIds?.length>1))for(const area of town.areas)for(const element of area.elements)for(const point of element.points){if(point.participantIds?.some(id=>c.placementIds.includes(id)))point.participantIds=[...new Set([...point.participantIds,c.id])];for(const block of point.blocks)if(c.placementIds.includes(block.speaker)){block.placementSpeakerId=block.speaker;block.speaker=c.id;}}
 town.characters=out;return town;
}
