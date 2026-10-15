/* Replaces only the Efficiency upload preview; all changes still use the existing audited store. */
function efficiencyPicker(){
 const input=h('input',{type:'file',accept:'.xlsx,.xlsm,.xls,.xlsb,.csv',id:'dl-upload-efficiency',style:'display:none'});
 input.onchange=async()=>{try{
  const file=input.files[0];if(!file)return;const date=data().ui.date;lockControls(true);toast('Inspecting Efficiency run dates…',5000);
  const bytes=await file.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),sha256=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''),parsed=await parseEfficiencyBytes(bytes,{id:'eff-'+sha256+(/\.csv$/i.test(file.name)?'-'+date:''),file:file.name,bytes:file.size,sha256,loadedAt:new Date().toISOString(),productionDate:date}),preview=EO.output({efficiencyFiles:[parsed],dayEfficiency:{[date]:[parsed.meta.id]}},date),diagnosis=DailyEfficiencyDiagnostics.inspect(preview,E);
  lockControls(false);
  openDrill({title:'Review Efficiency output for '+showDate(date),crumb:'Daily Labour / Efficiency source',sub:file.name+' · '+parsed.rows.length+' imported rows · '+diagnosis.included+' usable rows for this day',render:body=>{
   body.appendChild(message(diagnosis.message));
   body.appendChild(table(cols([['file','Workbook'],['sheets','Imported worksheets'],['from','First source date / start'],['to','Last source date / end'],['outputField','Output field'],['dateBasis','Date basis'],['rows','Imported rows',1,0]]),diagnosis.files));
   body.appendChild(message('Output uses the field shown above and physical Line Name. Efficiency-tab rows use their printed Shift Date; timed-run exports use Product Start / End. Source dates are retained.'));
   body.appendChild(table(cols([['unit','Line unit'],['runs','Usable runs',1,0],['units',preview.outputField,1,0],['areaDifferences','Area differs',1,0]]),Object.entries(preview.byUnit).filter(([unit])=>unit!=='Unknown').map(([unit,x])=>({unit,...x}))));
   if(!diagnosis.acceptable)body.appendChild(message('If the workbook shows current totals but the imported detail is old, refresh the current report in Excel and export or drill through to its current run-level detail. Download the workbook inspection below to identify the available worksheets and headers.'));
   if(parsed.meta.sheetInspection)body.appendChild(button('Download workbook inspection',()=>{const report={kind:'cockpit-efficiency-workbook-inspection',version:1,source:{file:file.name,bytes:file.size,sha256},productionDate:date,window:{from:preview.W.from,to:preview.W.to},diagnosis,sheets:parsed.meta.sheetInspection};downloadBlob(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),'Efficiency_Workbook_Inspection_'+date+'.json');}));
   const use=button('Use this Efficiency report',async()=>{if(!diagnosis.acceptable)return;if(await change(m=>{if(m.ui.date!==date)throw Error('Production date changed. Inspect this report again for the selected day.');if(!m.efficiencyFiles.some(f=>f.meta.id===parsed.meta.id))m.efficiencyFiles.push(parsed);m.dayEfficiency[date]=[parsed.meta.id];m.audit.push({at:new Date().toISOString(),type:'Efficiency source selected',date,detail:file.name+' · '+diagnosis.included+' usable runs · '+parsed.meta.id});})){closeDrill();toast('Efficiency output connected. Save the dashboard to retain the file.');}},true);
   use.disabled=!diagnosis.acceptable;body.appendChild(use);
  }});
 }catch(e){error=e.message||String(e);toast(error,10000);go(true);}finally{lockControls(false);input.remove();}};
 document.body.appendChild(input);input.click();
}
