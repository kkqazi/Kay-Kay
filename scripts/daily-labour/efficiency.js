/* Phase 2: inspected run output, independent of the legacy financial engine. */
(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./engine.js'):root.DailyLabourEngine;
const OUTPUT='Valid Packs',num=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;
const unitFromLine=line=>/^Unit\s+([ABCDK])\b/i.exec(String(line??'').trim())?.[1].toUpperCase()||'Unknown';
function date(value,date1904){return E.timestamp(typeof value==='number'&&date1904?value+1462:value);}
function parse(sheets,meta={}){
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
function output(model,dateString){
 const W=E.windowFor(dateString),ids=model.dayEfficiency?.[dateString]||[],files=(model.efficiencyFiles||[]).filter(f=>ids.includes(f.meta.id)),rows=[],exceptions=[],groups=new Map(),blocked=new Set(),bounds=[];
 const flag=(type,r,detail)=>exceptions.push({type,clock:'',name:'',unit:r.unit,runId:r.runId,sheet:r.sheet,row:r.row,detail,level:'Review'});
 for(const f of files)for(const source of f.rows){const r={...source,file:f.meta.file,fileId:f.meta.id};let state='Included';
  if(r.start!==null&&r.end!==null&&!(r.start<W.end&&r.end>W.start))state='Outside window';
  else if(r.issues.length){state='Invalid – review';blocked.add(r.unit);for(const x of r.issues)flag('Efficiency: '+x,r,r.file+' · '+r.sheet+':'+r.row);}
  else if(r.start<W.start||r.end>W.end){state='Boundary run – unallocated';blocked.add(r.unit);flag('Efficiency: run crosses production-day boundary',r,'Run totals cannot be split into actual in-window output; no prorating. '+r.startWall+' → '+r.endWall);}
  r.state=state;rows.push(r);if(state==='Outside window'||state==='Invalid – review')continue;
  if(r.areaMismatch)flag('Efficiency: Area differs from Line Name',r,`Line unit ${r.unit}; Area ${r.sourceArea}. Grouping uses physical Line Name, with Area retained.`);
  if(r.arithmeticMismatch){blocked.add(r.unit);flag('Efficiency: Valid Packs adjustment check failed',r,'Valid Packs differs from Packs Made + Pack Count Adjustment. Source value retained pending review.');}
  if(state==='Boundary run – unallocated'){bounds.push(r);continue;}
  const identity=r.runId;if(!groups.has(identity))groups.set(identity,[]);groups.get(identity).push(r);
 }
 const included=[];let duplicates=0;
 const signature=r=>JSON.stringify([r.start,r.end,r.line,r.sku,r.units,r.packsMade,r.adjustment,r.sourceArea]);
 for(const same of groups.values()){if(new Set(same.map(signature)).size>1){for(const r of same){r.state='Conflicting Run ID – review';blocked.add(r.unit);flag('Efficiency: conflicting duplicate Run ID',r,'Different run values share Run ID '+r.runId+'; excluded until the selected source is corrected.');}}else{included.push(same[0]);for(const r of same.slice(1)){r.state='Duplicate – excluded';duplicates++;flag('Efficiency: duplicate run excluded',r,'Run ID '+r.runId+' counted once.');}}}
 const byUnit={};for(const u of ['A','B','C','D','K','Unknown']){const rs=included.filter(r=>r.unit===u);byUnit[u]={runs:rs.length,units:rs.reduce((n,r)=>n+r.units,0),blocked:blocked.has(u),areaDifferences:rows.filter(r=>r.unit===u&&r.state!=='Outside window'&&r.areaMismatch).length};}
 return {W,files:files.map(f=>f.meta),rows,included,byUnit,blocked:[...blocked],exceptions,duplicates,boundaryRuns:bounds.length,totalReportedUnits:included.reduce((n,r)=>n+r.units,0),outputField:OUTPUT,unitBasis:'Line Name',available:files.length>0};
}
function apply(model,labour){
 const eff=output(model,labour.W.date),activeUnits=['A','B','C',...['D','K'].filter(u=>model.rosters?.[u])];
 for(const a of labour.areas){const units=a.area==='SITE'?activeUnits:a.area==='ABC'?['A','B','C']:[a.area],recorded=units.reduce((n,u)=>n+(eff.byUnit[u]?.runs||0),0),total=units.reduce((n,u)=>n+(eff.byUnit[u]?.units||0),0),unknown=eff.blocked.includes('Unknown'),blocked=unknown||units.some(u=>eff.blocked.includes(u)),missing=units.filter(u=>{const l=labour.areas.find(x=>x.area===u);return (l?.dlHours||0)>0&&!eff.byUnit[u]?.runs;});
  a.units=eff.available&&recorded?total:null;a.productionDlHours=Math.max(0,a.dlHours-a.prepHours);a.outputRuns=recorded;a.outputField=OUTPUT;a.outputBlocked=blocked||missing.length>0;a.outputStatus=!eff.available?'Awaiting Efficiency':a.outputBlocked?'Incomplete output – review':recorded?'Reported Valid Packs':'No recorded runs';
  const denominatorAvailable=labour.coverage.files.length>0&&!a.status.startsWith('Future'),ready=denominatorAvailable&&a.units!==null&&!a.outputBlocked;
  a.uplh=ready&&a.dlHours>0?a.units/a.dlHours:null;a.productionUplh=ready&&a.productionDlHours>0?a.units/a.productionDlHours:null;
 }
 labour.efficiency=eff;labour.exceptions.push(...eff.exceptions);return labour;
}
const api={parse,output,apply,unitFromLine,outputField:OUTPUT};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DailyEfficiencyEngine=api;
})(typeof window==='undefined'?globalThis:window);
