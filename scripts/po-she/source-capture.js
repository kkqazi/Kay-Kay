/* Keep a clean template from the loaded page, independent of the disk file. */
var SOURCE_READY=new Promise(function(resolve){
 function capture(){var root=document.documentElement.cloneNode(true);['main','dr-body','toast','liveSnapData'].forEach(id=>root.querySelector('#'+id)?.replaceChildren());root.querySelectorAll('#lsvWrap,#cockpit-restore-overlay,.keyv-ov,[data-cockpit-recovery],input[type=password]').forEach(e=>e.remove());root.querySelectorAll('[inert]').forEach(e=>e.removeAttribute('inert'));root.querySelector('#drawer')?.classList.remove('on');root.querySelector('#scrim')?.classList.remove('on');resolve('<!DOCTYPE html>\n'+root.outerHTML);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',capture,{once:true});else capture();
});
var SAVE_FAILED=false,LAST_BROWSER_SAVE='',PENDING_COPY=null;
function sourceSlot(s,id,body){var rx=new RegExp('(<scr'+'ipt\\b[^>]*\\bid="'+id+'"[^>]*>)([\\s\\S]*?)(<\\/scr'+'ipt>)');if(!rx.test(s))throw Error('The '+id+' save slot is missing.');return s.replace(rx,function(_,a,b,c){return a+body+c;});}
async function browserCheckpoint(){
 if(typeof persist==='function'&&await persist()===false)throw Error('Browser storage failed. Keep the tab open and download its recovery snapshot.');
 if(typeof QM!=='undefined'&&QM.Q?.ready&&await DB.set('quality',QM.Q.d)===false)throw Error('Complaints could not be saved in browser storage.');
 LAST_BROWSER_SAVE=new Date().toISOString();
}
function downloadPending(){if(!PENDING_COPY)return;download(PENDING_COPY.blob,PENDING_COPY.name);}
