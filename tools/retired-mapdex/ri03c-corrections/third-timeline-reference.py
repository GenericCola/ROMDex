from pathlib import Path
s=Path('outputs/ROMDex/public/addons/npcdex/workspace.js').read_text(encoding='utf-8-sig')
a=s.index('function timelinePromptRecords');b=s.index('function render()',a);print(s[a:b])
s=Path('outputs/ROMDex/content/workspace-runtime.js').read_text(encoding='utf-8-sig');a=s.index('function timelinePromptRecords');b=s.index('function render()',a);print('\nCURRENT\n'+s[a:b])
s=Path('outputs/ROMDex/public/addons/npcdex/index.html').read_text(encoding='utf-8-sig');a=s.index('<section class="timeline"');print(s[a:a+950])
