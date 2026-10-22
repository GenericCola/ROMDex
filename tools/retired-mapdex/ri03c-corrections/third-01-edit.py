from pathlib import Path
p=Path('outputs/ROMDex/public/shared-ui/tile-images.js');s=p.read_text(encoding='utf-8-sig')
s=s.replace("if(width*height>1048576)return box;const {x,y,width:w,height:h}=box;let transparent=false;for(let row=y;row<y+h&&!transparent;row++)for(let col=x;col<x+w;col++)if(data[(row*width+col)*4+3]<=8){transparent=true;break;}if(!transparent)return box;", "const {x,y,width:w,height:h}=box;let matte=false;const blank=i=>data[i+3]<=8||(data[i]<=8&&data[i+1]<=8&&data[i+2]<=8);for(let col=x;col<x+w&&!matte;col++)matte=blank((y*width+col)*4)||blank(((y+h-1)*width+col)*4);for(let row=y;row<y+h&&!matte;row++)matte=blank((row*width+x)*4)||blank((row*width+x+w-1)*4);if(!matte)return box;")
s=s.replace('return best&&area>=w*h*.2?best:box;','return best||box;')
s=s.replace('Opaque owner images\r\n// retain their chosen crop.','Border-connected black mattes are excluded as well. Owner images\n// retain their original bytes and saved crop.')
p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/shared-ui/location-preview.js');s=p.read_text(encoding='utf-8-sig')
a=s.index(' function applyCrop(value)');b=s.index('\n image.onload=',a)
s=s[:a]+''' function applyCrop(value){crop={...value};const w=image.naturalWidth||c.renderer?.settings?.camera?.width||768,h=image.naturalHeight||c.renderer?.settings?.camera?.height||640;let box={x:crop.x/SCALE*w,y:crop.y/SCALE*h,width:crop.width/SCALE*w,height:crop.height/SCALE*h};
 // A preview is a filled window into the location, not a letterboxed overview.
 // Crop only its display; saved percentages and source pixels remain unchanged.
 if(image.complete&&image.naturalWidth&&globalThis.romdexTileImages){try{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const data=context.getImageData(0,0,w,h).data,inside={x:Math.floor(box.x),y:Math.floor(box.y),width:Math.max(1,Math.min(w-Math.floor(box.x),Math.floor(box.width))),height:Math.max(1,Math.min(h-Math.floor(box.y),Math.floor(box.height)))};box=globalThis.romdexTileImages.filledBounds(data,w,h,inside);}catch{}}
 const ratio=1.5;if(box.width/box.height>ratio){const width=box.height*ratio;box.x+=(box.width-width)/2;box.width=width;}else{const height=box.width/ratio;box.y+=(box.height-height)/2;box.height=height;}
 frame.style.aspectRatio=String(ratio);frame.style.setProperty('--location-ratio',String(ratio));image.style.width=w/box.width*100+'%';image.style.left='0';image.style.top='0';image.style.transform='translate('+(-box.x/w*100)+'%, '+(-box.y/h*100)+'%)';for(const {source:m,node:b}of markers){const x=(m.x/SCALE*w-box.x)/box.width,y=(m.y/SCALE*h-box.y)/box.height;b.hidden=x<0||x>1||y<0||y>1;b.style.left=x*100+'%';b.style.top=y*100+'%';}}
''' +s[b:]
p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/shared-ui/npcdex-tiles.css');s=p.read_text(encoding='utf-8-sig');s+='\n/* A location is a cropped viewport; intrinsic source dimensions never add a matte. */\n.tile-select>.tile-picture{flex:none;min-height:0;object-fit:cover;object-position:center}\n';p.write_text(s,encoding='utf-8',newline='\n')
# Extract reference labels without embedding images.
s=Path('outputs/ROMDex/public/addons/npcdex/workspace.js').read_text(encoding='utf-8-sig').splitlines()
import json
for line in s:
 if line.startswith('const ORIGINAL='):
  d=json.loads(line[len('const ORIGINAL='):].rstrip(';'))
  for t in d['towns'][:2]:print(json.dumps({'town':t['name'],'locations':[{k:l.get(k) for k in ['id','name','areaIds','expandAreas','aliasOf']} for l in t['locations']],'areas':[{k:a.get(k) for k in ['id','name','code']} for a in t['areas']]},ensure_ascii=False))
  break
