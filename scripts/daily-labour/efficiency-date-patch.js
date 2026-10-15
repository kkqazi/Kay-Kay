/* Code-only patch; no saved business records are embedded or rewritten. */
(function(root){
'use strict';
function patchEfficiencyDates(source,diagnostics,picker,efficiencyEngine,sourceReader){
 const rx=/<script\b[^>]*\bid=["']daily-labour-module["'][^>]*>([\s\S]*?)<\/script\s*>/gi,matches=[...source.matchAll(rx)];if(matches.length!==1)throw Error('Choose a saved cockpit with one Daily Labour module. Your file has not been changed.');
 let code=matches[0][1];const marker='/* Efficiency source-date checks v1 */';
 const once=(a,b)=>{if(code.split(a).length!==2)throw Error('This Daily Labour version needs a different updater. Your file has not been changed.');code=code.replace(a,()=>b);};
 if(!code.includes(marker)){
  const start=code.indexOf('function efficiencyPicker(){'),end=code.indexOf('function previewRoster(',start);if(start<0||end<0)throw Error('Efficiency upload preview not found.');code=code.slice(0,start)+marker+'\n'+picker+'\n'+code.slice(end);
  once("async function parseEfficiencyBytes(bytes,meta){", "async function parseEfficiencyBytes(bytes,meta){\n function parseOnMain(){const sheets=sourceGrid(XLSX.read(bytes,{type:'array',cellDates:false})),file=EO.parse(sheets,meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);return file;}");
  const fallback="return EO.parse(sourceGrid(XLSX.read(bytes,{type:'array',cellDates:false})),meta);";if(code.split(fallback).length!==3)throw Error('Expected workbook parser fallbacks not found.');code=code.split(fallback).join('return parseOnMain();');
  once("['lib-xlsx','daily-labour-engine','daily-efficiency-engine']", "['lib-xlsx','daily-labour-engine','daily-efficiency-engine','daily-efficiency-diagnostics']");
  once('self.postMessage({file:DailyEfficiencyEngine.parse(sheets,e.data.meta)});','const file=DailyEfficiencyEngine.parse(sheets,e.data.meta);file.meta.sheetInspection=DailyEfficiencyDiagnostics.inspectSheets(sheets);self.postMessage({file});');
  once(" const eff=r.efficiency,sourceCard=box("," const eff=r.efficiency,sourceCard=box(");
  const audit=" sourceCard.appendChild(message('ABC '+num(";if(code.split(audit).length!==2)throw Error('Efficiency source audit not found.');code=code.replace(audit,()=>" const efficiencyDiagnosis=DailyEfficiencyDiagnostics.inspect(eff,E);sourceCard.appendChild(message(efficiencyDiagnosis.message));sourceCard.appendChild(table(cols([['file','Workbook'],['sheets','Imported worksheets'],['from','First source date / start'],['to','Last source date / end'],['rows','Imported runs',1,0]]),efficiencyDiagnosis.files));\n"+audit);
  const banner=" const available=!!r.coverage.files.length";if(code.split(banner).length!==2)throw Error('Flash KPI section not found.');code=code.replace(banner,()=>" const sourceDiagnosis=DailyEfficiencyDiagnostics.inspect(r.efficiency,E);if(r.efficiency.available&&!sourceDiagnosis.acceptable)host.appendChild(UI.banner(esc(sourceDiagnosis.message),'warn'));\n"+banner);
 }
 if(!code.includes('/* Efficiency output labels v1 */')){
  const optional=(a,b)=>{code=code.split(a).join(b);};
  optional("['Valid Packs reported',num(a.units,0)","[(a.outputField||'Output')+' reported',num(a.units,0)");
  optional("+'. Reported Valid Packs are paired","+'. Reported '+esc(r.efficiency.outputField)+' are paired");
  optional("'Valid Packs ÷ Flash DL hours · agency estimates provisional'","(a.outputField||'Output')+' ÷ Flash DL hours · agency estimates provisional'");
  optional("'Valid Packs ÷ (DL hours − Prep DL hours)'","(a.outputField||'Output')+' ÷ (DL hours − Prep DL hours)'");
  optional("+' Valid Packs. Flash DL UPLH:","+' '+esc(a.outputField)+'. Flash DL UPLH:");
  optional('Reported Valid Packs from selected run rows.','Reported output from the selected Efficiency source. Shift Date records match the printed production date; timed runs match the production window.');
  optional("' Valid Packs · all supplied units '","' '+esc(eff.outputField)+' · all supplied units '");
  code=code.split("+' in-window runs · '").join("+' matching source rows · '");
  optional("['units','Valid Packs',1,0]","['units',eff.outputField,1,0]");
  optional("['runId','Run ID']","['runId','Run / source row ID']");
  optional("['startWall','Product start']","['startWall','Source date / start']");
  optional("OutputField:'Valid Packs'","OutputField:r.efficiency.outputField,OutputDateBasis:r.efficiency.dateBasis");
  optional('ValidPacks:x.units','ReportedOutput:x.units,OutputField:x.outputField||\'Valid Packs\',OutputDateBasis:x.dateBasis||\'Product Start / Product End\',ProductionDate:x.productionDate||\'\',IdentityBasis:x.identityBasis||\'Run ID\',SourceRunID:x.sourceRunId??x.runId,ValidPacks:(x.outputField||\'Valid Packs\')===\'Valid Packs\'?x.units:null');
  const oldSource=/sources\.appendChild\(message\('Efficiency: [^\n]*?'\)\);/g;if([...code.matchAll(oldSource)].length===1)code=code.replace(oldSource,()=>"sources.appendChild(message('Efficiency tab: printed Shift Date supplies the production date. Valid Packs is used when present; otherwise the explicitly labelled Packs Made column is used. Line Name supplies the physical unit. Timed-run exports retain Product Start / End and Valid Packs. Output, date basis and source rows are retained; Efficiency labour hours never replace Crown hours.'));");
  code='/* Efficiency output labels v1 */\n'+code;
 }
 // Replace these functions on every update, including cockpits already patched by v1.
 const pickStart=code.indexOf('function efficiencyPicker(){'),pickEnd=code.indexOf('function previewRoster(',pickStart);
 if(pickStart<0||pickEnd<0)throw Error('Efficiency upload preview not found.');
 code=code.slice(0,pickStart)+picker.slice(picker.indexOf('function efficiencyPicker(){')).trim()+'\n'+code.slice(pickEnd);
 const readStart=code.indexOf('async function parseEfficiencyBytes('),readEnd=code.indexOf('\nfunction agencyPicker(',readStart);
 if(readStart<0||readEnd<0||typeof sourceReader!=='string'||!sourceReader.includes('async function parseEfficiencyBytes('))throw Error('The Efficiency source reader is missing.');
 code=code.slice(0,readStart)+sourceReader.slice(sourceReader.indexOf('async function parseEfficiencyBytes(')).trim()+code.slice(readEnd);
 if(typeof efficiencyEngine!=='string'||!efficiencyEngine.includes('function parseShiftSheet('))throw Error('The updated Efficiency reader is missing.');
 const engineRx=/<script\b[^>]*\bid=["']daily-efficiency-engine["'][^>]*>[\s\S]*?<\/script\s*>/gi;if([...source.matchAll(engineRx)].length!==1)throw Error('One existing Efficiency engine is required.');
 source=source.replace(engineRx,()=>'<scr'+'ipt id="daily-efficiency-engine">'+efficiencyEngine+'</scr'+'ipt>');
 const support=/<script\b[^>]*\bid=["']daily-efficiency-diagnostics["'][^>]*>[\s\S]*?<\/script\s*>/gi,existing=[...source.matchAll(support)];if(existing.length>1)throw Error('Multiple Efficiency diagnostics modules found.');const block='<scr'+'ipt id="daily-efficiency-diagnostics">\n'+diagnostics+'\n</scr'+'ipt>';
 source=source.replace(rx,whole=>whole.replace(matches[0][1],()=>code));
 if(existing.length)source=source.replace(support,()=>block);else{const at=source.search(rx);source=source.slice(0,at)+block+'\n'+source.slice(at);}
 return source;
}
root.patchEfficiencyDates=patchEfficiencyDates;if(typeof module!=='undefined'&&module.exports)module.exports=patchEfficiencyDates;
})(typeof window==='undefined'?globalThis:window);
