import {COMPLEXITIES} from './public/field-tags.mjs';
export const COMPLEXITY_VALUES=COMPLEXITIES.map(x=>x.value);
export const PROJECT_FIELDS='id,$type,canBeEmpty,field(id,name,fieldType(id)),bundle(id,name,values(id,name))';
export function complexityConfiguration(schema){
 const spec=schema.find(x=>x.field?.name==='Complexity');
 if(!spec)return {ready:false,missing:true,values:[],message:'Set Up the Complexity Field in Connection.'};
 const compatible=spec.field?.fieldType?.id==='enum[1]'&&spec.$type==='EnumProjectCustomField';
 const values=(spec.bundle?.values||[]).map(x=>x.name),missing=COMPLEXITY_VALUES.filter(x=>!values.includes(x));
 return {ready:compatible&&spec.canBeEmpty===true&&!missing.length,missing:false,compatible,values,missingValues:missing,canBeEmpty:spec.canBeEmpty===true,message:!compatible?'Complexity Must Be a Single-Choice Enum Field.':missing.length||!spec.canBeEmpty?'Complete the Complexity Field Setup in Connection.':''};
}
// Only PMON's attachment changes. Existing shared bundles/defaults are never modified.
export async function ensureComplexity(yt){
 const readSchema=async()=>yt.schema=await yt.list(`admin/projects/${yt.projectId}/customFields`,{fields:PROJECT_FIELDS});
 await readSchema();let config=complexityConfiguration(yt.schema),spec=yt.schema.find(x=>x.field?.name==='Complexity');
 if(config.ready)return config;
 if(spec&&!config.compatible)throw new Error(config.message);
 if(spec){
  if(config.missingValues.length)throw new Error('The Existing Complexity Field Has Different Values. Its Bundle Was Not Changed; Review Its Configuration in YouTrack.');
  await yt.request(`admin/projects/${yt.projectId}/customFields/${spec.id}`,{method:'POST',body:{$type:'EnumProjectCustomField',canBeEmpty:true}});
  await readSchema();config=complexityConfiguration(yt.schema);if(!config.ready)throw new Error('YouTrack Did Not Confirm Optional Complexity.');return config;
 }
 const prototypes=spec?[]:await yt.list('admin/customFieldSettings/customFields',{fields:'id,name,fieldType(id)'});
 let prototype=spec?.field||prototypes.find(x=>x.name==='Complexity');
 if(prototype&&prototype.fieldType?.id!=='enum[1]')throw new Error('An Existing Complexity Field Uses a Different Type. It Was Not Changed.');
 const names=[...new Set([...(spec?.bundle?.values||[]).map(x=>x.name),...COMPLEXITY_VALUES])];
 const bundleName='ROMDex PMON Complexity',bundles=await yt.list('admin/customFieldSettings/bundles/enum',{fields:'id,name,values(id,name)'});
 let bundle=bundles.find(x=>x.name===bundleName&&names.every(name=>x.values?.some(v=>v.name===name)));
 if(!bundle)bundle=await yt.request('admin/customFieldSettings/bundles/enum?fields=id,name,values(id,name)',{method:'POST',body:{name:bundleName,$type:'EnumBundle',values:names.map(name=>({name,$type:'EnumBundleElement'}))}});
 if(!prototype)prototype=await yt.request('admin/customFieldSettings/customFields?fields=id,name,fieldType(id)',{method:'POST',body:{name:'Complexity',fieldType:{id:'enum[1]'},isAutoAttached:false,isDisplayedInIssueList:true,fieldDefaults:{$type:'EnumBundleCustomFieldDefaults',bundle:{id:bundle.id,$type:'EnumBundle'}}}});
 // Refresh before attaching, including when a prior interrupted attempt already succeeded.
 await readSchema();spec=yt.schema.find(x=>x.field?.name==='Complexity');
 if(spec){config=complexityConfiguration(yt.schema);if(config.ready)return config;throw new Error('Complexity Was Added During Setup. Review Its Configuration Before Retrying.');}
 const target=`admin/projects/${yt.projectId}/customFields`+(spec?'/'+spec.id:'');
 await yt.request(target+'?fields='+encodeURIComponent(PROJECT_FIELDS),{method:'POST',body:{$type:'EnumProjectCustomField',...(spec?{}:{field:{id:prototype.id}}),bundle:{id:bundle.id,$type:'EnumBundle'},canBeEmpty:true,...(spec?{}:{isPublic:true}),emptyFieldText:'Not Set'}});
 await readSchema();config=complexityConfiguration(yt.schema);if(!config.ready)throw new Error('YouTrack Did Not Confirm the Complexity Field Setup.');return config;
}
