"""Repair the supplied recovery HTML while preserving all stored record values.
Usage: python scripts/repair-po-she-cockpit.py recovery.html [she-backup.json]
"""
from pathlib import Path
import re,json,gzip,base64,sys,hashlib,subprocess,tempfile
ROOT=Path(__file__).resolve().parent.parent
src=Path(sys.argv[1]);html=src.read_text();original=html
NEWDB='gcn-po-she-repaired-v1';PREFIX='gcnPoSheRepair.'
def once(s,a,b):
 assert s.count(a)==1,(a[:80],s.count(a));return s.replace(a,b,1)
def body(s,id):return re.search(r'<script\b[^>]*\bid="'+re.escape(id)+r'"[^>]*>(.*?)</script>',s,re.S)[1]
def put(s,id,v):
 rx=r'(<script\b[^>]*\bid="'+re.escape(id)+r'"[^>]*>)(.*?)(</script>)';return re.sub(rx,lambda m:m[1]+v+m[3],s,count=1,flags=re.S)
def key(k):
 if k.startswith('fy27r640.'):return PREFIX+k[len('fy27r640.'):]
 if k.startswith('fy27c.she'):return PREFIX+k[len('fy27c.'):]
 return k
oldmeta=json.loads(body(html,'liveSnapMeta'));raw=gzip.decompress(base64.b64decode(body(html,'liveSnapData')));records=[json.loads(l) for l in raw.splitlines() if l]
# Preserve all values; change only the browser workspace identifiers.
for o in records:
 if o['t']=='h':o['app']=NEWDB
 if o['t']=='ls':o['k']=key(o['k'])
 if o['t']=='db':o['name']=NEWDB
 if o['t'] in ['rows','se']:o['db']=NEWDB
sheIncluded=False
if len(sys.argv)>2:
 extra=json.loads(Path(sys.argv[2]).read_text());assert extra['kind']=='cockpit-she-local-backup' and extra['version']==1
 for k,v in extra['storage'].items():
  assert k in ['fy27c.she','fy27c.sheCfg','fy27c.sheManual','fy27c.sheRisks','fy27c.sheState']
  if v is not None:assert isinstance(v,str);json.loads(v);records.insert(1,{'t':'ls','k':key(k),'v':v})
 sheIncluded=True
payload='\n'.join(json.dumps(o,separators=(',',':'),ensure_ascii=False) for o in records)+'\n';gz=gzip.compress(payload.encode(),mtime=0);encoded=base64.b64encode(gz).decode()
with tempfile.NamedTemporaryFile(mode='w',suffix='.ndjson',encoding='utf-8') as tmp:
 tmp.write(payload);tmp.flush();hashes=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/po-she/snapshot-hashes.cjs'),tmp.name],text=True))
meta={**oldmeta,'app':NEWDB,'parts':hashes['parts'],'hash':hashes['hash'],'dataLen':len(encoded),'packedBytes':len(gz),'tool':'po-she-safe-save-v1','repair':{'isolatedWorkspace':True,'sheSupplementIncluded':sheIncluded,'sourceSavedAt':oldmeta['savedAt']}}
# Remap identifiers in executable code only, preserving embedded seeds and records.
def edit(m):
 attrs,s=m.groups()
 if 'type="application/' in attrs:return m[0]
 s=s.replace('fy27-labour-cockpit-cost-review-v640',NEWDB).replace('fy27r640.',PREFIX).replace('fy27c.she',PREFIX+'she')
 return '<script'+attrs+'>'+s+'</script>'
