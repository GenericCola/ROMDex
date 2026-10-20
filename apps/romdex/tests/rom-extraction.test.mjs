import test from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {decodeMessage} from '../rom/messages.mjs';
import {decodeInstruction,decodeScriptGraph,scriptEntries,decodeLevelScripts,resolveScriptNumber,spriteReference} from '../rom/scripts.mjs';
import {analyzeScriptState} from '../rom/script-state.mjs';
import {readBTX,renderTexture,encodePNG} from '../rom/textures.mjs';
import {extractionDigest,validateExtraction} from '../rom/extract.mjs';
function bank(words,{key=0x1234}={}){
 const b=Buffer.alloc(12+words.length*2),mask=((765*key)&65535)*65537;b.writeUInt16LE(1);b.writeUInt16LE(key,2);b.writeUInt32LE((12^mask)>>>0,4);b.writeUInt32LE((words.length^mask)>>>0,8);
 let seed=596947&65535;words.forEach((w,i)=>{b.writeUInt16LE(w^seed,12+i*2);seed=(seed+18749)&65535;});return b;
}
test('message decoding retains controls, line/page breaks and exact source ranges',()=>{
 const r=decodeMessage(bank([0x12b,0x1de,0xfffe,0x100,1,7,0xe000,0x25bd,0xffff]),0);
 assert.equal(r.text,'A [CTRL:0100:7]\n\f');assert.equal(r.bytes,18);assert.equal(r.tokens[2].kind,'control');assert.deepEqual(r.unknownCodes,[]);
 assert.equal(decodeMessage(bank([0x3333,0xffff]),0).tokens[0].kind,'unknown-character');
});
test('compressed 9-bit text is unpacked from 15-bit words and requires its sentinel',()=>{
 const values=[0x12b,0x145,511],packed=[];let n=0,bits=0;for(const v of values){n|=v<<bits;bits+=9;while(bits>=15){packed.push(n&32767);n>>>=15;bits-=15;}}if(bits)packed.push(n);
 const r=decodeMessage(bank([0xf100,...packed,0xffff]),0);assert.equal(r.text,'Aa');assert.equal(r.compressed,true);
 assert.throws(()=>decodeMessage(bank([0xf100,0x8000,0xffff]),0),{code:'INVALID'});
 assert.equal(decodeMessage(bank([0xf100,0x7f2b,0xffff]),0).text,'A');
});
test('message table, operand and terminator corruption fail without guessing content',()=>{
 assert.throws(()=>decodeMessage(bank([0x12b,0xffff]),1),{code:'BOUNDS'});
 assert.throws(()=>decodeMessage(bank([0xfffe,256,7,0xffff]),0),{code:'BOUNDS'});
 assert.throws(()=>decodeMessage(bank([0x12b]),0),{code:'INVALID'});
 assert.throws(()=>decodeMessage(bank([0xffff,0x12b,0xffff]),0),{code:'INVALID'});
 assert.throws(()=>decodeMessage(bank([0x12b,0xffff]),0,{maxWords:1}),{code:'BOUNDS'});
});
test('entry pointers are relative to each table row and cannot select table bytes',()=>{
 const b=Buffer.alloc(18);b.writeInt32LE(6);b.writeInt32LE(4,4);b.writeUInt16LE(0xfd13,8);b.writeUInt16LE(2,10);b.writeUInt16LE(2,12);
 assert.deepEqual(scriptEntries(b).entries,[10,12]);b.writeInt32LE(-4);assert.throws(()=>scriptEntries(b),{code:'BOUNDS'});
});
test('branches/calls form a bounded graph, with explicit unknown ranges and overlap rejection',()=>{
 const b=Buffer.alloc(14);b.writeUInt16LE(22);b.writeInt32LE(4,2);b.writeUInt16LE(2,6);b.writeUInt16LE(2,10);
 const g=decodeScriptGraph(b,[0]);assert.deepEqual(g.instructions.map(r=>r.offset),[0,10]);assert.equal(g.edges[0].to,10);
 const bad=Buffer.from(b);bad.writeInt32LE(-4,2);assert.throws(()=>decodeScriptGraph(bad,[0]),{code:'INVALID'});
 const unknown=decodeScriptGraph(Buffer.from([255,127]),[0]);assert.equal(unknown.unresolved[0].code,'UNSUPPORTED_OPCODE');
 assert.throws(()=>decodeScriptGraph(b,[0],{maxInstructions:1}),{code:'LIMIT'});
});
test('subcommand-dependent widths do not silently desynchronize following instructions',()=>{
 for(const [op,action,expected]of [[465,0,8],[465,4,6],[465,6,4],[489,0,4],[489,1,6],[489,5,8]]){
  const b=Buffer.alloc(12);b.writeUInt16LE(op);b.writeUInt16LE(action,2);assert.equal(decodeInstruction(b,0).bytes,expected);
 }
 const b=Buffer.alloc(4);b.writeUInt16LE(465);b.writeUInt16LE(99,2);assert.throws(()=>decodeInstruction(b,0),{code:'UNSUPPORTED_OPCODE'});
});
test('scene hooks retain exact variable predicates and global load-script numbers',()=>{
 const b=Buffer.alloc(24);b[0]=1;b.writeUInt32LE(6,1);b[5]=2;b.writeUInt32LE(9600,6);b.writeUInt16LE(0x4074,11);b.writeUInt16LE(3,13);b.writeUInt16LE(5,15);
 const hooks=decodeLevelScripts(b);assert.equal(hooks[0].conditions[0].left,0x4074);assert.equal(hooks[0].conditions[0].scriptNumber,5);assert.equal(hooks[1].scriptNumber,9600);
 b.writeUInt32LE(99999,1);assert.throws(()=>decodeLevelScripts(b),{code:'BOUNDS'});
});
test('shared script IDs resolve through the ROM namespace table and variable sprites stay conditional',()=>{
 const rows=[{minimum:3000,scriptBank:953,messageBank:40},{minimum:2000,scriptBank:3,messageBank:40}],context={scriptBank:857,messageBank:556};
 assert.deepEqual(resolveScriptNumber(3028,context,rows),{scriptBank:953,messageBank:40,entry:28});assert.equal(resolveScriptNumber(1,context,rows).entry,0);
 assert.equal(resolveScriptNumber(0,context,rows).scriptBank,140);
 assert.deepEqual(spriteReference(101),{kind:'variable',variable:0x4020});assert.equal(spriteReference(117).kind,'variable');assert.equal(spriteReference(118).kind,'static');
});
test('constant propagation resolves menus/external messages and loses unsafe knowledge across calls',()=>{
 const rows=[{offset:0,name:'SetVar',params:[0x8000,435]},{offset:1,name:'CopyVar',params:[0x8001,0x8000]},{offset:2,name:'MenuInitStdGmm',params:[]},{offset:3,name:'MenuItemAdd',params:[53]},{offset:4,name:'CallStd',params:[2000]},{offset:5,name:'MsgBoxExtern',params:[0x8001,7]}];
 const graph={roots:[0],instructions:rows,edges:rows.slice(0,-1).map((r,i)=>({from:i,to:i+1,kind:'next'}))},s=analyzeScriptState(graph,556);
 assert.equal(s.operand(3,0x8001).value,435);assert.equal(s.at(3).menuBank.value,191);assert.equal(s.operand(5,0x8001).kind,'unknown');
});
test('joining different variable/menu values cannot invent a single dialogue reference',()=>{
 const g={roots:[0,1],instructions:[{offset:0,name:'SetVar',params:[0x8000,1]},{offset:1,name:'SetVar',params:[0x8000,2]},{offset:2,name:'NPCMsgVar',params:[0x8000]}],edges:[{from:0,to:2,kind:'next'},{from:1,to:2,kind:'next'}]};
 assert.equal(analyzeScriptState(g,556).operand(2,0x8000).kind,'unknown');
});
test('comparison metadata keeps flag checks distinct from variable values',()=>{
 const g={roots:[0],instructions:[{offset:0,name:'CheckFlag',params:[709]},{offset:1,name:'GoToIf',params:[1]}],edges:[{from:0,to:1,kind:'next'}]};
 assert.deepEqual(analyzeScriptState(g,556).at(1).comparison,{kind:'flag-set',flag:709,producer:0});
});
test('Nitro palette pixels preserve RGB channels, transparency and packed index order',()=>{
 const palette={colors:[0,31,31<<5,31<<10]},texture={width:8,height:8,format:3,pixels:Buffer.alloc(32,0x21),transparent:true};
 const r=renderTexture(texture,palette);assert.deepEqual([...r.rgba.subarray(0,8)],[255,0,0,255,0,255,0,255]);texture.pixels[0]=0x30;assert.deepEqual([...renderTexture(texture,palette).rgba.subarray(0,8)],[0,0,0,0,0,0,255,255]);
 assert.throws(()=>renderTexture({...texture,pixels:Buffer.alloc(1)},palette),{code:'INVALID'});
 const mid=renderTexture({...texture,pixels:Buffer.alloc(32,0x11)},{colors:[0,4|(8<<5)|(16<<10)]});assert.deepEqual([...mid.rgba.subarray(0,4)],[33,66,132,255]);
});
function tinyBTX(){
 const dictionary=(width,name,data)=>{const b=Buffer.alloc(16+4+width+16);b[1]=1;b.writeUInt16LE(b.length,2);b.writeUInt16LE(8,4);b.writeUInt16LE(16,6);b.writeUInt32LE(383,8);b.writeUInt16LE(width,16);b.writeUInt16LE(4+width,18);data.copy(b,20);b.write(name,20+width);return b;};
 const tex=Buffer.alloc(8);tex.writeUInt16LE((3<<10)|8192,2);const td=dictionary(8,'synthetic',tex),pd=dictionary(4,'synthetic',Buffer.alloc(4)),section=Buffer.alloc(60+td.length+pd.length+32+8);
 section.write('TEX0');section.writeUInt32LE(section.length,4);section.writeUInt16LE(4,12);section.writeUInt16LE(60,14);section.writeUInt32LE(60+td.length+pd.length,20);section.writeUInt16LE(1,48);section.writeUInt32LE(60+td.length,52);section.writeUInt32LE(section.length-8,56);td.copy(section,60);pd.copy(section,60+td.length);section.writeUInt16LE(31,section.length-6);section.fill(0x11,section.length-40,section.length-8);
 const b=Buffer.alloc(20+section.length);b.write('BTX0');b.writeUInt16LE(0xfeff,4);b.writeUInt16LE(1,6);b.writeUInt32LE(b.length,8);b.writeUInt16LE(16,12);b.writeUInt16LE(1,14);b.writeUInt32LE(20,16);section.copy(b,20);return b;
}
test('BTX dictionaries/source spans decode, while corrupt ranges and duplicate format assumptions fail',()=>{
 const b=tinyBTX(),parsed=readBTX(b);assert.equal(parsed.textures[0].name,'synthetic');assert.equal(parsed.palettes[0].colors[1],31);assert.equal(renderTexture(parsed.textures[0],parsed.palettes[0]).rgba[0],255);
 b.writeUInt32LE(0xffffffff,40);assert.throws(()=>readBTX(b),{code:'BOUNDS'});
});
test('PNG output is independently inflated to the exact RGBA scanline bytes',()=>{
 const image={width:1,height:1,rgba:Buffer.from([10,20,30,40])},png=encodePNG(image);let at=8,compressed=[];
 while(at<png.length){const n=png.readUInt32BE(at),type=png.toString('ascii',at+4,at+8);if(type==='IDAT')compressed.push(png.subarray(at+8,at+8+n));at+=12+n;}
 assert.deepEqual(inflateSync(Buffer.concat(compressed)),Buffer.from([0,10,20,30,40]));
});
test('extraction integrity rejects omitted message dependencies and changed content',()=>{
 const x={format:'ROMDexMapExtraction/1',source:{sha256:'a'},identities:{sourceSHA256:'a'},testbed:{headerIds:[73]},areas:[{}],messages:[{key:'1/0'}],flows:[{instructions:[{messageReferences:[{message:'1/0'}]}]}]};x.digest=extractionDigest(x);validateExtraction(x);
 x.messages=[];assert.throws(()=>validateExtraction(x),{code:'INTEGRITY'});x.digest=extractionDigest(x);assert.throws(()=>validateExtraction(x),{code:'INVALID_REFERENCE'});
});
