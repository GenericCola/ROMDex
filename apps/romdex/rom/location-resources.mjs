import {requireRom,sha256} from './reader.mjs';
import {validateInventory} from './hgss.mjs';
import {makeLocator} from './locators.mjs';

export const LOCATION_PATHS=Object.freeze({matrices:'a/0/4/1',areas:'a/0/4/2',land:'a/0/6/5',terrainTextures:'a/0/4/4',buildingSets:'a/0/4/3',buildingTextures:'a/0/7/0',exteriorModels:'a/0/4/0',interiorModels:'a/1/4/8'});
const span=(b,o,n)=>requireRom(Number.isSafeInteger(o)&&Number.isSafeInteger(n)&&o>=0&&n>=0&&o+n<=b.length,'BOUNDS','Location Resource Range Is Outside Its Source.');
export function decodeLocationMatrix(b){
 span(b,0,5);const width=b[0],height=b[1],hasHeaders=b[2],hasHeights=b[3],count=width*height;requireRom(width&&height&&count<=16384&&hasHeaders<=1&&hasHeights<=1,'INVALID','Unsupported Location Matrix Dimensions or Layers.');
 let at=5+b[4];span(b,5,b[4]);const name=b.toString('utf8',5,at),headers=hasHeaders?Array.from({length:count},(_,i)=>{span(b,at+i*2,2);return b.readUInt16LE(at+i*2);}):null;at+=hasHeaders?count*2:0;
 const heights=hasHeights?Array.from({length:count},(_,i)=>{span(b,at+i,1);return b[at+i];}):Array(count).fill(0);at+=hasHeights?count:0;
 span(b,at,count*2);const cells=Array.from({length:count},(_,i)=>({x:i%width,z:Math.floor(i/width),headerId:headers?.[i]??null,altitude:heights[i],landId:b.readUInt16LE(at+i*2)}));requireRom(at+count*2===b.length,'INVALID','Location Matrix Has Unexplained Trailing Data.');return {width,height,name,hasHeaders:!!hasHeaders,cells};
}
export function decodeLocationArea(b){requireRom(b.length===8,'INVALID','Location Area Data Must Contain Eight Bytes.');const type=b[6];requireRom(type===0||type===1,'UNSUPPORTED','Unknown Location Building Resource Type.');return {buildingSet:b.readUInt16LE(0),terrainTexture:b.readUInt16LE(2),dynamicTexture:b.readUInt16LE(4),type,light:b[7]};}
export function decodeLocationLand(b){
 span(b,0,20);requireRom(b.readUInt16LE(16)===0x1234,'UNSUPPORTED','Unsupported HGSS Land Sound Header.');const permissions=b.readUInt32LE(0),buildingBytes=b.readUInt32LE(4),modelBytes=b.readUInt32LE(8),terrainBytes=b.readUInt32LE(12),soundBytes=b.readUInt16LE(18),buildingsAt=20+soundBytes+permissions,modelAt=buildingsAt+buildingBytes;
 requireRom(permissions===2048&&buildingBytes%48===0&&buildingBytes/48<=4096,'INVALID','Invalid Location Permission or Building Section.');span(b,modelAt,modelBytes+terrainBytes);requireRom(modelAt+modelBytes+terrainBytes===b.length,'INVALID','Unexplained Land Resource Trailing Data.');const model=b.subarray(modelAt,modelAt+modelBytes);requireRom(model.toString('ascii',0,4)==='BMD0','UNSUPPORTED','Location Terrain Has No Supported Nitro Model.');
 const buildings=Array.from({length:buildingBytes/48},(_,i)=>{const at=buildingsAt+i*48;return {index:i,modelId:b.readUInt32LE(at),positionRaw:[4,8,12].map(n=>b.readInt32LE(at+n)),rotationRaw:[16,20,24].map(n=>b.readInt32LE(at+n)),scaleRaw:[28,32,36].map(n=>b.readInt32LE(at+n))};});return {model,modelAt,modelBytes,buildings,permissionsAt:20+soundBytes,permissions:b.subarray(20+soundBytes,buildingsAt),terrainAt:modelAt+modelBytes,terrainBytes};
}

export async function readLocationScene(rom,inventory,headerId,{maxCells=64,check=()=>rom.check()}={}){
 validateInventory(inventory);requireRom((await rom.fingerprint()).sha256===inventory.source.sha256,'SOURCE_CHANGED','Location Resources Belong to Another ROM.');const header=inventory.maps.find(m=>m.headerId===headerId);requireRom(header,'NOT_FOUND','Select a Valid Source Area.');
 const resources=new Map(),dependencies=[];
 async function member(kind,id){check();const path=LOCATION_PATHS[kind],key=path+':'+id;if(resources.has(key))return resources.get(key);const bytes=await rom.member(path,id),locator=await makeLocator(rom,{kind:'asset',fileId:rom.fileInfo(path).fileId,memberId:id,bytes:bytes.length,selectors:{locationResource:kind}}),r={key,kind,id,bytes,sha256:sha256(bytes),locator};resources.set(key,r);dependencies.push({kind,path,memberId:id,sha256:r.sha256,locator});return r;}
 const area=decodeLocationArea((await member('areas',header.areaDataBank)).bytes),matrix=decodeLocationMatrix((await member('matrices',header.matrixId)).bytes),selected=matrix.cells.filter(c=>c.landId!==0xffff&&(!matrix.hasHeaders||c.headerId===headerId));
 requireRom(selected.length>0&&selected.length<=maxCells,'UNSUPPORTED','This Source Area Has No Bounded Matrix Selection.');const terrainTexture=await member('terrainTextures',area.terrainTexture),buildingTexture=await member('buildingTextures',area.buildingSet);await member('buildingSets',area.buildingSet);
 const cells=[];let buildingCount=0,sourceBytes=0;for(const cell of selected){check();const land=await member('land',cell.landId),data=decodeLocationLand(land.bytes),buildings=[];sourceBytes+=land.bytes.length;for(const b of data.buildings){requireRom(++buildingCount<=8192,'LIMIT','Location Building Count Exceeds Its Budget.');const resource=await member(area.type?'exteriorModels':'interiorModels',b.modelId);sourceBytes+=resource.bytes.length;requireRom(sourceBytes<=128*1024*1024&&resources.size<=2048,'LIMIT','Location Resources Exceed Their Budget.');buildings.push({...b,resource});}cells.push({...cell,...data,resource:land,buildings});}
 await rom.assertUnchanged();return {schema:'ROMDexLocationScene/1',sourceRomSha256:inventory.source.sha256,header,area,matrix,cells,terrainTexture,buildingTexture,dependencies};
}

export function locationEventCoordinates(scene,event){
 const x=event.x,z=event.y,cell=scene.cells.find(c=>Math.floor(x/32)===c.x&&Math.floor(z/32)===c.z);if(!cell)return {status:'unresolved',reason:'Event coordinates are outside this source area’s selected matrix cells.'};
 const heightRaw=event.z??event.height??0;
 if(heightRaw!==0)return {status:'unresolved',reason:'Nonzero event height requires terrain-height confirmation.',sourceTile:[x,z],heightRaw};
 return {status:'documented',sourceTile:[x,z],matrixCell:[cell.x,cell.z],world:[x*16-248,cell.altitude*8,z*16-248],conversion:'16 world units per tile; cell center origin at -256; half-tile center offset +8; source zero event height'};
}
