"""Build a local-file commentary updater with the current product/Quality corrections."""
from pathlib import Path
import zipfile
r=Path(__file__).resolve().parent.parent
payloads={'product-register-payload':r/'scripts/product-register.js','bva-commentary-payload':r/'scripts/bva-commentary.js'}
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cockpit commentary updater</title><style>body{font:16px/1.6 system-ui,sans-serif;background:#f3f5f3;color:#17211c;margin:0;padding:24px}main{max-width:760px;margin:auto;background:white;border:1px solid #d8dfd9;border-radius:10px;padding:28px}h1{font-size:25px;margin-top:0}label{font-weight:650;display:block}input{font:inherit;max-width:100%}#status{background:#f3f5f3;padding:14px}a{display:inline-block;background:#17211c;color:white;padding:12px 16px;border-radius:7px;text-decoration:none}a[hidden]{display:none}.note{font-size:14px;color:#55615a}@media(max-width:600px){body{padding:12px}main{padding:18px}}</style></head><body><main><h1>Update your cockpit commentary</h1><p>Clear explanations of line performance, paid hours and the savings assumptions in your budget.</p><ol><li>Save your current cockpit first.</li><li>Select that latest saved HTML below.</li><li>Download the updated cockpit and open the new file.</li></ol><label for="source">Choose your saved cockpit HTML</label><input id="source" type="file" accept=".html,.htm"><p id="status" role="status" aria-live="polite">No file selected.</p><a id="download" hidden>Download updated cockpit</a><p class="note">The commentary uses your selected dates and available source figures. Detailed planning assumptions can be expanded in the dashboard.</p><p class="note">Everything runs on your PC. Nothing is uploaded. Your saved records, product amendments and original file are retained. This includes the latest Bang Bang Quality mapping correction.</p></main>'''
parts=[head]
for id,path in payloads.items():
 code=path.read_text();assert '</script' not in code.lower();parts.append('<script id="'+id+'" type="text/plain">'+code+'</script>')
for path in ['scripts/product-register-installer.js','scripts/bva-commentary-installer.js']:
 code=(r/path).read_text();assert '</script' not in code.lower();parts.append('<script>'+code+'</script>')
parts.append('''<script>(function(){'use strict';const input=document.getElementById('source'),status=document.getElementById('status'),download=document.getElementById('download');let url,request=0;
input.onchange=async()=>{const current=++request;download.hidden=true;try{const file=input.files[0];if(!file)return;status.textContent='Checking your saved cockpit…';const original=await file.text();if(current!==request)return;
let revised=installProductRegister(original,document.getElementById('product-register-payload').textContent);revised=patchBvaCommentary(revised,document.getElementById('bva-commentary-payload').textContent);
if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob([revised],{type:'text/html'}));download.href=url;download.download=file.name.replace(/\\.html?$/i,'')+'_Commentary_Updated.html';download.hidden=false;status.textContent='Ready. Download and open the updated cockpit. Your saved records are retained.';
}catch(error){if(current===request)status.textContent=error.message;}};})();</script></body></html>''')
(r/'Cockpit_Commentary_Updater.html').write_text(''.join(parts))
with zipfile.ZipFile(r/'Cockpit_Commentary_Updater.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['Cockpit_Commentary_Updater.html','Cockpit_Commentary_Updater_Guide.md']:z.write(r/name,name)
print('Built code-only commentary updater and ZIP')
