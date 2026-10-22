from pathlib import Path
p=Path('outputs/ROMDex/tests/rom-compilation.test.mjs');s=p.read_text();start=s.index('function fixture(){');end=s.index("\ntest('",start);function=s[start:end]
header="import {createIdentityManifest} from '../rom/identities.mjs';import {inventoryDigest} from '../rom/hgss.mjs';import {HGSS_ADAPTER} from '../rom/profiles.mjs';import {extractionDigest} from '../rom/extract.mjs';import {encodePNG} from '../rom/textures.mjs';import {sha} from '../content/contracts.mjs';\n"
Path('outputs/ROMDex/tests/rom-compilation-fixture.mjs').write_text(header+'export '+function+'\n')
p.write_text(s[:start]+"import {fixture} from './rom-compilation-fixture.mjs';\n"+s[end:])
