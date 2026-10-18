import fs from 'node:fs/promises';await fs.writeFile('work/u20g/dispatch-proof.json',JSON.stringify({task:'U20G',at:new Date().toISOString(),pid:process.pid}));
