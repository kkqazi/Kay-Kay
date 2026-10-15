/* Read-only Efficiency source diagnostics. Production totals and clock hours stay unchanged. */
(function(root){
'use strict';
function inspect(output,engine){
 const rows=output.rows||[],count=state=>rows.filter(r=>r.state===state).length;
 const files=(output.files||[]).map(f=>({file:f.file,sheets:(f.mapping||[]).map(m=>m.sheet).join(', '),from:f.observedFirstDate||(Number.isFinite(f.observedFrom)?engine.civil(f.observedFrom):null),to:f.observedLastDate||(Number.isFinite(f.observedTo)?engine.civil(f.observedTo):null),outputField:f.outputField||'Valid Packs',dateBasis:f.dateBasis||'Product Start / Product End',rows:f.rowCount??rows.filter(r=>r.fileId===f.id).length}));
 const window=output.dateBasis==='Shift Date'?'production Shift Date '+output.W.date:output.W.from+' → '+output.W.to+' Europe/London',included=(output.included||[]).length,outside=count('Outside window'),invalid=count('Invalid – review'),boundary=count('Boundary run – unallocated'),conflicts=count('Conflicting Run ID – review');
 let message;if(!files.length)message='No Efficiency report is selected for this production day.';
 else if(included)message=included+' usable runs match '+window+'.'+((output.blocked||[]).length?' Some output still needs review; inspect the warnings before using UPLH.':'');
 else if(rows.length&&outside===rows.length)message='No matching production dates: all '+outside+' imported runs are outside '+window+'. The selected file does not supply output for this day. Load the current production detail; the previous source is retained.';
 else message='No usable runs for '+window+'. '+outside+' outside the window; '+invalid+' invalid; '+boundary+' crossing a boundary; '+conflicts+' conflicting duplicate rows. Review the source before replacing this day’s Efficiency report.';
 return{acceptable:included>0,window,files,included,outside,invalid,boundary,conflicts,message};
}
function inspectSheets(sheets){
 const header=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,''),cell=v=>typeof v==='string'&&v.length>1000?v.slice(0,1000)+' [preview truncated]':v,row=r=>(r||[]).slice(0,240).map(cell);
 return sheets.map(sheet=>{const grid=sheet.grid||[];let at=-1,best=0,score=-1;
  for(let i=0;i<Math.min(grid.length,60);i++){const values=grid[i]||[],keys=values.map(header);if(keys.includes('linename')&&(keys.includes('productstart')||keys.includes('shiftdate')&&(keys.includes('packsmade')||keys.includes('validpacks')))){at=i;break;}const n=values.filter(v=>typeof v==='string'&&v.trim()).length+keys.filter(k=>/^(date|shiftdate|productiondate|validpacks|packsmade|linename|unit)$/.test(k)).length*20;if(n>score){score=n;best=i;}}
  if(at<0)at=best;const headers=grid[at]||[];return{name:sheet.name,worksheetRows:grid.length,headerRow:at+1,headers:row(headers),runDetailCandidate:headers.map(header).includes('productstart')&&headers.map(header).includes('linename'),shiftOutputCandidate:headers.map(header).includes('shiftdate')&&headers.map(header).includes('linename'),date1904:!!sheet.date1904,topRows:grid.slice(0,12).map(row),preview:grid.slice(at+1,at+7).map(row),previewOnly:true};
 });
}
const api={inspect,inspectSheets};root.DailyEfficiencyDiagnostics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
