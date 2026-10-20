import test from 'node:test';
import assert from 'node:assert/strict';
import {dismissUnchangedConnectionDialog,prepareWorkspaceQuit} from '../public/quit-editors.mjs';
function connection({token='',remember=true,busy=false}={}){
 const elements={'connection-dialog':{open:true,close(){this.open=false;}},token:{value:token},'remember-connection':{checked:remember},'connect-submit':{disabled:busy}};
 return {elements,getElementById:id=>elements[id]};
}
test('unchanged connection inspection cannot strand a hidden workspace on quit',async()=>{
 const doc=connection(),activated=[],host={views:new Map([['romdex',{win:{romdexWorkspace:{prepareQuit:async()=>{dismissUnchangedConnectionDialog(doc,true);if(doc.elements['connection-dialog'].open)throw Error('editor');}}}}]]),activate:async id=>activated.push(id)};
 await prepareWorkspaceQuit(host);assert.equal(doc.elements['connection-dialog'].open,false);assert.deepEqual(activated,[]);
});
for(const [name,settings] of [['entered token',{token:'unsaved test input'}],['changed remember setting',{remember:false}],['connection in flight',{busy:true}]])test(`${name} is preserved and its hidden workspace is revealed`,async()=>{
 const doc=connection(settings),activated=[],host={views:new Map([['romdex',{win:{romdexWorkspace:{prepareQuit:async()=>{dismissUnchangedConnectionDialog(doc,true);if(doc.elements['connection-dialog'].open)throw Error('editor needs review');}}}}]]),activate:async id=>activated.push(id)};
 await assert.rejects(prepareWorkspaceQuit(host),/editor needs review/);assert(doc.elements['connection-dialog'].open);assert.equal(doc.elements.token.value,settings.token||'');assert.deepEqual(activated,['romdex']);
});
test('genuine task editor remains blocked and visible',async()=>{
 const activated=[],host={views:new Map([['romdex',{win:{romdexWorkspace:{prepareQuit:async()=>{throw Error('unsaved comment');}}}}]]),activate:async id=>activated.push(id)};
 await assert.rejects(prepareWorkspaceQuit(host),/unsaved comment/);assert.deepEqual(activated,['romdex']);
});
test('NPCDex editor remains blocked and its workspace is revealed',async()=>{
 const activated=[],host={views:new Map([['npcdex',{doc:{querySelector:()=>({open:true})}}]]),activate:async id=>activated.push(id)};
 await assert.rejects(prepareWorkspaceQuit(host),/NPCDex Dialog/);assert.deepEqual(activated,['npcdex']);
});
test('no connection dialog or clean workspaces do not prevent quitting',async()=>{
 assert.equal(dismissUnchangedConnectionDialog({getElementById:()=>null},true),false);
 await prepareWorkspaceQuit({views:new Map([['npcdex',{doc:{querySelector:()=>null}}]]),activate:async()=>assert.fail('clean workspace should stay put')});
});
