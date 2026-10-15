/* One-time, local workbook structure inspection. This does not import or calculate production. */
'use strict';
const canonical=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,'');
self.onmessage=e=>{
 const report={kind:'cockpit-efficiency-xlsm-inspection',version:1,source:e.data.source,readerVersion:XLSX.version,inspectedAt:new Date().toISOString(),readOptions:{sheetRows:100,cellDates:false,cellNF:true,cellHTML:false,bookVBA:false},sheets:[]};
 try{
  const wb=XLSX.read(e.data.bytes,{type:'array',...report.readOptions});report.date1904=!!wb.Workbook?.WBProps?.date1904;
  report.sheets=wb.SheetNames.map((name,index)=>{
   const sheet=wb.Sheets[name],range=sheet['!ref']||null,grid=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true,defval:null,blankrows:true}),offset=range?XLSX.utils.decode_range(range).s.r:0,columns=range?XLSX.utils.decode_range(range).s.c:0;
   let at=-1,score=-1;for(let i=0;i<grid.length;i++){
    const keys=(grid[i]||[]).map(canonical),points=keys.filter(k=>['linename','shiftdate','validpacks','packsmade','productstart','runid'].includes(k)).length*100+keys.filter(Boolean).length;
    if(points>score){score=points;at=i;}
   }
   const headers=grid[at]||[],keys=headers.map(canonical),shiftReadable=keys.includes('linename')&&keys.includes('shiftdate')&&(keys.includes('validpacks')||keys.includes('packsmade'));
   const relevant=/efficiency|detail/i.test(name)||keys.includes('linename');
   const cells=relevant?headers.slice(0,240).map((_,c)=>{const address=XLSX.utils.encode_cell({r:offset+at,c:columns+c}),cell=sheet[address];return{address,type:cell?.t,value:cell?.v,formatted:cell?.w,formula:cell?.f};}):[];
   return{name,hidden:wb.Workbook?.Sheets?.[index]?.Hidden||0,usedRange:sheet['!fullref']||range,previewRange:range,headerRow:at<0?null:offset+at+1,firstColumn:columns+1,headers:headers.slice(0,240),shiftReadable,headerCells:cells,topRows:relevant?grid.slice(0,12).map(r=>r.slice(0,240)):[],preview:relevant?grid.slice(at+1,at+5).map(r=>r.slice(0,240)):[]};
  });
 }catch(error){report.error=error.message||String(error);}
 self.postMessage(report);
};
