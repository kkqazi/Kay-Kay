/* Keep two previous linked-file versions in the browser, without automatic downloads. */
function backupKey(){return 'backup:'+handleKey();}
async function retainLinkedBackup(blob,info){
 var db=await hdb();try{await new Promise(function(resolve,reject){var tx=db.transaction('h','readwrite'),st=tx.objectStore('h'),key=backupKey(),rq=st.get(key);rq.onsuccess=function(){if(rq.result)st.put(rq.result,key+':older');st.put({blob:blob,name:info.name,at:info.at,savedAt:info.savedAt},key);};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Previous-version browser backup failed'));tx.onabort=()=>reject(tx.error||Error('Previous-version browser backup cancelled'));});}finally{db.close();}
 var saved=await readLinkedBackup();if(!saved?.blob||saved.blob.size!==blob.size)throw Error('Could not verify the previous-version browser backup. The linked file was not overwritten.');
}
async function readLinkedBackup(){var db=await hdb();try{return await new Promise(function(resolve,reject){var tx=db.transaction('h'),rq=tx.objectStore('h').get(backupKey());rq.onsuccess=()=>resolve(rq.result||null);rq.onerror=()=>reject(rq.error);});}finally{db.close();}}
async function downloadPrevious(){try{var saved=await readLinkedBackup();if(!saved?.blob)throw Error('No previous linked-file backup exists for this dashboard yet.');download(saved.blob,'Cockpit_PREVIOUS_'+saved.at.replace(/[:.]/g,'-')+'.html');note('Previous-version backup download started.','ok');}catch(e){note(h(e.message||e),'bad');}}
