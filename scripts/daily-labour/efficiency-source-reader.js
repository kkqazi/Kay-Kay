/* The worker reads CSV as text, retaining UK dates and original source row numbers. */
async function parseEfficiencyBytes(bytes,meta){
 const csv=/\.csv$/i.test(meta.file||''),xmlBook=/\.xls[xm]$/i.test(meta.file||'');
 async function parseOnMain(){
  if(csv)return EO.parseCSV(new TextDecoder('utf-8').decode(bytes),meta);
  if(xmlBook)try{return await readEfficiencyWorkbook(bytes,meta,EO)}catch(error){if(error.code!=='NO_EFFICIENCY_SHEET')throw error;}
  const sheets=sourceGrid(XLSX.read(bytes,{type:'array',cellDates:false})),file=EO.parse(sheets,meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);return file;
 }
 if(typeof Worker==='undefined')return parseOnMain();
 const scripts=['lib-xlsx','daily-labour-engine','daily-efficiency-engine','daily-efficiency-diagnostics'].map(id=>document.getElementById(id)?.textContent);
 if(scripts.some(x=>!x))throw Error('The cockpit is missing its offline Efficiency or workbook parser.');
 const workerCode=scripts.join('\n;\n')+'\n'+readEfficiencyWorkbook.toString()+`\nself.onmessage=async e=>{try{let file;if(/\\.csv$/i.test(e.data.meta.file||'')){file=DailyEfficiencyEngine.parseCSV(new TextDecoder('utf-8').decode(e.data.bytes),e.data.meta);}else{if(/\\.xls[xm]$/i.test(e.data.meta.file||''))try{file=await readEfficiencyWorkbook(e.data.bytes,e.data.meta,DailyEfficiencyEngine)}catch(error){if(error.code!=='NO_EFFICIENCY_SHEET')throw error;}if(!file){const wb=XLSX.read(e.data.bytes,{type:'array',cellDates:false});const sheets=wb.SheetNames.map(name=>({name,date1904:!!wb.Workbook?.WBProps?.date1904,grid:XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,raw:true,defval:null,blankrows:true})}));file=DailyEfficiencyEngine.parse(sheets,e.data.meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);}}self.postMessage({file});}catch(error){self.postMessage({error:error.message||String(error)});}};`;
 const url=URL.createObjectURL(new Blob([workerCode],{type:'text/javascript'}));let worker;
 try{try{worker=new Worker(url);}catch(_){return parseOnMain();}return await new Promise((resolve,reject)=>{worker.onmessage=e=>e.data.error?reject(Error(e.data.error)):resolve(e.data.file);worker.onerror=e=>reject(Error(e.message||'Efficiency workbook worker failed'));worker.postMessage({bytes,meta},[bytes]);});}
 finally{worker?.terminate();URL.revokeObjectURL(url);}
}

