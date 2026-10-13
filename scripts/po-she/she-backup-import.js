function importSheBackup(){
 var input=document.createElement('input');input.type='file';input.accept='.json';
 input.onchange=async function(){try{
  if(!input.files[0])return;var j=JSON.parse(await input.files[0].text()),keys=['fy27c.she','fy27c.sheCfg','fy27c.sheManual','fy27c.sheRisks','fy27c.sheState'];
  if(j.kind!=='cockpit-she-local-backup'||j.version!==1||!j.storage||Object.keys(j.storage).length!==keys.length||!keys.every(k=>Object.hasOwn(j.storage,k)))throw Error('Choose Cockpit_SHE_Local_Backup.json from the original working tab.');
  keys.forEach(k=>{var v=j.storage[k];if(v!==null){if(typeof v!=='string')throw Error('Invalid SHE backup value.');var parsed=JSON.parse(v);if(k==='fy27c.sheRisks'?!Array.isArray(parsed):!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Invalid SHE backup shape.');}});
  var count=keys.filter(k=>j.storage[k]!==null).length;if(!confirm('Restore '+count+' SHE storage keys from '+(j.exportedAt||'this backup')+'?\n\nThis replaces only SHE data, manual figures, KPI settings, risks and selection. PO, labour and other datasets are unchanged. A previous-SHE backup download will start.'))return;
  var previous={kind:j.kind,version:1,exportedAt:new Date().toISOString(),storage:Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k.replace('fy27c.','gcnPoSheRepair.'))]))};
  download(new Blob([JSON.stringify(previous,null,2)],{type:'application/json'}),'Cockpit_SHE_PREVIOUS_'+Date.now()+'.json');
  // Save values only to the isolated repaired workspace. Roll back on quota failure.
  try{keys.forEach(k=>{var target=k.replace('fy27c.','gcnPoSheRepair.');if(j.storage[k]===null)localStorage.removeItem(target);else localStorage.setItem(target,j.storage[k]);});}catch(e){keys.forEach(k=>{var target=k.replace('fy27c.','gcnPoSheRepair.');if(previous.storage[k]===null)localStorage.removeItem(target);else localStorage.setItem(target,previous.storage[k]);});throw e;}
  if(typeof SHE!=='undefined'&&SHE.reloadLocal)SHE.reloadLocal();META.repair=Object.assign({},META.repair,{sheSupplementIncluded:true,sheBackupImportedAt:new Date().toISOString()});
  document.getElementById('she-recovery-needed')?.remove();if(typeof go==='function')go(true);note('SHE backup restored into this repaired copy. Now use Download copy to keep the restored entries in the HTML.','ok');
 }catch(e){note('SHE import failed: '+h(e.message||e),'bad');}};input.click();
}
