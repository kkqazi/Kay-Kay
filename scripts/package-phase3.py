from pathlib import Path
import zipfile,hashlib
r=Path(__file__).resolve().parent.parent
files=['GC_NH_Cockpit_Daily_Labour_Phase3.html','Cockpit_Daily_Labour_Phase3_InPlace_Updater.html','Daily_Labour_Phase3_Guide.md','scripts/build-daily-labour-phase3.py','scripts/build-phase3-updater.py','scripts/package-phase3.py','scripts/daily-labour/official.js','scripts/daily-labour/module-phase3.js','scripts/daily-labour/engine.js','scripts/daily-labour/efficiency.js','scripts/daily-labour/agency.js','tests/daily-labour-phase3-engine.cjs','tests/daily-labour-phase3-browser.cjs','tests/phase3-upload.cjs','tests/Daily_Labour_Phase3_Source_Inspection.json','tests/Daily_Labour_Phase3_Independent_Verification.json','tests/Daily_Labour_Phase3_Engine_Verification.json','tests/Daily_Labour_Phase3_Browser_Verification.json','tests/Daily_Labour_Phase3_Upload_Verification.json']
p=r/'Daily_Labour_Phase3_Delivery.zip'
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in files:z.write(r/f,f)
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 for f in files:assert z.read(f)==(r/f).read_bytes()
(r/'Daily_Labour_Phase3_Delivery.zip.sha256').write_text(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n');print('PASS ZIP integrity and',len(files),'verified members;',p.stat().st_size,'bytes')