html=re.sub(r'<script\b([^>]*)>(.*?)</script>',edit,html,flags=re.S)
ls=body(html,'liveSaveModule')
# Validate the full stream and restore atomically without deleteDatabase.
a=ls.index('async function applyStream(lineSource){');b=ls.index('/* read the embedded base64',a);ls=ls[:a]+(ROOT/'scripts/po-she/restore.js').read_text()+'\n'+ls[b:]
# Install in-memory template capture before the asynchronous restore begins.
idx=ls.index("var NS='liveSave:");ls=ls[:idx]+(ROOT/'scripts/po-she/source-capture.js').read_text()+'\n'+(ROOT/'scripts/po-she/she-backup-import.js').read_text()+'\n'+ls[idx:]
a=ls.index('async function save(o){');b=ls.index('function schedule(ms)',a);ls=ls[:a]+(ROOT/'scripts/po-she/save.js').read_text()+'\n'+ls[b:]
ls=once(ls,"var ov=document.createElement('div');", "var ov=document.createElement('div');ov.id='cockpit-restore-overlay';")
ls=ls.replace('d.auto=false;return d;})();','return d;})();')
ls=ls.replace("fileBase\": \"Cockpit_Cost_PO_OpenAI_v6_5_1\"", "fileBase\": \"GC_NH_Cockpit_PO_SHE\"")
ls=ls.replace("else if(CONFLICT){st=", "else if(SAVE_FAILED){st='Save failed — download a copy';cls='bad';}\n  else if(CONFLICT){st=")
ls=ls.replace("else if(REAL_DIRTY){st='Unsaved changes';cls='dirty';}", "else if(REAL_DIRTY){st=LAST_BROWSER_SAVE?'Browser saved · HTML copy needs saving':'HTML copy needs saving';cls='dirty';}")
ls=ls.replace('Saved inside this HTML file','Saving & backups').replace('Auto-save after changes','Browser autosave every 30 seconds').replace('Save as new copy…','Download copy').replace('Link / change file…','Link optional file…')
ls=ls.replace("document.getElementById('lsvCopy').onclick=function(){save({copy:true});};", "document.getElementById('lsvCopy').onclick=function(){if(SAVE_FAILED&&PENDING_COPY){downloadPending();return;}save({copy:true});};")
ls=ls.replace("if(OPTS.auto&&FILE_HANDLE&&FILE_PERM==='granted'&&!CONFLICT){save({auto:true});return;}", "/* Changes are checked here; periodic saves use the 30-second timer. */")
ls=ls.replace("if(REAL_DIRTY&&!SAVING&&!(FILE_HANDLE&&FILE_PERM==='granted'&&OPTS.auto))", "if(REAL_DIRTY||SAVE_FAILED||SAVING||DIRTY)")
ls=ls.replace("First time on each PC: press <b>Save</b>, pick this dashboard file in the shared folder and allow editing. After that Save / Ctrl+S / auto-save update the file directly and the next user just opens it.", "Save or Download copy creates a complete HTML without reading the old file. Keep copies outside OneDrive. Browser autosave runs every 30 seconds. Linking a file is optional; linked updates also start a previous-version backup download.")
ls=once(ls,"window.LiveHtmlSave={save:save,status:", "setInterval(async function(){if(SAVING||!OPTS.auto)return;try{await browserCheckpoint();await refreshParts(false);if(REAL_DIRTY&&FILE_HANDLE&&FILE_PERM==='granted'&&!CONFLICT)await save({auto:true});}catch(e){SAVE_FAILED=true;REAL_DIRTY=true;note(h(e.message),'bad');}paint();},30000);\nwindow.LiveHtmlSave={save:save,downloadCopy:()=>save({copy:true}),scope:CFG,status:")
# Progress on every block, not just every 25 blocks (the real backup has only 14).
ls=ls.replace("if(n%25===0&&prog)prog.textContent=n+' blocks loaded'", "if(prog)prog.textContent='Reading backup: '+n+' blocks'")
ls=once(ls,"document.getElementById('lsvCopy').onclick=", """var sheImport=document.createElement('button');sheImport.type='button';sheImport.className='lsv-b';sheImport.textContent='Import SHE backup';sheImport.onclick=importSheBackup;document.getElementById('lsvPanel').appendChild(sheImport);
  if(META.repair&&!META.repair.sheSupplementIncluded){var notice=document.createElement('p');notice.id='she-recovery-needed';notice.textContent='The original SHE manual entries/settings need their separate backup. Use Import SHE backup after exporting it from the original working tab.';document.getElementById('lsvPanel').appendChild(notice);}
  document.getElementById('lsvCopy').onclick=""")
