const fs=require('fs');const f='outputs/npcdex-template.html';let html=fs.readFileSync(f,'utf8');
// Keep the frame outside the scrollable body, so native scrollbar ends cannot clip it.
html=html.replace(/<dialog\b([^>]*)>([\s\S]*?)<\/dialog>/g,(_,attributes,body)=>'<dialog'+attributes+'><div class="dialog-scroll">'+body+'</div></dialog>');
html=html.replace('</style>',`dialog{padding:0;overflow:hidden}
.dialog-scroll{padding:20px;max-height:calc(85dvh - 10px);overflow:auto;border-radius:7px;scrollbar-gutter:stable;clip-path:inset(0 round 7px)}
.dialog-scroll::-webkit-scrollbar{width:10px;height:10px}
.dialog-scroll::-webkit-scrollbar-track{background:transparent;margin-block:8px}
.dialog-scroll::-webkit-scrollbar-thumb{background:var(--line);border:2px solid var(--screen);border-radius:8px}
.dialog-scroll::-webkit-scrollbar-button{display:none;width:0;height:0}
.dialog-scroll{scrollbar-color:var(--line) var(--screen)}
.review-category,.review-town{border:1px solid var(--line);border-radius:6px;margin:10px 0;padding:0}
.review-category>summary,.review-town>summary{padding:10px 12px;font-size:12px;font-weight:650}
.review-category>summary{color:var(--yellow)}
.review-count{color:var(--muted);font-weight:400;margin-left:8px}
.review-category-body,.review-town-body{padding:0 10px 10px}
.review-empty{padding:8px 0;color:var(--muted);font-size:12px}
.review-item{overflow-wrap:anywhere}
</style>`);fs.writeFileSync(f,html);