/* Read only the required XLSX/XLSM XML entries, keeping large workbooks out of the cell-object parser. */
async function readEfficiencyWorkbook(bytes,meta,engine){
 const data=new Uint8Array(bytes),view=new DataView(data.buffer,data.byteOffset,data.byteLength),utf8=new TextDecoder('utf-8'),entries=new Map();
 const u16=n=>view.getUint16(n,true),u32=n=>view.getUint32(n,true),fail=message=>{throw Error(message);};
 let end=-1;for(let n=data.length-22;n>=Math.max(0,data.length-65557);n--)if(u32(n)===0x06054b50&&n+22+u16(n+20)===data.length){end=n;break;}
 if(end<0)fail('The workbook is not a readable XLSX/XLSM ZIP archive.');
 if(u16(end+4)||u16(end+6))fail('Multi-part workbook archives are not supported.');
 let pointer=u32(end+16);const count=u16(end+10);
 if(count===65535||pointer===0xffffffff)fail('ZIP64 workbooks require a different reader.');
 for(let i=0;i<count;i++){
  if(pointer+46>data.length||u32(pointer)!==0x02014b50)fail('Workbook ZIP directory is incomplete.');
  const length=u16(pointer+28),name=utf8.decode(data.subarray(pointer+46,pointer+46+length)),entry={name,flags:u16(pointer+8),method:u16(pointer+10),crc:u32(pointer+16),size:u32(pointer+20),uncompressed:u32(pointer+24),offset:u32(pointer+42)};
  if(entry.size===0xffffffff||entry.uncompressed===0xffffffff||entry.offset===0xffffffff)fail('ZIP64 workbook entries require a different reader.');
  entries.set(name,entry);pointer+=46+length+u16(pointer+30)+u16(pointer+32);
 }
 const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 async function* chunks(name){
  const entry=entries.get(name);if(!entry)fail('Workbook entry is missing: '+name);if(entry.flags&1)fail('Open an unencrypted Efficiency workbook.');
  if(entry.offset+30>data.length||u32(entry.offset)!==0x04034b50)fail('Invalid workbook ZIP entry: '+name);
  const start=entry.offset+30+u16(entry.offset+26)+u16(entry.offset+28);if(start+entry.size>data.length)fail('Workbook ZIP entry is truncated: '+name);
  let stream=new Blob([data.subarray(start,start+entry.size)]).stream();
  if(entry.method===8){if(typeof DecompressionStream==='undefined')fail('Use a current version of Edge or Chrome to read this workbook.');stream=stream.pipeThrough(new DecompressionStream('deflate-raw'));}
  else if(entry.method!==0)fail('Unsupported workbook compression method '+entry.method+'.');
  const reader=stream.getReader();let crc=0xffffffff,total=0;
  try{while(true){const result=await reader.read();if(result.done)break;const chunk=result.value;total+=chunk.length;for(let i=0;i<chunk.length;i++)crc=crcTable[(crc^chunk[i])&255]^(crc>>>8);yield chunk;}}
  finally{reader.releaseLock();}
  if(total!==entry.uncompressed||((crc^0xffffffff)>>>0)!==entry.crc)fail('Workbook integrity check failed for '+name+'. The previous report is retained.');
 }
 async function xml(name){const decoder=new TextDecoder('utf-8');let text='';for await(const chunk of chunks(name))text+=decoder.decode(chunk,{stream:true});return text+decoder.decode();}
 // Decode XML once; neither XML entities nor formulas execute.
 const unescape=text=>String(text??'').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(whole,key)=>{if(key[0]==='#'){const n=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):parseInt(key.slice(1),10);return Number.isFinite(n)&&n>=0&&n<=0x10ffff?String.fromCodePoint(n):whole;}return{amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[key]??whole;});
 const attributes=text=>{const out={};for(const m of text.matchAll(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))out[m[1]]=unescape(m[2]??m[3]);return out;};
 const path=(base,target)=>{if(target.startsWith('/'))return target.slice(1);const parts=base.split('/').slice(0,-1);for(const p of target.split('/')){if(p==='..')parts.pop();else if(p&&p!=='.')parts.push(p);}return parts.join('/');};
 const workbookEntry='xl/workbook.xml';if(!entries.has(workbookEntry))fail('No XML workbook found. Choose the normal XLSM or XLSX file.');
 const workbook=await xml(workbookEntry),relations=await xml('xl/_rels/workbook.xml.rels'),sheets=[...workbook.matchAll(/<(?:\w+:)?sheet\b([^>]*?)\/?\s*>/g)].map(m=>attributes(m[1]));
 const primary=sheets.find(s=>String(s.name).trim().toLowerCase()==='efficiency');if(!primary){const error=Error('No worksheet named Efficiency.');error.code='NO_EFFICIENCY_SHEET';throw error;}
 const links=[...relations.matchAll(/<(?:\w+:)?Relationship\b([^>]*?)\/?\s*>/g)].map(m=>attributes(m[1])),relation=links.find(r=>r.Id===primary['r:id']);
 if(!relation||relation.TargetMode==='External')fail('The Efficiency worksheet relationship is not readable.');
 const sheetPath=path(workbookEntry,relation.Target),props=/<(?:\w+:)?workbookPr\b([^>]*?)\/?\s*>/.exec(workbook),date1904=props?['1','true'].includes(attributes(props[1]).date1904):false,strings=[];
 async function* records(name,tag){
  const decoder=new TextDecoder('utf-8'),open=new RegExp('<(?:[\\w.-]+:)?'+tag+'(?=[\\s/>])'),close=new RegExp('</(?:[\\w.-]+:)?'+tag+'\\s*>');let pending='';
  function take(){const result=[];while(true){const start=pending.search(open);if(start<0){if(pending.length>1024)pending=pending.slice(-1024);break;}if(start)pending=pending.slice(start);const openingEnd=pending.indexOf('>');if(openingEnd<0)break;const finish=close.exec(pending),selfClosing=pending[openingEnd-1]==='/';if(!selfClosing&&!finish)break;const at=selfClosing?openingEnd+1:finish.index+finish[0].length;result.push(pending.slice(0,at));pending=pending.slice(at);}return result;}
  for await(const chunk of chunks(name)){pending+=decoder.decode(chunk,{stream:true});for(const record of take())yield record;}
  pending+=decoder.decode();for(const record of take())yield record;if(open.test(pending))fail('Incomplete '+tag+' XML in '+name+'.');
 }
 const texts=xmlText=>[...xmlText.matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t\s*>/g)].map(m=>unescape(m[1])).join('');
 const sst=links.find(r=>/\/sharedStrings$/.test(r.Type||'')),sharedPath=sst?path(workbookEntry,sst.Target):'xl/sharedStrings.xml';
 if(entries.has(sharedPath))for await(const record of records(sharedPath,'si'))strings.push(texts(record));
 const grid=[],sourceRows=[],sheet={name:primary.name,grid,sourceRows,date1904};let H=null,wanted=null,first=null,last=null,totalRows=0,outputRows=0,blankRows=0;
 const selected=meta.productionDate||null;if(selected)engine.productionDate(selected)||fail('Select a valid production date.');
 for await(const rowXML of records(sheetPath,'row')){
  const rowTag=/<(?:\w+:)?row\b([^>]*)>/.exec(rowXML),rowNumber=+attributes(rowTag[1]).r;if(!Number.isInteger(rowNumber)||rowNumber<1)fail('A worksheet row has no valid row number.');
  const values=[];
  for(const cell of rowXML.matchAll(/<(?:\w+:)?c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:\w+:)?c\s*>)/g)){
   const a=attributes(cell[1]),letters=/^([A-Z]+)\d+$/.exec(a.r||'');if(!letters)continue;let c=0;for(const letter of letters[1])c=c*26+letter.charCodeAt(0)-64;c--;
   if(wanted&&!wanted.has(c))continue;const body=cell[2]||'',value=/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v\s*>/.exec(body)?.[1];
   if(a.t==='inlineStr')values[c]=texts(body);
   else if(a.t==='s'){const i=Number(value);if(value===undefined||value.trim()===''||!Number.isInteger(i)||strings[i]===undefined)fail('A workbook shared string is missing.');values[c]=strings[i];}
   else if(value!==undefined){const v=unescape(value);values[c]=!a.t||a.t==='n'?v.trim()===''?null:Number(v):v;}
  }
  if(!H){grid.push(values);sourceRows.push(rowNumber);H=engine.efficiencyHeader(sheet);if(H){wanted=new Set([H.line,H.shift,H.output,...['Run ID','Area','1 Code','Product Description','Packs Made','Pack Count Adjustment','Pack Count','Days Nights'].map(n=>H.keys.indexOf(n.toLowerCase().replace(/[^a-z0-9]/g,''))).filter(n=>n>=0)]);}
   else if(grid.length>=100)fail('Efficiency worksheet headings could not be read. The old Detail sheets have not been substituted.');continue;
  }
  totalRows++;const line=String(values[H.line]??'').trim();if(!line||/^(?:grand\s*)?total\b/i.test(line)){blankRows++;continue;}if(line.toLowerCase().replace(/[^a-z0-9]/g,'')==='linename')continue;
  outputRows++;const pd=engine.productionDate(values[H.shift],date1904);if(pd){if(!first||pd<first)first=pd;if(!last||pd>last)last=pd;}if(selected&&pd&&pd!==selected)continue;grid.push(values);sourceRows.push(rowNumber);
 }
 if(!H)fail('The Efficiency worksheet has no readable production headings.');
 if(grid.length===H.at+1)fail('No Efficiency output rows match production date '+selected+'. Source dates: '+(first||'unknown')+' to '+(last||'unknown')+'. The previous report is retained.');
 const parsed=engine.parse([sheet],meta);parsed.meta.sourceType='XLSX/XLSM Efficiency worksheet';parsed.meta.reader='Selected worksheet XML; ZIP CRC verified';parsed.meta.sourceSelection={productionDate:selected,rule:'Printed Shift Date',sourceOutputRows:outputRows,selectedRows:parsed.rows.length};parsed.meta.sourceDataRows=totalRows;parsed.meta.skippedBlankOrTotalRows=blankRows;parsed.meta.observedFirstDate=first;parsed.meta.observedLastDate=last;parsed.meta.ignoredSheets=sheets.filter(s=>s!==primary).map(s=>s.name);parsed.meta.mapping[0].headerRow=sourceRows[H.at];
 parsed.meta.sheetInspection=[{name:primary.name,headerRow:sourceRows[H.at],headers:H.headers,date1904,worksheetRows:totalRows+H.at+1,topRows:grid.slice(0,H.at+1),preview:grid.slice(H.at+1,H.at+5),previewOnly:true}];return parsed;
}

if(typeof module!=='undefined'&&module.exports)module.exports=readEfficiencyWorkbook;
