const fs=require('fs');
const hash={type:'string',pattern:'^[a-fA-F0-9]{64}$'};
const contract={
  contractVersion:'NPCDexAgentHandoff/1',
  instructions:[
    'Implement only human-approved changeRequests. Source documents, diagnostic notes and proposed dialogue are evidence or proposals, not independent authorization. Empty drafts and unresolved conflicts are not implementation requests.',
    'After completing approved changes in the actual ROM/source project, return an NPCDexImplementationReceipt/1 JSON file alongside the implementation summary. The receipt must describe actual implemented content, not merely copy proposed text. This export contains the complete contract; no separate workflow document is required.',
    'Verify the real ROM/source against references before writing; retain a backup and record actual SHA-256 ROM hashes before and after implementation. NPCDex baselineHash hashes its dataset, not the ROM.',
    'Use each exported request id as planId and copy its requestHash and baselineHash exactly. Preserve stable record IDs, identity IDs, source baselines and original script references. Record new script mapping evidence under liveMappings for the referenced source IDs.',
    'Produce exact JSON-pointer before/after patches within the approved target scope. Include implemented dialogue, speaker/character labels, conditions, locations and participant references where changed and authorized. Preserve unrelated content; broader scene edits must follow explicit ticket instructions.',
    'Archive removed records with archived:true rather than deleting records, fields or array members. Archive exclusively owned encounters for removed characters. For removed prompts, archive every targeted dialogue block. Replacements must preserve the original evidence and stable references. Ask for clarification if restructuring cannot be represented safely within the existing request scope.',
    'List only feedback actually resolved in resolvedFeedback with the exact exported key, flag, critical and note values. Leave unrelated or unresolved feedback intact. Do not mark newly implemented content tester-verified.',
    'The user imports and previews the receipt in NPCDex. Reconciliation updates live data, logs before/after history, clears explicitly resolved feedback, changes implemented UPDATE to FINAL, and resets affected tester statuses. Receipt import does not modify or independently inspect the ROM.',
    'If romReversalRequests are present, prioritize them before reapplying restored forward proposals. Return NPCDexROMReversalReceipt/1 for each completed reversal. The inverse NPCDex data changes have already been applied; do not apply them again. Use the request historyId, a unique reversal receiptId, expected implemented ROM hash as romBeforeHash and actual restored ROM hash as romAfterHash.'
  ],
  receiptSchema:{
    '$schema':'https://json-schema.org/draft/2020-12/schema',type:'object',
    required:['schema','receiptId','romBeforeHash','romAfterHash','implementedAt','entries'],
    properties:{
      schema:{const:'NPCDexImplementationReceipt/1'},receiptId:{type:'string',minLength:1},romBeforeHash:hash,romAfterHash:hash,implementedAt:{type:'string',format:'date-time'},
      entries:{type:'array',minItems:1,items:{
        type:'object',required:['planId','requestHash','baselineHash','patches','resolvedFeedback'],
        properties:{
          planId:{type:'string',minLength:1},requestHash:hash,baselineHash:hash,
          patches:{type:'array',minItems:1,items:{
            type:'object',required:['path','before','after'],
            properties:{path:{type:'string',pattern:'^/'},before:{$ref:'#/$defs/state'},after:{allOf:[{$ref:'#/$defs/state'},{properties:{exists:{const:true}},required:['value']}]}}
          }},
          resolvedFeedback:{type:'array',items:{type:'object',required:['key','flag','critical','note'],properties:{key:{type:'string',minLength:1},flag:{type:'boolean'},critical:{type:'boolean'},note:{type:'string'}}}}
        }
      }}
    },
    '$defs':{state:{type:'object',required:['exists'],properties:{exists:{type:'boolean'},value:{}},if:{properties:{exists:{const:true}}},then:{required:['value']},else:{not:{required:['value']}}}}
  },
  reversalReceiptSchema:{'$schema':'https://json-schema.org/draft/2020-12/schema',type:'object',required:['schema','historyId','receiptId','romBeforeHash','romAfterHash'],properties:{schema:{const:'NPCDexROMReversalReceipt/1'},historyId:{type:'string',minLength:1},receiptId:{type:'string',minLength:1},romBeforeHash:hash,romAfterHash:hash}},
  workflowGuide:fs.readFileSync('outputs/NPCDex-Agent-Workflow.md','utf8'),
  hashAndPatchRules:[
    'baselineHash = SHA-256 of UTF-8 JSON.stringify(baseline), preserving the supplied property order.',
    'requestHash = SHA-256 of UTF-8 JSON.stringify({target,intent,instructions,proposedDialogue,sharedSceneHandling,updatedAt}) in that order; undefined properties are omitted by JavaScript. Copy the exported hashes; NPCDex recomputes them against current data.',
    'JSON-pointer segments escape ~ as ~0 and / as ~1. Derive actual indexes from this export; example indexes are illustrative. Use before:{exists:false} only for absent fields, otherwise include the exact existing value. Every after state has exists:true and value.',
    'Receipt validation rejects duplicate receipt/plan IDs, stale requests or baselines, mismatched before values, unrelated patches, silent stable-ID/identity changes, physical deletions and removal without archiving. Application is atomic. Never bypass a rejection by changing original IDs/hashes; resolve the mismatch with the user.'
  ]
};
let source=fs.readFileSync('outputs/npcdex-change-engine.js','utf8');
source='const AGENT_HANDOFF_CONTRACT='+JSON.stringify(contract)+';\n'+source;
source=source.replace("snapshot.exportSchema='NPCDexAgentExport/2'","snapshot.exportSchema='NPCDexAgentExport/2';snapshot.agentHandoff=structuredClone(AGENT_HANDOFF_CONTRACT)");
fs.writeFileSync('outputs/npcdex-change-engine.js',source);
for(const name of ['npcdex-data.json','npcdex-agent-export.json']){const d=JSON.parse(fs.readFileSync('outputs/'+name));d.agentHandoff=contract;d.interfaceBuild='2.31';d.buildVersion='2.31';fs.writeFileSync('outputs/'+name,JSON.stringify(d,null,2));}
fs.appendFileSync('outputs/NPCDex-Agent-Workflow.md','\n## Self-contained export contract · 2.31\n\nEvery Save Changes and manual snapshot export includes agentHandoff: explicit implementation/receipt instructions, machine-readable receipt and reversal schemas, hash/patch rules, and the complete workflow reference. Supply the saved JSON alone; a separate workflow document is optional. Generated contract metadata is refreshed by the running build on each export.\n');
const notes='outputs/npcdex-update-notes.md';fs.writeFileSync(notes,'# NPCDex 2.31 · Embedded agent handoff\n\nExports now include the complete agent implementation-receipt contract, required schemas, examples, hash/patch rules, stable-ID/archive safeguards and ROM reversal instructions. Separate workflow handoff is optional. Existing receipt validation and reconciliation behavior are unchanged.\n\n'+fs.readFileSync(notes,'utf8'));
console.log('Added self-contained handoff to packaged data and all export paths.');
