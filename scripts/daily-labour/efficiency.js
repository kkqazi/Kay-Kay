/* Phase 2: inspected run output, independent of the legacy financial engine. */
(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.DailyLabourEngine;
const OUTPUT='Valid Packs',num=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
const unitFromLine=line=>/^Unit\s+([ABCDK])\b/i.exec(String(line??'').trim())?.[1].toUpperCase()||'Unknown';
function date(value,date1904){return E.timestamp(typeof value==='number'&&date1904?value+1462:value);}
function productionDate(value,date1904){
 if(typeof value==='string'&&/^\d+(?:\.\d+)?$/.test(value.trim())&&+value>=1&&+value<=2958465)value=+value;
 let d;if(typeof value==='number'&&Number.isFinite(value)){d=new Date(Date.UTC(1899,11,30)+Math.floor(value+(date1904?1462:0))*864e5).toISOString().slice(0,10);}
 else if(value instanceof Date)d=value.toISOString().slice(0,10);
 else{const text=String(value??'').trim(),iso=/^(\d{4})-(\d\d)-(\d\d)(?:$|[ T])/.exec(text),uk=/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:$|[ T])/.exec(text);if(iso)d=iso[1]+'-'+iso[2]+'-'+iso[3];else if(uk)d=(uk[3].length===2?'20'+uk[3]:uk[3])+'-'+uk[2].padStart(2,'0')+'-'+uk[1].padStart(2,'0');}
 try{return d&&E.addDate(d,0)===d?d:null}catch{return null;}
}
function efficiencyHeader(sheet){
 for(let i=0;i<Math.min(sheet.grid.length,100);i++){const keys=(sheet.grid[i]||[]).map(E.header),find=names=>names.map(E.header).map(x=>keys.indexOf(x)).find(x=>x>=0)??-1;
  const line=find(['Line Name']),shift=find(['Shift Date','Operational Date','Production Shift Date','Date of Shift']),valid=find(['Valid Packs']),made=find(['Packs Made']);
  if(line>=0&&shift>=0&&(valid>=0||made>=0))return{at:i,headers:sheet.grid[i],keys,line,shift,output:valid>=0?valid:made,outputField:valid>=0?'Valid Packs':'Packs Made'};
 }return null;
}
function parseShiftSheet(sheet,H,meta){
 const rows=[],errors=[],dates=new Set(),index=name=>H.keys.indexOf(E.header(name)),ix=Object.fromEntries(['Run ID','Area','1 Code','Product Description','Packs Made','Pack Count Adjustment','Pack Count','Days Nights'].map(n=>[n,index(n)]));
 for(let i=H.at+1;i<sheet.grid.length;i++){const values=sheet.grid[i]||[],line=String(values[H.line]??'').trim();if(!line||/^(?:grand\s*)?total\b/i.test(line)||E.header(line)==='linename')continue;const get=n=>ix[n]>=0?values[ix[n]]:null,pd=productionDate(values[H.shift],sheet.date1904),unit=unitFromLine(line),units=num(values[H.output]),packsMade=num(get('Packs Made')),adjustment=num(get('Pack Count Adjustment')),sourceArea=String(get('Area')??'').trim().toUpperCase(),issues=[];
  if(!pd)issues.push('Missing / invalid Shift Date');if(units===null||units<0)issues.push('Missing / invalid '+H.outputField);if(unit==='Unknown')issues.push('Unmapped production line unit');if(pd)dates.add(pd);
  const sourceRunId=String(get('Run ID')??'').trim(),sourceRow=sheet.sourceRows?.[i]??i+1,runId=sourceRunId||'shift:'+sheet.name+':'+sourceRow,row={runId,sourceRunId,identityBasis:sourceRunId?'Run ID':'worksheet and source row',productionDate:pd,dateBasis:'Shift Date',outputField:H.outputField,start:null,end:null,startWall:pd||String(values[H.shift]??''),endWall:'',unit,line,sourceArea,sku:String(get('1 Code')??''),description:String(get('Product Description')??''),units,packsMade,adjustment,packCount:num(get('Pack Count')),shift:String(get('Days Nights')??''),efficiencyLabourHours:null,sourceUplh:null,areaMismatch:!!sourceArea&&sourceArea!==unit,arithmeticMismatch:H.outputField==='Valid Packs'&&packsMade!==null&&adjustment!==null&&units!==null&&Math.abs(packsMade+adjustment-units)>1e-8,issues,sheet:sheet.name,row:sourceRow};rows.push(row);if(issues.length)errors.push({sheet:sheet.name,row:sourceRow,runId,issues});
 }
 if(!rows.length)throw Error('The Efficiency tab contains no output rows. Check Shift Date, Line Name and '+H.outputField+'.');const ordered=[...dates].sort();
 return{rows,meta:{...meta,outputField:H.outputField,dateBasis:'Shift Date',unitBasis:'Line Name (physical production unit)',timeBasis:'Printed production Shift Date; no run timestamps inferred',rowCount:rows.length,mapping:[{sheet:sheet.name,headerRow:H.at+1,columns:{'Line Name':H.line+1,'Shift Date':H.shift+1,[H.outputField]:H.output+1},headers:H.headers,outputField:H.outputField,date1904:!!sheet.date1904}],ignoredSheets:[],errors,observedFrom:null,observedTo:null,observedFirstDate:ordered[0]||null,observedLastDate:ordered.at(-1)||null,completeness:'Reported output rows; full-day completeness is not inferred'}};
}
function parse(sheets,meta={}){
 const primary=sheets.find(s=>String(s.name).trim().toLowerCase()==='efficiency');if(primary){const header=efficiencyHeader(primary);if(header){const parsed=parseShiftSheet(primary,header,meta);parsed.meta.ignoredSheets=sheets.filter(s=>s!==primary).map(s=>s.name);return parsed;}const timed=primary.grid.slice(0,60).some(r=>{const k=(r||[]).map(E.header);return k.includes('productstart')&&k.includes('linename')});if(!timed)throw Error('Efficiency tab found, but its Shift Date / Line Name / Packs Made headers could not be identified. The old Detail sheets have not been substituted.');sheets=[primary];}
 const rows=[],mapping=[],ignoredSheets=[],errors=[];
 for(const sheet of sheets){let at=-1,headers=[];for(let i=0;i<Math.min(sheet.grid.length,30);i++){const keys=(sheet.grid[i]||[]).map(E.header);if(keys.includes('productstart')&&keys.includes('linename')){at=i;headers=sheet.grid[i];break;}}if(at<0){ignoredSheets.push(sheet.name);continue;}
  const keys=headers.map(E.header),index=n=>keys.indexOf(E.header(n));
  const required=['Product Start','Product End','Line Name','Run ID',OUTPUT];const missing=required.filter(n=>index(n)<0);if(missing.length)throw Error(sheet.name+': missing '+missing.join(', ')+'. Output is explicitly Valid Packs; no Packs Made fallback is applied.');
  const ix=Object.fromEntries(['Product Start','Product End','Line Name','Run ID',OUTPUT,'Packs Made','Pack Count Adjustment','Pack Count','Area','1 Code','Product Description','Shift Date','Actual Labour Hours','Actual UPLH'].map(n=>[n,index(n)]));
  mapping.push({sheet:sheet.name,headerRow:at+1,columns:Object.fromEntries(Object.entries(ix).map(([n,i])=>[n,i<0?null:i+1])),headers,outputField:OUTPUT,unitBasis:'Physical unit from Line Name',date1904:!!sheet.date1904});
  for(let i=at+1;i<sheet.grid.length;i++){const values=sheet.grid[i]||[];if(values.every(v=>v===null||v===undefined||v===''))continue;const get=n=>ix[n]>=0?values[ix[n]]:null;
   if(/^total\b/i.test(String(get('Product Start')??''))&&!get('Run ID'))continue;
   const start=date(get('Product Start'),sheet.date1904),end=date(get('Product End'),sheet.date1904),line=String(get('Line Name')??'').trim(),unit=unitFromLine(line),units=num(get(OUTPUT)),packsMade=num(get('Packs Made')),adjustment=num(get('Pack Count Adjustment')),runId=String(get('Run ID')??'').trim(),issues=[];
   if(!Number.isFinite(start.ms)||!Number.isFinite(end.ms)||end.ms<start.ms)issues.push('Missing / invalid run timestamp');
   if(start.ambiguous||end.ambiguous)issues.push('Ambiguous daylight-saving run timestamp');
   if(!runId)issues.push('Missing Run ID');if(units===null||units<0)issues.push('Missing / invalid Valid Packs');if(unit==='Unknown')issues.push('Unmapped production line unit');
   const sourceArea=String(get('Area')??'').trim().toUpperCase();
   rows.push({runId,start:Number.isFinite(start.ms)?start.ms:null,end:Number.isFinite(end.ms)?end.ms:null,startWall:Number.isFinite(start.ms)?E.civil(start.ms):String(get('Product Start')??''),endWall:Number.isFinite(end.ms)?E.civil(end.ms):String(get('Product End')??''),unit,line,sourceArea,sku:String(get('1 Code')??''),description:String(get('Product Description')??''),units,packsMade,adjustment,packCount:num(get('Pack Count')),efficiencyLabourHours:num(get('Actual Labour Hours')),sourceUplh:num(get('Actual UPLH')),areaMismatch:!!sourceArea&&sourceArea!==unit,arithmeticMismatch:packsMade!==null&&adjustment!==null&&units!==null&&Math.abs(packsMade+adjustment-units)>1e-8,issues,sheet:sheet.name,row:i+1});
   if(issues.length)errors.push({sheet:sheet.name,row:i+1,runId,issues});
  }
 }
 if(!rows.length)throw Error('No production-run rows found. Required headers: Product Start, Product End, Line Name, Run ID, Valid Packs.');
 const times=rows.flatMap(r=>[r.start,r.end]).filter(Number.isFinite);
 return {rows,meta:{...meta,outputField:OUTPUT,unitBasis:'Line Name (physical production unit)',timeBasis:'Product Start / Product End, Europe/London',rowCount:rows.length,mapping,ignoredSheets,errors,observedFrom:times.length?Math.min(...times):null,observedTo:times.length?Math.max(...times):null,completeness:'Imported run rows; full export completeness not inferred from first/last run'}};
}
// CSV is read as text: Excel/US date auto-conversion must not change UK Shift Dates.
function* csvRecords(text){
 text=String(text).replace(/^\uFEFF/,'');let fields=[],value='',quoted=false,record=1;
 const first=text.slice(0,text.search(/[\r\n]/)<0?text.length:text.search(/[\r\n]/)),separator=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else quoted=false;}else value+=c;}
  else if(c==='"'&&value==='')quoted=true;
  else if(c===separator){fields.push(value);value='';}
  else if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;fields.push(value);yield{row:record++,values:fields};fields=[];value='';}
  else value+=c;
 }
 if(quoted)throw Error('The CSV ends inside a quoted field. Export a complete CSV UTF-8 copy.');
 if(value!==''||fields.length){fields.push(value);yield{row:record,values:fields};}
}
function parseCSV(text,meta={}){
 const sheet={name:'Efficiency CSV',grid:[],sourceRows:[]};let H=null,sourceRows=0,outputRows=0,matchedRows=0,blankRows=0,first=null,last=null;
 const selected=meta.productionDate||null;if(selected)E.windowFor(selected);
 for(const record of csvRecords(text)){
  const values=record.values;if(!H){sheet.grid.push(values);sheet.sourceRows.push(record.row);H=efficiencyHeader(sheet);if(!H&&sheet.grid.length>=60)throw Error('CSV headings not recognised. Export the Efficiency tab with Shift Date, Line Name and Valid Packs / Packs Made.');continue;}
  sourceRows++;const line=String(values[H.line]??'').trim();if(!line||/^(?:grand\s*)?total\b/i.test(line)){blankRows++;continue;}
  const pd=productionDate(values[H.shift],false);if(E.header(line)==='linename')continue;outputRows++;if(pd){if(!first||pd<first)first=pd;if(!last||pd>last)last=pd;}
  // Keep original row numbers and only the selected day's rows, plus undated rows for review.
  if(selected&&pd&&pd!==selected)continue;matchedRows++;sheet.grid.push(values);sheet.sourceRows.push(record.row);
 }
 if(!H)throw Error('CSV headings not recognised. Export the Efficiency tab with Shift Date, Line Name and Valid Packs / Packs Made.');
 if(!matchedRows)throw Error('No Efficiency CSV output rows match production date '+(selected||'(not selected)')+'. Source dates: '+(first||'unknown')+' to '+(last||'unknown')+'. The previous report has been retained.');
 const parsed=parseShiftSheet(sheet,H,meta);parsed.meta.sourceType='CSV UTF-8';parsed.meta.sourceSelection=selected?{productionDate:selected,rule:'Printed Shift Date',sourceOutputRows:outputRows,selectedRows:matchedRows}:null;parsed.meta.sourceDataRows=sourceRows;parsed.meta.skippedBlankOrTotalRows=blankRows;parsed.meta.observedFirstDate=first;parsed.meta.observedLastDate=last;
 parsed.meta.sheetInspection=[{name:sheet.name,headerRow:sheet.sourceRows[H.at],headers:H.headers,worksheetRows:sourceRows+H.at+1,topRows:sheet.grid.slice(0,H.at+1),preview:sheet.grid.slice(H.at+1,H.at+7),previewOnly:true,date1904:false}];
 return parsed;
}
function output(model,dateString){
 const W=E.windowFor(dateString),ids=model.dayEfficiency?.[dateString]||[],files=(model.efficiencyFiles||[]).filter(f=>ids.includes(f.meta.id)),rows=[],exceptions=[],groups=new Map(),blocked=new Set(),bounds=[];
 const flag=(type,r,detail)=>exceptions.push({type,clock:'',name:'',unit:r.unit,runId:r.runId,sheet:r.sheet,row:r.row,detail,level:'Review'});
 for(const f of files)for(const source of f.rows){const r={...source,file:f.meta.file,fileId:f.meta.id};let state='Included';
  if(r.dateBasis==='Shift Date'&&r.productionDate&&r.productionDate!==dateString)state='Outside window';
  else if(r.dateBasis!=='Shift Date'&&r.start!==null&&r.end!==null&&!(r.start<W.end&&r.end>W.start))state='Outside window';
  else if(r.issues.length){state='Invalid – review';blocked.add(r.unit);for(const x of r.issues)flag('Efficiency: '+x,r,r.file+' · '+r.sheet+':'+r.row);}
  else if(r.dateBasis!=='Shift Date'&&(r.start<W.start||r.end>W.end)){state='Boundary run – unallocated';blocked.add(r.unit);flag('Efficiency: run crosses production-day boundary',r,'Run totals cannot be split into actual in-window output; no prorating. '+r.startWall+' → '+r.endWall);}
  r.state=state;rows.push(r);if(state==='Outside window'||state==='Invalid – review')continue;
  if(r.areaMismatch)flag('Efficiency: Area differs from Line Name',r,`Line unit ${r.unit}; Area ${r.sourceArea}. Grouping uses physical Line Name, with Area retained.`);
  if(r.arithmeticMismatch){blocked.add(r.unit);flag('Efficiency: Valid Packs adjustment check failed',r,'Valid Packs differs from Packs Made + Pack Count Adjustment. Source value retained pending review.');}
  if(state==='Boundary run – unallocated'){bounds.push(r);continue;}
  const identity=r.runId;if(!groups.has(identity))groups.set(identity,[]);groups.get(identity).push(r);
 }
 const included=[];let duplicates=0;
 const signature=r=>JSON.stringify([r.dateBasis||'Product Start / Product End',r.productionDate||null,r.start,r.end,r.line,r.sku,r.units,r.packsMade,r.adjustment,r.sourceArea]);
 for(const same of groups.values()){if(new Set(same.map(signature)).size>1){for(const r of same){r.state='Conflicting Run ID – review';blocked.add(r.unit);flag('Efficiency: conflicting duplicate Run ID',r,'Different run values share Run ID '+r.runId+'; excluded until the selected source is corrected.');}}else{included.push(same[0]);for(const r of same.slice(1)){r.state='Duplicate – excluded';duplicates++;flag('Efficiency: duplicate run excluded',r,'Run ID '+r.runId+' counted once.');}}}
 const fields=[...new Set(files.map(f=>f.meta.outputField||OUTPUT))],bases=[...new Set(files.map(f=>f.meta.dateBasis||'Product Start / Product End'))];if(fields.length>1||bases.length>1)for(const r of included){blocked.add(r.unit);flag('Efficiency: mixed output definitions',r,'Selected sources use different output fields or date bases. Select one consistent report before calculating UPLH.');}
 const byUnit={};for(const u of ['A','B','C','D','K','Unknown']){const rs=included.filter(r=>r.unit===u);byUnit[u]={runs:rs.length,units:rs.reduce((n,r)=>n+r.units,0),blocked:blocked.has(u),areaDifferences:rows.filter(r=>r.unit===u&&r.state!=='Outside window'&&r.areaMismatch).length};}
 return {W,files:files.map(f=>f.meta),rows,included,byUnit,blocked:[...blocked],exceptions,duplicates,boundaryRuns:bounds.length,totalReportedUnits:included.reduce((n,r)=>n+r.units,0),outputField:fields.length===1?fields[0]:fields.length?'Mixed output (review)':OUTPUT,dateBasis:bases.length===1?bases[0]:bases.length?'Mixed date bases':'Product Start / Product End',unitBasis:'Line Name',available:files.length>0};
}
function apply(model,labour){
 const eff=output(model,labour.W.date),activeUnits=['A','B','C',...['D','K'].filter(u=>model.rosters?.[u])];
 for(const a of labour.areas){const units=a.area==='SITE'?activeUnits:a.area==='ABC'?['A','B','C']:[a.area],recorded=units.reduce((n,u)=>n+(eff.byUnit[u]?.runs||0),0),total=units.reduce((n,u)=>n+(eff.byUnit[u]?.units||0),0),unknown=eff.blocked.includes('Unknown'),blocked=unknown||units.some(u=>eff.blocked.includes(u)),missing=units.filter(u=>{const l=labour.areas.find(x=>x.area===u);return (l?.dlHours||0)>0&&!eff.byUnit[u]?.runs;});
  a.units=eff.available&&recorded?total:null;a.productionDlHours=Math.max(0,a.dlHours-a.prepHours);a.outputRuns=recorded;a.outputField=eff.outputField;a.outputBlocked=blocked||missing.length>0;a.outputStatus=!eff.available?'Awaiting Efficiency':a.outputBlocked?'Incomplete output – review':recorded?'Reported '+eff.outputField:'No recorded runs';
  const denominatorAvailable=labour.coverage.files.length>0&&!a.status.startsWith('Future'),ready=denominatorAvailable&&a.units!==null&&!a.outputBlocked;
  a.uplh=ready&&a.dlHours>0?a.units/a.dlHours:null;a.productionUplh=ready&&a.productionDlHours>0?a.units/a.productionDlHours:null;
 }
 labour.efficiency=eff;labour.exceptions.push(...eff.exceptions);return labour;
}
const api={parse,parseCSV,efficiencyHeader,output,apply,unitFromLine,productionDate,outputField:OUTPUT};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DailyEfficiencyEngine=api;
})(typeof window==='undefined'?globalThis:window);
