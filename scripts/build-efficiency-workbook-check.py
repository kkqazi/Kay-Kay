"""Build a code-only local inspection helper; no workbook contents are bundled."""
from pathlib import Path
import re
import zipfile

root=Path(__file__).resolve().parent.parent
helper=(root/'Efficiency_Local_Export_Helper.html').read_text()
library=re.search(r'<script id="xlsx-source" type="text/plain">([\s\S]*?)</script>',helper)[1]
worker=(root/'scripts/efficiency-workbook-check.js').read_text()
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Efficiency workbook check</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; worker-src blob:; style-src 'unsafe-inline'; connect-src 'none'">
<style>body{font:16px/1.6 system-ui;background:#f4f6f4;color:#17251c;margin:0;padding:24px}main{max-width:760px;margin:auto;background:white;padding:28px;border:1px solid #dce4dd;border-radius:12px}h1{font-size:26px}input{font:inherit;max-width:100%}a{display:inline-block;padding:12px 18px;border-radius:7px;background:#176340;color:white;text-decoration:none}[hidden]{display:none}#status{background:#eef3ee;padding:14px;white-space:pre-wrap}small{color:#516057}@media(max-width:600px){body{padding:10px}main{padding:18px}}</style></head>
<body><main><h1>Check your normal Efficiency workbook</h1><p>This is a one-time check to diagnose the XLSM reader. Continue to use your normal workbook for daily reporting.</p><ol><li>Choose your normal <b>Efficiency.xlsm</b> below.</li><li>Download the small inspection JSON.</li><li>Attach that JSON in our conversation.</li></ol><input id="file" type="file" accept=".xlsm,.xlsx,.xlsb,.xls" aria-label="Choose normal Efficiency workbook"><p id="status" role="status">No file chosen.</p><a id="download" hidden download="Efficiency_Workbook_Check.json">Download workbook inspection</a><p><small>Everything runs on your PC. The workbook and dashboard are not changed, macros do not run, and nothing is uploaded. The JSON contains worksheet names, headings, cell types and a few sample rows; it is not a production import.</small></p></main>
<script id="library" type="text/plain">LIBRARY</script><script id="worker" type="text/plain">WORKER</script>
<script>
'use strict';const $=id=>document.getElementById(id);let reader,url;
$('file').onchange=async()=>{const file=$('file').files[0];if(!file)return;reader?.terminate();if(url)URL.revokeObjectURL(url);$('download').hidden=true;$('file').disabled=true;$('status').textContent='Reading workbook headings locally. Keep this page open…';
 try{const bytes=await file.arrayBuffer(),workerURL=URL.createObjectURL(new Blob([$('library').textContent,'\\n',$('worker').textContent],{type:'text/javascript'}));reader=new Worker(workerURL);URL.revokeObjectURL(workerURL);
 reader.onmessage=e=>{reader.terminate();$('file').disabled=false;const report=e.data;url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));$('download').href=url;$('download').hidden=false;const primary=report.sheets.find(s=>s.name.trim().toLowerCase()==='efficiency');$('status').textContent=report.error?'Workbook reader reported: '+report.error+'. Download the inspection and send it back.':'Inspection ready: '+report.sheets.length+' worksheets. '+(primary?'Efficiency tab: '+(primary.shiftReadable?'production headings readable.':'production headings not recognised.'):'No worksheet named Efficiency.')+' Download the JSON and send it back.';};
 reader.onerror=e=>{reader.terminate();$('file').disabled=false;$('status').textContent='Workbook check failed: '+e.message;};reader.postMessage({bytes,source:{file:file.name,bytes:file.size,lastModified:new Date(file.lastModified).toISOString()}},[bytes]);
 }catch(error){$('file').disabled=false;$('status').textContent=error.message;}};
</script></body></html>'''
assert '</script' not in library.lower() and '</script' not in worker.lower()
html=html.replace('LIBRARY',library).replace('WORKER',worker)
(root/'Efficiency_Workbook_Check.html').write_text(html)
with zipfile.ZipFile(root/'Efficiency_Workbook_Check.zip','w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('Efficiency_Workbook_Check.html',html)
print('Built local workbook check:',len(html.encode()),'bytes')
