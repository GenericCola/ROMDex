const fs=require('fs');let s=fs.readFileSync('work/npcdex-template.html','utf8');
s=s.replace('.device{height:100dvh;display:grid;', '.device{height:100dvh;display:grid;grid-template-columns:minmax(0,1fr);');
s=s.replace('.body-grid{display:grid;', '.body-grid{min-width:0;display:grid;');
s=s.replace('.workspace{min-height:0;', '.workspace{min-width:0;min-height:0;');
s=s.replace('.tile.selected{', '.tile-select[aria-pressed=true]{background:transparent;color:var(--ink);border-color:transparent}.tile.selected{');
s=s.replace('.header-right{width:100%;justify-content:space-between;align-items:end}', '.header-right{width:100%;min-width:0;flex-wrap:wrap;justify-content:space-between;align-items:end}.header-actions{margin-left:auto}');
s=s.replace("'Saved locally · export downloaded'", "'Saved locally · export generated'");
fs.writeFileSync('work/npcdex-template.html',s);
