"""Create an offline updater that changes only the OpenAI client in a user-selected cockpit."""
from pathlib import Path
import base64
r=Path(__file__).resolve().parent.parent
backup=base64.b64encode((r/'scripts/po-she/browser-backup.js').read_bytes()).decode()
client=base64.b64encode((r/'scripts/openai-client.js').read_bytes()).decode()
template='''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Update cockpit OpenAI and saving</title><style>body{font:16px/1.6 Arial,sans-serif;background:#f4f6f3;color:#21382a;margin:0;padding:24px}main{max-width:740px;margin:30px auto;background:white;padding:26px;border:1px solid #d9e2da;border-radius:14px}h1{font-size:24px;margin:0 0 14px}input{max-width:100%;margin:15px 0}button{padding:12px 18px;border:0;border-radius:7px;background:#196b46;color:white;font-weight:bold;cursor:pointer}button:disabled{opacity:.5}#status{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#5b6b60}</style></head><body><main><h1>Update OpenAI errors and saving</h1><p>First use <b>Save as copy</b> in your working cockpit to download its latest data. Keep that tab open. Choose the newly downloaded HTML below, then download the updated copy.</p><p>This updates OpenAI error details and makes linked-file saving clearer. Linked saves update one master file and keep two previous versions in browser storage instead of automatically downloading backups. It preserves the embedded records, complaints, classifications, PO/SHE entries and report settings. It does not change your API key, model permissions, billing or work-network policy.</p><label for="file">Choose your latest saved cockpit HTML</label><br><input id="file" type="file" accept=".html,.htm,text/html"><br><button id="update" disabled>Download updated cockpit</button><p id="status" role="status">No file selected.</p><small>Runs in your browser without uploading the HTML. No API call is made by this updater. Keep the original and updated files until you have checked the updated copy.</small></main><script>
'use strict';
const file=document.getElementById('file'),button=document.getElementById('update'),status=document.getElementById('status'),encoded='__CLIENT__',backupEncoded='__BACKUP__';
function patch(text){
 if(!/<meta\\b[^>]*name=["']cockpit-ai-provider["'][^>]*content=["']openai-v1["']/i.test(text))throw Error('Choose the saved OpenAI cockpit HTML, rather than this updater or an older Claude file.');
 const start=text.indexOf('const OpenAIClient='),end=text.indexOf('const KEYV = (function () {',start);
 if(start<0||end<0||text.indexOf('const OpenAIClient=',start+1)!==-1)throw Error('Cannot identify a unique supported OpenAI client. Keep your file and ask for a tailored update.');
 const old=text.slice(start,end);if(!old.includes('https://api.openai.com/v1/responses')||!old.trim().endsWith('})();'))throw Error('The OpenAI code boundary is not recognised. No file was changed.');
 const client=new TextDecoder().decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)));let updated=text.slice(0,start)+client+'\\n'+text.slice(end);
 let savingChanged=false;
 const once=(a,b)=>{const i=updated.indexOf(a);if(i<0||updated.indexOf(a,i+1)!==-1)throw Error('Cannot safely apply the saving update. No file was changed; keep your saved copy.');updated=updated.slice(0,i)+b+updated.slice(i+a.length);};
 if(updated.includes("tool:'po-she-safe-save-v1'")&&!updated.includes('async function retainLinkedBackup(')){
  const helper=new TextDecoder().decode(Uint8Array.from(atob(backupEncoded),c=>c.charCodeAt(0)));
  once('async function save(o){',helper+'\\nasync function save(o){');
  once("var previous=new Blob([await before.arrayBuffer()],{type:'text/html'});download(previous,'GC_NH_Cockpit_PREVIOUS_'+now.replace(/[:.]/g,'-')+'.html');", "var previous=new Blob([await before.arrayBuffer()],{type:'text/html'});await retainLinkedBackup(previous,{name:FILE_HANDLE.name,at:now,savedAt:layout.meta.savedAt});");
  once('File saved and checked. A previous-version backup download was also started; retain it outside OneDrive.', 'Master file updated and checked. The previous version is backed up in this browser; Download previous backup retrieves it.');
  once("var sv=document.getElementById('lsvSave');sv.disabled=SAVING;", "var sv=document.getElementById('lsvSave');sv.disabled=SAVING;sv.textContent=FILE_HANDLE?'Save to file':'Download copy';sv.title=FILE_HANDLE?'Update the linked master HTML file':'Not linked: downloads a new complete HTML. Use Link master file to update one file.';");
  once('Not linked yet — press <b>Save</b> and pick this HTML file in the shared folder.', 'Not linked — Download copy creates a new HTML. Use <b>Link master file</b> to select the saved local HTML you want to update.');
  once('Link optional file…', 'Link master file…');
  once("document.getElementById('lsvSave').onclick=function(){save();};", "document.getElementById('lsvSave').onclick=async function(){if(FILE_HANDLE&&FILE_PERM!=='granted'){if(await permission(true)!=='granted'){note('Allow editing to update the master file, or use Download copy.','warn');paint();return;}}save();};");
  once('Linking a file is optional; linked updates also start a previous-version backup download.', 'Link master file to update one HTML. Linked saves keep two previous versions in this browser; Download previous backup retrieves the latest. Keep an independent backup outside OneDrive.');
  once("document.getElementById('lsvCopy').onclick=", "var prevButton=document.createElement('button');prevButton.type='button';prevButton.className='lsv-b';prevButton.textContent='Download previous backup';prevButton.onclick=downloadPrevious;document.getElementById('lsvPanel').appendChild(prevButton);document.getElementById('lsvCopy').onclick=");
  savingChanged=true;
 }
 // Every inert data block must remain byte-for-byte unchanged.
 const blocks=s=>[...s.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)].filter(m=>/type=["']application\\/[^"']+["']/i.test(m[1])).map(m=>m[0]);
 const before=blocks(text),after=blocks(updated);if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Data preservation validation failed. No file was changed.');
 return{html:updated,blocks:before.length,savingChanged};
}
window.CockpitOpenAIUpdate={patch};
file.onchange=()=>{button.disabled=!file.files[0];status.textContent=file.files[0]?'Selected '+file.files[0].name+' ('+Math.round(file.files[0].size/1024/1024)+' MB).':'No file selected.';};
button.onclick=async()=>{button.disabled=true;try{const input=file.files[0],result=patch(await input.text()),blob=new Blob([result.html],{type:'text/html'}),name=input.name.replace(/\\.html?$/i,'')+'_OpenAI_Diagnostics.html',url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Updated copy download started: '+name+'\\n'+result.blocks+' embedded data blocks preserved. '+(result.savingChanged?'Linked-file saving updated.':'OpenAI error details updated.')+'\\nOpen the updated HTML in Edge, unlock OpenAI and retry. If it fails, use Copy error details in the new error panel. Share those details without your API key.';}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
</script></body></html>'''
(r/'Cockpit_OpenAI_Error_Updater.html').write_text(template.replace('__CLIENT__',client).replace('__BACKUP__',backup))
print('Built offline updater')
