import fs from 'node:fs/promises';
const file='outputs/ROMDex/tests/application-profile.test.mjs';
let text=await fs.readFile(file,'utf8');
text=text.replace("wixTemplate:'<Directory Id=", "wixTemplate:'<Property Id=\"INSTALLPATH\"></Property><Directory Id=");
text=text.replace("assert(!creator.wixTemplate.includes('RemoveFolderEx'));", "assert(creator.wixTemplate.includes('Action=\"RestoreInstalledDirectory\"'));assert(creator.wixTemplate.includes('Value=\"[INSTALLPATH]\" After=\"AppSearch\"'));assert(!creator.wixTemplate.includes('RemoveFolderEx'));");
await fs.writeFile(file,text);
