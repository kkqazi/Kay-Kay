"""Add agency estimates to a Phase 2 cockpit without changing embedded source blocks."""
from pathlib import Path
import argparse,json,re
root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('--cockpit',required=True);p.add_argument('--agency',default=str(root/'Agency_Allocations_Provisional.html'));p.add_argument('--output',default=str(root/'GC_NH_Cockpit_Daily_Labour_Phase2.html'));a=p.parse_args()
s=Path(a.cockpit).read_text();assert 'id="daily-efficiency-engine"' in s;assert 'id="daily-agency-engine"' not in s
raw=json.loads(re.search(r'<script id="agency-data" type="application/json">(.*?)</script>',Path(a.agency).read_text(),re.S)[1]);files=[]
for src in raw['sources']:
 people=[]
 for person in raw['people']:
  rows=[r for r in person['sourceRows'] if r['agency']==src['agency']]
  if rows:people.append({'date':person['date'],'sourceRows':rows})
 files.append({'meta':{'id':'agency-'+src['sha256'],'agency':src['agency'],'file':src['filename'],'sha256':src['sha256'],'printedDateCells':src['printedDateCells']},'people':people})
def blocks(t):
 return {re.search(r'\bid=["\']([^"\']+)',m[1])[1]:m[0] for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script\s*>',t,re.I) if re.search(r'\btype=["\']application/',m[1],re.I) and re.search(r'\bid=',m[1])}
before=blocks(s);seed=json.dumps({'files':files},separators=(',',':')).replace('<','\\u003c');engine=(root/'scripts/daily-labour/agency.js').read_text();module=(root/'scripts/daily-labour/module-agency.js').read_text();assert '</script' not in engine.lower()+module.lower()
addition='<script id="daily-agency-seed" type="application/json">'+seed+'</script>\n<script id="daily-agency-engine">'+engine+'</script>\n<script id="daily-labour-module">'+module+'</script>'
s,n=re.subn(r'<script id="daily-labour-module">[\s\S]*?</script>',lambda m:addition,s);assert n==1;after=blocks(s);assert all(after[k]==v for k,v in before.items())
Path(a.output).write_text(s);print('Agency integrated;',len(before),'original data blocks preserved;',len(s.encode()),'bytes')
