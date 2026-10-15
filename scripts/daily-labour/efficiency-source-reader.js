/* The worker reads CSV as text, retaining UK dates and original source row numbers. */
async function parseEfficiencyBytes(bytes,meta){
 const csv=/\.csv$/i.test(meta.file||'');
 function parseOnMain(){
  if(csv)return EO.parseCSV(new TextDecoder('utf-8').decode(bytes),meta);
  const sheets=sourceGrid(XLSX.read(bytes,{type:'array',cellDates:false})),file=EO.parse(sheets,meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);return file;
 }
 if(typeof Worker==='undefined')return parseOnMain();
 const scripts=['lib-xlsx','daily-labour-engine','daily-efficiency-engine','daily-efficiency-diagnostics'].map(id=>document.getElementById(id)?.textContent);
 if(scripts.some(x=>!x))throw Error('The cockpit is missing its offline Efficiency or workbook parser.');
 const workerCode=scripts.join('\n;\n')+`\nself.onmessage=e=>{try{let file;if(/\\.csv$/i.test(e.data.meta.file||'')){file=DailyEfficiencyEngine.parseCSV(new TextDecoder('utf-8').decode(e.data.bytes),e.data.meta);}else{const wb=XLSX.read(e.data.bytes,{type:'array',cellDates:false});const sheets=wb.SheetNames.map(name=>({name,date1904:!!wb.Workbook?.WBProps?.date1904,grid:XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,raw:true,defval:null,blankrows:true})}));file=DailyEfficiencyEngine.parse(sheets,e.data.meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);}self.postMessage({file});}catch(error){self.postMessage({error:error.message||String(error)});}};`;
 const url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'}));let worker;
 try{try{worker=new Worker(url);}catch(_){return parseOnMain();}return await new Promise((resolve,reject)=>{worker.onmessage=e=>e.data.error?reject(Error(e.data.error)):resolve(e.data.file);worker.onerror=e=>reject(Error(e.message||'Efficiency workbook worker failed'));worker.postMessage({bytes,meta},[bytes]);});}
 finally{worker?.terminate();URL.revokeObjectURL(url);}
}
