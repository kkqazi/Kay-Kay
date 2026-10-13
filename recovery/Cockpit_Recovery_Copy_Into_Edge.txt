/* Run as an Edge DevTools Snippet IN THE STILL-OPEN COCKPIT TAB.
   Reads the live page and its configured browser stores. Makes new downloads.
   No network requests, filesystem handles, overwrites or database writes.
   Pauses autosave, detaches the broken file, and locks the API key first. */
(async function cockpitEmergencyRecovery(){
 'use strict';
 if(window.__cockpitEmergencyBusy){alert('Recovery is already running. Keep this tab open.');return;}
 if(!document.getElementById('liveSaveModule')||!document.getElementById('liveSnapData')){alert('Run this snippet in the original cockpit tab that is still open, not in a blank page or a new dashboard.');return;}
 window.__cockpitEmergencyBusy=true;
 const oldInert=document.body.inert,oldMeta=JSON.parse(document.getElementById('liveSnapMeta').textContent||'{}');
 let panel,connections=[];
 function report(text){if(panel)panel.querySelector('p').textContent=text;}
 try{
  const sourceCode=document.getElementById('liveSaveModule').textContent,cfgMatch=/\bvar\s+CFG\s*=\s*(\{[^\n]*?\});/.exec(sourceCode);
  if(!cfgMatch)throw Error('This save-module version cannot be identified. Keep the tab open and use its snapshot exports.');
  const cfg=JSON.parse(cfgMatch[1]);if(!cfg.app||!Array.isArray(cfg.idb)||!cfg.idb.length)throw Error('The dashboard database scope is missing.');
  const auto=document.getElementById('lsvAuto');if(auto){auto.checked=false;auto.dispatchEvent(new Event('change',{bubbles:true}));}
  if(typeof QM!=='undefined'&&QM.Q?.running){QM.Q.cancel=true;QM.Q.controller?.abort();throw Error('An analysis request was running. It has been stopped. Wait for it to finish, then run recovery again.');}
  if(typeof KEYV!=='undefined'&&KEYV.lock)KEYV.lock();
  if(window.LiveHtmlSave?._setHandle)window.LiveHtmlSave._setHandle(null,'none');
  if(document.getElementById('lsvSave')?.disabled)throw Error('A save is still finishing. Wait for it to stop, then run recovery again.');
  // Capture code already in the live DOM, including later additions such as SHE.
  const clone=document.documentElement.cloneNode(true);
  for(const id of ['main','dr-body','toast','liveSnapData'])clone.querySelector('#'+id)?.replaceChildren();
  for(const el of clone.querySelectorAll('#lsvWrap,.keyv-ov,[data-cockpit-recovery],input[type=password]'))el.remove();
  for(const el of clone.querySelectorAll('[inert]'))el.removeAttribute('inert');
  clone.querySelector('#drawer')?.classList.remove('on');clone.querySelector('#scrim')?.classList.remove('on');
  const liveScript=clone.querySelector('#liveSaveModule');
  // A recovered copy must not automatically relink to the 0 KB file.
  if(/if\(FS\)\{var hd=await hGet\(\);if\(hd\)\{FILE_HANDLE=hd;await permission\(false\);\}\}/.test(liveScript.textContent)){
   liveScript.textContent=liveScript.textContent.replace(/if\(FS\)\{var hd=await hGet\(\);if\(hd\)\{FILE_HANDLE=hd;await permission\(false\);\}\}/,'/* Recovered copy: relink only after validating a separate local file. */');
  }else throw Error('The automatic file-link code differs from this tested recovery format. Keep this tab open and export a snapshot; share that backup for review.');
  liveScript.textContent=liveScript.textContent.replace('return d;})();','d.auto=false;return d;})();');
  let skeleton='<!DOCTYPE html>\n'+clone.outerHTML;
  panel=document.createElement('section');panel.dataset.cockpitRecovery='1';panel.setAttribute('role','status');panel.style.cssText='position:fixed;inset:20px auto auto 20px;width:min(520px,calc(100vw - 40px));background:#fff;border:3px solid #215da5;border-radius:12px;padding:18px;z-index:2147483647;font:15px/1.5 Arial,sans-serif;color:#17283b;box-shadow:0 8px 30px #0004';
  const heading=document.createElement('h2');heading.textContent='Cockpit emergency recovery';heading.style.margin='0 0 10px';const msg=document.createElement('p');msg.textContent='Capturing browser data. Keep this tab open; large dashboards can take several minutes.';panel.append(heading,msg);document.body.appendChild(panel);document.body.inert=true;
  // User entry is paused while the records are read; unfinished forms are not submitted.
  const overlays=new Map();
  const sensitive=/^(?:apiKey|api_key|password|accessToken|refreshToken|authToken|authorization|encryptedKey)$/i;
  function settingsClean(s){const out={};for(const [k,v]of Object.entries(s||{}))if(!sensitive.test(k))out[k]=v;return out;}
  if(typeof APP!=='undefined'){
   overlays.set('store',APP.store);overlays.set('actions',APP.actions||[]);overlays.set('settings',typeof settingsForSave==='function'?settingsClean(settingsForSave()):settingsClean(APP.settings));
  }
  if(typeof QM!=='undefined'&&QM.Q?.ready&&QM.Q.d)overlays.set('quality',QM.Q.d);
  const batches=[],accs={},counts={},cs=new CompressionStream('gzip'),writer=cs.writable.getWriter(),encoder=new TextEncoder();let packedBytes=0,lines=0;
  const consumer=(async()=>{const reader=cs.readable.getReader();while(true){const r=await reader.read();if(r.done)break;batches.push(r.value);packedBytes+=r.value.length;}})();
  const ignore=cfg.hashIgnore?.length?new RegExp('"('+cfg.hashIgnore.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')":("[^"]*"|-?[0-9.eE+-]+|null)','g'):null;
  const newAcc=()=>({a:0x811c9dc5,b:0x01000193^0x9e3779b9,n:0});
  function feed(acc,s){if(ignore)s=s.replace(ignore,'"$1":0');let a=acc.a,b=acc.b;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a^=c;a=Math.imul(a,16777619);b^=c;b=Math.imul(b,0x5bd1e995);b^=b>>>15;}acc.a=a;acc.b=b;acc.n+=s.length;}
  const finish=a=>(a.a>>>0).toString(16)+(a.b>>>0).toString(16)+'-'+a.n.toString(36);
  async function emit(part,o){const text=JSON.stringify(o);if(part[0]!=='_')feed(accs[part]||(accs[part]=newAcc()),text);await writer.write(encoder.encode(text+'\n'));lines++;if(lines%10===0)report('Captured '+lines+' blocks · '+(packedBytes/1048576).toFixed(1)+' MB packed. Keep this tab open.');}
  const req=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('Browser data could not be read.'));});
  const tick=()=>new Promise(r=>setTimeout(r,0));
  function encode(v,blobs){
   if(v===undefined)return {__ls:'u'};if(v===null||typeof v!=='object')return typeof v==='number'&&!Number.isFinite(v)?{__ls:'n',v:String(v)}:v;
   if(v instanceof Date)return {__ls:'d',v:v.getTime()};
   if(v instanceof Blob){const o={__ls:'b',t:v.type||'',nm:v.name||null,lm:v.lastModified||null,v:''};blobs.push([o,v]);return o;}
   if(v instanceof ArrayBuffer){const o={__ls:'ab',v:''};blobs.push([o,new Blob([v])]);return o;}
   if(ArrayBuffer.isView(v)){const o={__ls:'ta',c:v.constructor.name,v:''};blobs.push([o,new Blob([v])]);return o;}
   if(v instanceof Map)return {__ls:'m',v:[...v].map(([k,x])=>[encode(k,blobs),encode(x,blobs)])};
   if(v instanceof Set)return {__ls:'s',v:[...v].map(x=>encode(x,blobs))};if(v instanceof RegExp)return {__ls:'r',v:v.source,f:v.flags};
   if(Array.isArray(v))return v.map(x=>encode(x,blobs));const out={};for(const [k,x]of Object.entries(v))out[k]=encode(x,blobs);return out;
  }
  const base64=b=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(b);});
  function secretKey(k){return /(?:^|[.:])(?:apiKey|api_key|password|accessToken|refreshToken|authToken|encryptedKey|vault)(?:$|[.:])/i.test(String(k));}
  function inScope(k){return !secretKey(k)&&!(cfg.lsExcludeExact||[]).includes(k)&&!(cfg.lsExcludePrefix||[]).some(p=>k.startsWith(p))&&((cfg.lsExact||[]).includes(k)||(cfg.lsPrefix||[]).some(p=>k.startsWith(p)));}
  await emit('_h',{t:'h',v:2,app:cfg.app});
  const localKeys=Object.keys(localStorage).filter(inScope).sort();for(const k of localKeys){let value=localStorage.getItem(k);if(/(?:^|\.)settings$/.test(k)){try{value=JSON.stringify(settingsClean(JSON.parse(value)));}catch(e){throw Error('Saved settings could not be sanitised.');}}await emit('ls:'+k,{t:'ls',k,v:value});}
  let names=null;if(indexedDB.databases)names=(await indexedDB.databases()).map(d=>d.name);
  const primary=(typeof DB!=='undefined'&&DB.db?.name)||cfg.idb[0];
  for(const name of cfg.idb){
   if(names&&!names.includes(name))throw Error('Expected dashboard database is missing: '+name+'. Do not close the original tab.');
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(name);r.onupgradeneeded=()=>{r.transaction.abort();reject(Error('Database is missing: '+name));};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});connections.push(db);
   const schema=[...db.objectStoreNames].map(sn=>{const st=db.transaction(sn,'readonly').objectStore(sn);return {name:sn,keyPath:st.keyPath,autoIncrement:st.autoIncrement,indexes:[...st.indexNames].map(n=>{const x=st.index(n);return {name:n,keyPath:x.keyPath,unique:x.unique,multiEntry:x.multiEntry};})};});
   await emit('db:'+name,{t:'db',name,version:db.version,stores:schema});counts[name]={};
   for(const sc of schema){
    const seen=new Set();let range=null,count=0;
    async function rows(keys,values){const blobs=[],r=[];for(let i=0;i<keys.length;i++){const key=keys[i];if(secretKey(key))continue;let value=values[i];if(name===primary&&sc.name==='kv'&&overlays.has(key)){value=overlays.get(key);seen.add(key);}else if(key==='settings')value=settingsClean(value);r.push([sc.keyPath==null?encode(key,blobs):0,encode(value,blobs)]);}for(const [o,b]of blobs)o.v=await base64(b);if(r.length){await emit('idb:'+name+'/'+sc.name,{t:'rows',db:name,s:sc.name,r});count+=r.length;}}
    while(true){const st=db.transaction(sc.name,'readonly').objectStore(sc.name),kr=st.getAllKeys(range,100),vr=st.getAll(range,100),[keys,values]=await Promise.all([req(kr),req(vr)]);if(!keys.length)break;await rows(keys,values);if(keys.length<100)break;range=IDBKeyRange.lowerBound(keys.at(-1),true);await tick();}
    if(name===primary&&sc.name==='kv')for(const [k,v]of overlays)if(!seen.has(k)&&v!==undefined)await rows([k],[v]);
    counts[name][sc.name]=count;await emit('idb:'+name+'/'+sc.name,{t:'se',db:name,s:sc.name,n:count});
   }
   db.close();connections=connections.filter(x=>x!==db);
  }
  await emit('_e',{t:'end'});await writer.close();await consumer;
  const packed=new Blob(batches,{type:'application/gzip'}),encoded=[];for(let p=0;p<packed.size;p+=3*1048576){encoded.push(await base64(packed.slice(p,Math.min(packed.size,p+3*1048576))));report('Preparing HTML · '+Math.round(100*Math.min(packed.size,p+3*1048576)/packed.size)+'%. Keep this tab open.');await tick();}
  const parts=Object.fromEntries(Object.entries(accs).map(([k,v])=>[k,finish(v)])),hashAcc=newAcc();Object.keys(parts).sort().forEach(k=>feed(hashAcc,k+'='+parts[k]+';'));
  const now=new Date().toISOString(),metadata={...oldMeta,savedAt:now,savedBy:localStorage.getItem('liveSave:user')||oldMeta.savedBy||'Emergency recovery',parts,hash:finish(hashAcc),dataLen:encoded.reduce((n,s)=>n+s.length,0),packedBytes:packed.size,tool:'emergency-live-tab-recovery-v1',recovery:{capturedAt:now,counts,filesRead:0,filesOverwritten:0}};
  function slot(id){const rx=new RegExp('(<scr'+'ipt\\b[^>]*\\bid="'+id+'"[^>]*>)([\\s\\S]*?)(<\\/scr'+'ipt>)');const m=rx.exec(skeleton);if(!m)throw Error('The '+id+' save slot is missing.');return m;}
  const metaMatch=slot('liveSnapMeta');skeleton=skeleton.slice(0,metaMatch.index)+metaMatch[1]+JSON.stringify(metadata).replace(/</g,'\\u003c')+metaMatch[3]+skeleton.slice(metaMatch.index+metaMatch[0].length);
  const dataMatch=slot('liveSnapData'),html=new Blob([skeleton.slice(0,dataMatch.index),'<script id="liveSnapData" type="application/octet-stream" data-enc="ndjson+gzip+base64">',...encoded,dataMatch[3],skeleton.slice(dataMatch.index+dataMatch[0].length)],{type:'text/html'});
  if(!html.size||!packed.size)throw Error('An empty recovery file was generated; do not close the tab.');
  window.__cockpitEmergencyRecovery={html,data:packed,manifest:metadata};
  const stamp=now.replace(/[:.]/g,'-'),base='GC_NH_Cockpit_RECOVERED_'+stamp;
  function link(label,blob,filename){const a=document.createElement('a');a.textContent=label;a.href=URL.createObjectURL(blob);a.download=filename;a.style.cssText='display:block;background:#215da5;color:white;padding:10px 12px;border-radius:7px;margin:8px 0;text-decoration:none;font-weight:bold';panel.appendChild(a);}
  report('Recovery files are ready: HTML '+(html.size/1048576).toFixed(1)+' MB; data backup '+(packed.size/1048576).toFixed(1)+' MB. Download BOTH to a local folder outside OneDrive. Keep the original tab open until the downloaded files show non-zero sizes and the recovered copy has been checked.');
  link('1. Download recovered HTML',html,base+'.html');link('2. Download complete data backup',packed,base+'_DATA.ndjson.gz');
  const note=document.createElement('p');note.textContent='The damaged file was not read or overwritten. SHE and other inline module code are captured from this tab. Configured browser stores and current core/quality data are included; unfinished forms are not submitted. Autosave is paused and the recovered copy starts without a linked file. This is a rescue copy, not a permanent save repair.';note.style.fontSize='12px';panel.appendChild(note);
 }catch(e){if(!panel){panel=document.createElement('section');panel.dataset.cockpitRecovery='1';panel.style.cssText='position:fixed;top:20px;left:20px;background:white;color:#8b2118;padding:18px;z-index:2147483647;max-width:520px';panel.appendChild(document.createElement('p'));document.body.appendChild(panel);}report('Recovery did not complete: '+(e.message||e)+'. Keep the original tab open.');console.error('Cockpit recovery failed',e.name||'Error');}
 finally{for(const db of connections)db.close();document.body.inert=oldInert;window.__cockpitEmergencyBusy=false;}
})();
