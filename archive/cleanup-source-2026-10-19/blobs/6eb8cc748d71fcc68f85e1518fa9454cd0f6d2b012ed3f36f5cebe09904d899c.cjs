function correctNewBarkIdentification(dataset){
 const t=dataset.towns.find(t=>t.id==='new-bark-town');if(!t||dataset.migrations?.newBarkIdentification===1)return false;
 const areas=new Map(t.areas.map(a=>[a.id,a])),locations=new Map(t.locations.map(l=>[l.id,l]));
 const lab=locations.get('lab'),residence=locations.get('family-house');if(!lab||!areas.has('61')||!areas.has('62'))return false;
 function rename(obj,value){if(!obj)return;if(obj.name!==value){obj.legacyNames=[...new Set([...(obj.legacyNames||[]),obj.name].filter(Boolean))];obj.name=value;}}
 rename(lab,'Elm’s Lab');lab.areaIds=[...new Set(['61','62',...lab.areaIds])];
 if(residence){rename(residence,'Elm’s Lab · upstairs residence');residence.aliasOf='lab';residence.aliasAreaId='62';}
 rename(areas.get('61'),'Elm’s Lab · laboratory');areas.get('61').floor='Floor 1 · Laboratory';
 rename(areas.get('62'),'Elm’s Lab · family residence');areas.get('62').floor='Floor 2 · Family residence';
 rename(locations.get('small-house'),'Southwest resident’s house');rename(areas.get('65'),'Southwest resident’s house');if(areas.has('65'))areas.get('65').floor=areas.get('65').name;
 rename(locations.get('street-house'),'Friend’s house (southeast)');
 if(locations.has('street-house'))locations.get('street-house').nameByGender={male:'Lyra’s house (southeast)',female:'Ethan’s house (southeast)'};
 rename(areas.get('66'),'Friend’s house · downstairs');rename(areas.get('384'),'Friend’s house · upstairs');
 dataset.migrations={...(dataset.migrations||{}),newBarkIdentification:1};
 dataset.identificationCorrections={...(dataset.identificationCorrections||{}),newBarkTown:{version:1,labAreaIds:['61','62'],southwestHouseAreaIds:['65'],friendHouseAreaIds:['66','384'],retainedAliasLocationId:'family-house',note:'Map 62 is the upstairs family residence of Elm’s Lab. Existing canonical map, dialogue, block and script IDs are retained; former location names and the residence tile record are preserved.'}};
 return true;
}
if(typeof module!=='undefined')module.exports=correctNewBarkIdentification;
