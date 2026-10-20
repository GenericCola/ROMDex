// Entirely synthetic Nintendo DS/NARC structures. No retail or user ROM bytes.
export function syntheticNarc(contents=[Buffer.from('synthetic event bytes'),Buffer.from('second')]){
 const count=contents.length,tableSize=12+count*8,nameSize=16,dataSize=8+contents.reduce((n,b)=>n+b.length,0),size=16+tableSize+nameSize+dataSize,b=Buffer.alloc(size);
 b.write('NARC');b.writeUInt16LE(0xfffe,4);b.writeUInt16LE(0x100,6);b.writeUInt32LE(size,8);b.writeUInt16LE(16,12);b.writeUInt16LE(3,14);
 b.write('BTAF',16);b.writeUInt32LE(tableSize,20);b.writeUInt16LE(count,24);let offset=0;const payload=16+tableSize+nameSize+8;
 contents.forEach((value,i)=>{b.writeUInt32LE(offset,28+i*8);offset+=value.length;b.writeUInt32LE(offset,32+i*8);value.copy(b,payload+offset-value.length);});
 const names=16+tableSize;b.write('BTNF',names);b.writeUInt32LE(nameSize,names+4);b.writeUInt32LE(4,names+8);b.writeUInt16LE(1,names+14);const gmif=names+nameSize;b.write('GMIF',gmif);b.writeUInt32LE(dataSize,gmif+4);return b;
}
export function syntheticRom({narc=syntheticNarc(),gameCode='IPKE'}={}){
 const b=Buffer.alloc(0x4000);b.write('SYNTHETIC');b.write(gameCode,12);b.write('01',16);
 for(const [at,values]of [[32,[0x200,0x02000000,0x02000000,0x100]],[48,[0x400,0x02380000,0x02380000,32]]])values.forEach((v,i)=>b.writeUInt32LE(v,at+i*4));
 b.writeUInt32LE(0x1000,64);b.writeUInt32LE(19,68);b.writeUInt32LE(0x1100,72);b.writeUInt32LE(16,76);b.writeUInt32LE(0x1200,80);b.writeUInt32LE(64,84);
 b.writeUInt32LE(8,0x1000);b.writeUInt16LE(1,0x1004);b.writeUInt16LE(1,0x1006);b[0x1008]=9;b.write('test.narc',0x1009);
 b.writeUInt32LE(0x1800,0x1100);b.writeUInt32LE(0x1820,0x1104);b.writeUInt32LE(0x1900,0x1108);b.writeUInt32LE(0x1900+narc.length,0x110c);narc.copy(b,0x1900);
 for(let i=0;i<2;i++){const at=0x1200+i*32;b.writeUInt32LE(i===0?1:131,at);b.writeUInt32LE(0x023c8000,at+4);b.writeUInt32LE(32,at+8);b.writeUInt32LE(0,at+24);}
 return b;
}