# Propagate storage failures to the save checkpoint instead of silently reporting success.
old="""async function persist(what) {
  if (!what || what === 'store') await DB.set('store', APP.store);
  if (!what || what === 'actions') { await DB.set('actions', APP.actions); saveLocal('actions', APP.actions); }
  if (!what || what === 'settings') { saveApiKey(); const s = settingsForSave(); saveLocal('settings', s); await DB.set('settings', s); }
  if (!what || what === 'state') saveLocal('state', { layers: APP.state.layers, basis: APP.state.basis, unit: APP.state.unit, fy: APP.state.fy, range: APP.state.range, tab: APP.state.tab });
}"""
new="""async function persist(what) {
  let ok=true;
  if (!what || what === 'store') ok=(await DB.set('store', APP.store)) && ok;
  if (!what || what === 'actions') { ok=(await DB.set('actions', APP.actions)) && ok; ok=saveLocal('actions', APP.actions) && ok; }
  if (!what || what === 'settings') { saveApiKey(); const s = settingsForSave(); ok=saveLocal('settings', s) && ok; ok=(await DB.set('settings', s)) && ok; }
  if (!what || what === 'state') ok=saveLocal('state', { layers: APP.state.layers, basis: APP.state.basis, unit: APP.state.unit, fy: APP.state.fy, range: APP.state.range, tab: APP.state.tab }) && ok;
  return ok;
}"""
html=once(html,old,new)
html=once(html,"function saveLocal(k, v) { try { localStorage.setItem('"+PREFIX+"' + k, JSON.stringify(v)); } catch (e) { } }", "function saveLocal(k, v) { try { localStorage.setItem('"+PREFIX+"' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }")
# A recovered DOM already contains responsive controls. Recreate one live set.
rsp=body(html,'cost-review-responsive')
rsp=once(rsp,"if (!header || !row) return null;", """if (!header || !row) return null;
    header.querySelectorAll('.rsp-panel').forEach(function(p){Array.from(p.children).forEach(function(ch){header.appendChild(ch);});p.remove();});
    header.querySelectorAll('.rsp-mobile-nav,.rsp-quick-filters').forEach(function(n){n.remove();});""")
html=put(html,'cost-review-responsive',rsp)
html=put(html,'liveSaveModule',ls)
sheCode=body(html,'she-script');sheCode=once(sheCode,'return { pulseCard, placeOnTower, view,','return { reloadLocal: fresh, pulseCard, placeOnTower, view,');html=put(html,'she-script',sheCode)
html=put(html,'liveSnapMeta',json.dumps(meta,separators=(',',':')).replace('<','\\u003c'))
html=put(html,'liveSnapData',encoded)
# Seed hashes prove no financial, PO, SHE, quality or other embedded datasets changed.
for m in re.finditer(r'<script\b([^>]*)>(.*?)</script>',original,re.S):
 id=re.search(r'\bid="([^"]+)"',m[1])
 if id and 'type="application/' in m[1] and id[1] not in ['liveSnapMeta','liveSnapData']:
  assert body(html,id[1])==m[2],id[1]
html=html.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta name="cockpit-safe-save" content="po-she-v1">',1)
dest=ROOT/'GC_NH_Cockpit_PO_SHE_Repaired.html';dest.write_text(html)
(ROOT/'scripts/po-she/last-build.json').write_text(json.dumps({'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'rowsUnchanged':True,'seedScriptsUnchanged':True,'isolatedWorkspace':True,'sheSupplementIncluded':sheIncluded},indent=2))
print((ROOT/'scripts/po-she/last-build.json').read_text())
