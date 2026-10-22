from pathlib import Path
p=Path('outputs/ROMDex/public/shared-ui/web-timeline.css');s=p.read_text(encoding='utf-8-sig');s=s.split('/* Scope the original button defaults')[0];prefix='''/* The web button defaults keep their original type-selector specificity. */
:where(.timeline) button{font:inherit;color:var(--ink);border:1px solid var(--line);background:var(--screen-light);padding:8px 12px;border-radius:6px;cursor:pointer}
:where(.timeline) button[aria-pressed=true]{background:var(--yellow);color:#20291e;border-color:var(--yellow)}
:where(.timeline) button:hover{filter:brightness(1.17)}:where(.timeline) button:disabled{opacity:.4;cursor:default}
''';s=prefix+s+'''/* Preserve the separately approved human-testing status. */
.timeline-light.amber::after{background:#f6cd61;animation:content-amber-blink 1.2s steps(1,end) infinite!important}
@keyframes content-amber-blink{0%{background:#f6cd61}50%,100%{background:#8d4d17}}
@media(prefers-reduced-motion:reduce){.timeline-light.amber::after{animation:none!important}}
''';p.write_text(s,encoding='utf-8',newline='\n')
p=Path('outputs/ROMDex/public/mapdex-layout.mjs');s=p.read_text(encoding='utf-8-sig').replace("all.id='mapdex-all-content'", "all.id='conditional'").replace("all=node('button','All Content','suite-button')", "all=node('button','Other Conditions')");p.write_text(s,encoding='utf-8',newline='\n')
