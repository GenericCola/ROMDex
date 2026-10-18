import fs from 'node:fs/promises';const file='outputs/ROMDex/public/index.html';await fs.writeFile(file,(await fs.readFile(file,'utf8')).replace('ROMDex 0.5.9 · NPCDex','ROMDex 0.5.10 · NPCDex'));
