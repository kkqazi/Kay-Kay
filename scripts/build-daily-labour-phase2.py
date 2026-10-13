"""Upgrade the Phase 1 cockpit with inspected Efficiency output, preserving all prior data blocks.
Usage: python scripts/build-daily-labour-phase2.py --efficiency eff.xlsx
"""
from pathlib import Path
from openpyxl import load_workbook
from datetime import datetime,date,time,timezone
import argparse,json,hashlib,re,subprocess,tempfile
ROOT=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('--cockpit',default=str(ROOT/'GC_NH_Cockpit_Daily_Labour_Phase1.html'));p.add_argument('--efficiency',required=True);p.add_argument('--output',default=str(ROOT/'GC_NH_Cockpit_Daily_Labour_Phase2.html'));a=p.parse_args()
source=Path(a.cockpit).read_text();assert 'id="daily-labour-seed"' in source and 'id="daily-labour-module"' in source
assert 'id="daily-efficiency-engine"' not in source,'Input already has Phase 2'
file=Path(a.efficiency);sha=hashlib.sha256(file.read_bytes()).hexdigest()
wb=load_workbook(file,read_only=True,data_only=True)
def val(x):
 if isinstance(x,(datetime,date,time)):return x.isoformat()
 return x
sheets=[{'name':s.title,'date1904':wb.epoch.year==1904,'grid':[[val(v) for v in row] for row in s.values]} for s in wb]
with tempfile.TemporaryDirectory() as d:
 raw=Path(d)/'raw.json';raw.write_text(json.dumps(sheets));parsed=Path(d)/'parsed.json'
 script="const fs=require('fs'),EO=require(process.argv[1]);const s=JSON.parse(fs.readFileSync(process.argv[2]));fs.writeFileSync(process.argv[3],JSON.stringify(EO.parse(s,JSON.parse(process.argv[4]))));"
 meta={'id':'eff-'+sha,'file':file.name,'bytes':file.stat().st_size,'sha256':sha,'loadedAt':datetime.now(timezone.utc).isoformat(timespec='seconds')}
 subprocess.run(['node','-e',script,str(ROOT/'scripts/daily-labour/efficiency.js'),str(raw),str(parsed),json.dumps(meta)],check=True)
 parsed_obj=json.loads(parsed.read_text())
seed=json.dumps({'schema':2,'productionDate':'2026-10-13','file':parsed_obj},separators=(',',':')).replace('<','\\u003c')
def blocks(s):
 return {re.search(r'\bid=["\']([^"\']+)',m[1])[1]:m[0] for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script\s*>',s,re.I) if re.search(r'\btype=["\']application/',m[1],re.I) and re.search(r'\bid=',m[1])}
before=blocks(source)
pattern=r'(<script id="daily-labour-module">)[\s\S]*?(</script>)'
assert len(re.findall(pattern,source))==1
module=(ROOT/'scripts/daily-labour/module.js').read_text();engine=(ROOT/'scripts/daily-labour/efficiency.js').read_text();assert '</script' not in module.lower()+engine.lower()
source=re.sub(pattern,lambda m:m[1]+module+m[2],source,count=1)
addition='<script id="daily-efficiency-seed" type="application/json">'+seed+'</script>\n<script id="daily-efficiency-engine">'+engine+'</script>\n'
source=source.replace('<script id="daily-labour-module">',addition+'<script id="daily-labour-module">',1)
after=blocks(source);assert all(after.get(k)==v for k,v in before.items()),'An existing source data block changed'
assert len(re.findall(r'<script id="daily-efficiency-engine">',source))==1
Path(a.output).write_text(source)
print(json.dumps({'output':a.output,'bytes':len(source.encode()),'originalBlocksPreserved':len(before),'efficiencyRuns':len(parsed_obj['rows']),'sha256':hashlib.sha256(source.encode()).hexdigest()},indent=2))
