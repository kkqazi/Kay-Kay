from pathlib import Path
import zipfile,hashlib
r=Path(__file__).resolve().parent.parent
files=['GC_NH_Cockpit_Daily_Labour_Phase2.html','Cockpit_Agency_Flash_InPlace_Updater.html','Agency_Flash_Cockpit_Guide.md','scripts/build-agency-cockpit.py','scripts/build-agency-updater.py','scripts/package-agency-flash.py','scripts/daily-labour/agency.js','scripts/daily-labour/module-agency.js','scripts/daily-labour/engine.js','scripts/daily-labour/efficiency.js','tests/agency-flash-engine.cjs','tests/agency-flash-browser.cjs','tests/Agency_Flash_Engine_Verification.json','tests/Agency_Flash_Browser_Verification.json']
p=r/'Cockpit_Agency_Flash_Delivery.zip'
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for f in files:z.write(r/f,f)
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 for f in files:assert z.read(f)==(r/f).read_bytes()
(r/'Cockpit_Agency_Flash_Delivery.zip.sha256').write_text(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name+'\n')
print('PASS ZIP integrity and',len(files),'verified members;',p.stat().st_size,'bytes')
