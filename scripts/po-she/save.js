async function save(o){
 o=o||{};var auto=!!o.auto,copy=!!o.copy;if(SAVING)return;
 if(auto&&(!FILE_HANDLE||FILE_PERM!=='granted'||CONFLICT))return;
 SAVING=true;paint();var priorInert=document.body.inert;document.body.inert=true;
 try{
  if(typeof QM!=='undefined'&&QM.Q?.running)throw Error('Stop classification before saving a portable copy.');
  await browserCheckpoint();var dirtyAt=DIRTY,source=await SOURCE_READY;progress('Packing a complete copy from the open dashboard…');
  var packed=await buildCompressed(progress),b64=await b64Parts(packed.blob,progress),now=new Date().toISOString();
  var metaObj={app:CFG.app,savedAt:now,savedBy:getUser()||META.savedBy||'Dashboard owner',parts:packed.parts,hash:totalHash(packed.parts),dataLen:b64.reduce((n,s)=>n+s.length,0),packedBytes:packed.blob.size,tool:'po-she-safe-save-v1',repair:META.repair||null};
  source=sourceSlot(source,'liveSnapMeta',JSON.stringify(metaObj).replace(/</g,'\\u003c'));
  var rx=new RegExp('(<scr'+'ipt\\b[^>]*\\bid="liveSnapData"[^>]*>)([\\s\\S]*?)(<\\/scr'+'ipt>)'),m=rx.exec(source);if(!m)throw Error('Data save slot is missing.');
  var blob=new Blob([source.slice(0,m.index),'<scr'+'ipt id="liveSnapData" type="application/octet-stream" data-enc="ndjson+gzip+base64">',...b64,m[3],source.slice(m.index+m[0].length)],{type:'text/html'});
  var outName='GC_NH_Cockpit_PO_SHE_'+now.replace(/[:.]/g,'-')+'.html';PENDING_COPY={blob,name:outName};
  if(copy||!FILE_HANDLE){
   if(auto)return;downloadPending();note('New complete HTML download started. Keep it in a local folder outside OneDrive and confirm its non-zero size. No existing file was read or overwritten.','ok');
  }else{
   // Read and retain a full prior version BEFORE opening a writer. No File slices
   // are used as output pieces, avoiding source reads while the file is written.
   var before=await FILE_HANDLE.getFile();if(!before.size)throw Error('The linked file is empty. Use Download copy; it does not need that file.');var layout=await locate(before);
   if(FILE_STAMP&&layout.meta.savedAt&&layout.meta.savedAt>FILE_STAMP){CONFLICT=layout.meta;throw Error('The linked file has newer data. Download your copy and review both versions.');}
   var previous=new Blob([await before.arrayBuffer()],{type:'text/html'});download(previous,'GC_NH_Cockpit_PREVIOUS_'+now.replace(/[:.]/g,'-')+'.html');
   var check=await FILE_HANDLE.getFile();if(check.size!==before.size||check.lastModified!==before.lastModified)throw Error('The linked file changed before writing. Nothing was overwritten.');
   var writer=await FILE_HANDLE.createWritable();try{await writer.write(blob);await writer.close();}catch(e){try{await writer.abort();}catch(_){}throw e;}
   var after=await FILE_HANDLE.getFile();if(!after.size||after.size!==blob.size)throw Error('The written file could not be verified. Download the complete copy held in this tab.');var checked=await locate(after);if(checked.meta.savedAt!==now)throw Error('The written file timestamp could not be verified.');
   note('File saved and checked. A previous-version backup download was also started; retain it outside OneDrive.','ok');
  }
  SAVE_FAILED=false;FILE_STAMP=now;BASE_PARTS=packed.parts;PART_HASH=Object.assign({},packed.parts);META=metaObj;CONFLICT=null;LAST_SAVE_AT=Date.now();DIRTY=Math.max(0,DIRTY-dirtyAt);REAL_DIRTY=DIRTY>0;syncSet({savedAt:now,dirty:DIRTY,parts:packed.parts});
 }catch(e){SAVE_FAILED=true;REAL_DIRTY=true;note('<b>Save failed.</b> '+h(e.message||e)+' '+(PENDING_COPY?'The complete generated copy is still in this tab. Use <b>Download copy</b>.':'Keep this tab open.'),'bad');}
 finally{document.body.inert=priorInert;SAVING=false;paint();}
}
