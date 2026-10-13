"""Add screenshot-inspired Quality reporting to the repaired latest cockpit."""
from pathlib import Path
import re,json,hashlib
ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'GC_NH_Cockpit_PO_SHE_Repaired.html';s=src.read_text();orig=s
rx=r'(<script\b[^>]*\bid="quality-module"[^>]*>)(.*?)(</script>)'
m=re.search(rx,s,re.S);code=m[2]
needle="['overview', 'Overview'], ['house', 'Quality House']";assert code.count(needle)==1
code=code.replace(needle,"['overview', 'Overview'], ['review', 'Review & reports'], ['house', 'Quality House']")
needle='const W = winBar(main, c, v);';assert code.count(needle)==1
code=code.replace(needle,"""if(v==='review') { const nav=h('div',{class:'seg',style:'margin-bottom:16px;flex-wrap:wrap'});PILLS.forEach(([key,title])=>{const b=h('button',{class:key===v?'on':''},title);b.onclick=()=>{APP.state.qView=key;go(true);};nav.appendChild(b);});main.appendChild(nav);QualityReports.view(main);return; }
    const W = winBar(main, c, v);""")
s=s[:m.start()]+m[1]+code+m[3]+s[m.end():]
s=s.replace('</head>','<style id="quality-report-style">'+(ROOT/'scripts/quality/reports.css').read_text()+'</style>\n</head>',1)
idx=s.rindex('</body>');s=s[:idx]+'<script id="quality-reports">'+(ROOT/'scripts/quality/reports.js').read_text()+'</script>\n'+s[idx:]
# Use a helpful opening Quality page while keeping the uploaded snapshot unchanged.
s=s.replace("var outName='GC_NH_Cockpit_PO_SHE_'","var outName='GC_NH_Cockpit_Quality_PO_SHE_'")
s=re.sub(r'(?m)^[ \t]+$', '', s)
for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>',orig,re.S):
 id=re.search(r'\bid="([^"]+)"',m[1])
 if id and 'type="application/' in m[1]:
  after=re.search(r'<script\b[^>]*\bid="'+re.escape(id[1])+r'"[^>]*>(.*?)</script>',s,re.S)
  assert after[1]==m[2],id[1]
dest=ROOT/'GC_NH_Cockpit_Quality_PO_SHE_v6_7.html';dest.write_text(s)
print(json.dumps({'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'allSeedAndSnapshotValuesUnchanged':True},indent=2))
