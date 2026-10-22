from pathlib import Path
root=Path(__file__).resolve().parents[2]/'outputs/ROMDex'
def replace(file,old,new):
    p=root/file
    text=p.read_text(encoding='utf-8')
    if new in text:return
    assert text.count(old)==1,(file,old[:80],text.count(old))
    p.write_text(text.replace(old,new),encoding='utf-8',newline='\n')
replace('rdx/document-cloud.mjs',"import {installReviewedParentMoves}","import {installCloudFeatureChecks} from './cloud-features.mjs';\nimport {CONDITION_CAPABILITY} from './features.mjs';\nimport {installReviewedParentMoves}")
replace('rdx/document-cloud.mjs',"const commit=sealCommit({format:intent.deliveryVersion===2?'RDXCloudCommit/2':'RDXCloudCommit/1',key,instance", "const commit=sealCommit({format:intent.deliveryVersion===2?'RDXCloudCommit/2':'RDXCloudCommit/1',...(value.document.capabilities.required.includes(CONDITION_CAPABILITY)?{requiredCapabilities:value.document.capabilities.required}:{}),key,instance")
replace('rdx/document-cloud.mjs','installReviewedParentMoves(DocumentCloud);','installReviewedParentMoves(DocumentCloud);\ninstallCloudFeatureChecks(DocumentCloud);')
replace('rdx/youtrack-store.mjs',"import ","import ") if False else None
p=root/'rdx/youtrack-store.mjs'
text=p.read_text(encoding='utf-8')
if 'installTransportFeatureChecks(YouTrackRDXStore)' not in text:
    p.write_text("import {installTransportFeatureChecks} from './cloud-features.mjs';\n"+text+'\ninstallTransportFeatureChecks(YouTrackRDXStore);\n',encoding='utf-8',newline='\n')
replace('rdx/cloud-parts.mjs',"import {validateDocument}","import {validateDocument,requireCapabilities}")
replace('rdx/cloud-parts.mjs',"const d=structuredClone(part.header);for(const [key,refs]", "const d=structuredClone(part.header);requireCapabilities(d.capabilities?.required);for(const [key,refs]")
