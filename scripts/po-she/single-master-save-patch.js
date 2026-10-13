/* Code-only patch for the validated v6.7 save engine. */
function applySingleMasterSave(text){
 if(text.includes('/* Single-master saving v2 */'))return {html:text,changed:false};
 if(!text.includes("tool:'po-she-safe-save-v1'")||!text.includes('async function retainLinkedBackup('))throw Error('This file does not have the supported recovery save engine. Keep it unchanged and provide the latest v6.7 cockpit for a tailored update.');
 const once=(a,b)=>{const i=text.indexOf(a);if(i<0||text.indexOf(a,i+1)!==-1)throw Error('Cannot safely identify the master-save code. No file was changed.');text=text.slice(0,i)+b+text.slice(i+a.length);};
 once('async function save(o){','/* Single-master saving v2 */\nasync function save(o){');
 once("if(auto&&(!FILE_HANDLE||FILE_PERM!=='granted'||CONFLICT))return;",`if(auto&&(!FILE_HANDLE||FILE_PERM!=='granted'||CONFLICT))return;
 if(!copy&&!auto){
  if(!FS){note('This browser cannot update an HTML file directly. Use Edge or Chrome, or choose Download copy explicitly.','warn');return;}
  try{if(!FILE_HANDLE){note('Choose the existing master HTML file to update. This does not create a new file.','info');await linkFile();CONFLICT=null;}
   else if(FILE_PERM!=='granted'&&await permission(true)!=='granted'){note('Editing permission was not granted. No file was changed. Use Link master file to reconnect.','warn');paint();return;}
  }catch(e){if(e?.name==='AbortError')note('File selection cancelled. No file was changed and no copy was downloaded.','info');else note('Could not link the master file: '+h(e.message||e),'bad');paint();return;}
 }`);
 once("sv.textContent=FILE_HANDLE?'Save to file':'Download copy';sv.title=FILE_HANDLE?'Update the linked master HTML file':'Not linked: downloads a new complete HTML. Use Link master file to update one file.';", "sv.textContent='Save';sv.title=FILE_HANDLE?'Update '+FILE_HANDLE.name:'Choose the existing master HTML once, then update it on Save';");
 once('Not linked — Download copy creates a new HTML. Use <b>Link master file</b> to select the saved local HTML you want to update.', 'Not linked — press <b>Save</b> once to choose the existing master HTML. Future saves update that file.');
 once("title: 'Save a new copy of this HTML with everything you have loaded, your actions, GOE % and edits built in' }, '💾 Save as copy'); sv.onclick = saveHtml;", "title: 'Update the linked master HTML file; select it once if needed' }, '💾 Save dashboard'); sv.onclick = saveHtml;");
 const a=text.indexOf('async function saveHtml(opts) {'),b=text.indexOf('async function restoreSaved()',a);if(a<0||b<0)throw Error('Cannot identify the dashboard Save button adapter. No file was changed.');
 text=text.slice(0,a)+`async function saveHtml(opts) {
 if(!window.LiveHtmlSave||typeof window.LiveHtmlSave.save!=='function'){toast('Saving is not ready. Keep this tab open and wait for loading to finish.',6000);return;}
 await window.LiveHtmlSave.save({copy:opts?.copy===true});
}
`+text.slice(b);
 // Direct all ordinary Save actions through the same permission/linking path.
 const clickStart="document.getElementById('lsvSave').onclick=async function(){if(FILE_HANDLE&&FILE_PERM!=='granted'){if(await permission(true)!=='granted'){note('Allow editing to update the master file, or use Download copy.','warn');paint();return;}}save();};";
 once(clickStart,"document.getElementById('lsvSave').onclick=function(){save();};");
 return {html:text,changed:true};
}
