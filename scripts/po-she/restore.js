/* Restore into the repaired workspace without deleting any database.
   Parse and validate the entire backup first, then commit each DB atomically. */
async function applyStream(lineSource){
 var dbDefs={},rows={},lsVals={},dbs={};SUPPRESS++;
 try{
  await lineSource(async function(line){
   if(!line)return;var o=JSON.parse(line);
   if(o.t==='ls'){if(inScope(o.k))lsVals[o.k]=o.v;}
   else if(o.t==='db'){if(!idbInScope(o.name))throw Error('Unexpected database in backup.');dbDefs[o.name]=o;rows[o.name]={};}
   else if(o.t==='rows'){if(!dbDefs[o.db]||!dbDefs[o.db].stores.some(s=>s.name===o.s)||!Array.isArray(o.r))throw Error('Invalid backup table.');(rows[o.db][o.s]||(rows[o.db][o.s]=[])).push(...o.r);}
  });
  for(var name of Object.keys(dbDefs)){
   var def=dbDefs[name];
   if(document.getElementById('lsvProg'))document.getElementById('lsvProg').textContent='Restoring browser data…';
   var db=await new Promise(function(resolve,reject){
    var r=indexedDB.open(name,Math.max(1,def.version||1)),timer=setTimeout(()=>reject(Error('Database restore timed out. Keep your original tab open; close only other copies of this repaired dashboard and retry.')),15000);
    r.onupgradeneeded=function(){var d=r.result;def.stores.forEach(function(s){if(d.objectStoreNames.contains(s.name))return;var opt={};if(s.keyPath!=null)opt.keyPath=s.keyPath;if(s.autoIncrement)opt.autoIncrement=true;var st=d.createObjectStore(s.name,opt);(s.indexes||[]).forEach(x=>st.createIndex(x.name,x.keyPath,{unique:!!x.unique,multiEntry:!!x.multiEntry}));});};
    r.onsuccess=function(){clearTimeout(timer);resolve(r.result);};r.onerror=function(){clearTimeout(timer);reject(r.error);};r.onblocked=function(){clearTimeout(timer);reject(Error('A database upgrade is blocked by another repaired tab. The original dashboard can remain open.'));};
   });dbs[name]=db;
   await new Promise(function(resolve,reject){
    var tx=db.transaction(def.stores.map(s=>s.name),'readwrite');
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Restore write failed'));tx.onabort=()=>reject(tx.error||Error('Restore cancelled'));
    try{def.stores.forEach(function(s){var st=tx.objectStore(s.name);st.clear();(rows[name][s.name]||[]).forEach(function(r){var v=decSync(r[1]);if(s.keyPath==null)st.put(v,decSync(r[0]));else st.put(v);});});}catch(e){tx.abort();reject(e);}
   });
  }
  var rm=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(inScope(k))rm.push(k);}
  rm.forEach(k=>ORIG_REM.call(localStorage,k));Object.keys(lsVals).forEach(k=>{if(lsVals[k]!=null)ORIG_SET.call(localStorage,k,lsVals[k]);});
 }finally{Object.keys(dbs).forEach(n=>dbs[n].close());SUPPRESS--;}
}
