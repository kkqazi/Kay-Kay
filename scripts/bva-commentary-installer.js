/* Patch narrative code only; retain transactions, settings and financial calculations. */
(function(root){
 'use strict';
 function patchBvaCommentary(source,helper){
  const regex=/<script\b[^>]*\bid=["']bva-script["'][^>]*>([\s\S]*?)<\/script\s*>/gi,matches=[...source.matchAll(regex)];
  if(matches.length!==1)throw Error('Select a saved Budget vs Actual cockpit with one bva-script module. Your file has not been changed.');
  let code=matches[0][1];
  function once(before,after){if(code.split(before).length!==2)throw Error('This Budget vs Actual version needs a different commentary updater. Your file has not been changed.');code=code.replace(before,()=>after);}
  function range(start,end,replacement){const a=code.indexOf(start),b=code.indexOf(end,a+start.length);if(a<0||b<0||code.indexOf(start,a+1)!==-1)throw Error('The commentary section could not be identified safely. Your file has not been changed.');code=code.slice(0,a)+replacement+code.slice(b);}
  if(!code.includes('/* bva-commentary-v1 */')){
   once("  'use strict';", "  'use strict';\n  const CT = BvaCommentary.create(F); /* bva-commentary-v1 */");
   once('    T.chk = (T.Ra - T.Rb) - T.net;', '    T.chk = (T.Ra - T.Rb) - T.net;\n    T.budgetContext = BvaCommentary.context(APP.E, fy, T.u, T.days); if(T.budgetContext)T.budgetContext.paidHoursVariance=T.line;\n    T.days.forEach(d => { d.u=T.u; d.budgetContext=BvaCommentary.context(APP.E,fy,T.u,[d]); if(d.budgetContext)d.budgetContext.paidHoursVariance=d.line; });');
   const siteStart=code.indexOf('  function siteCalc('),siteEnd=code.indexOf('  /* ---------------- product maths',siteStart);if(siteStart<0||siteEnd<0)throw Error('Site calculation section not found.');
   let site=code.slice(siteStart,siteEnd);const anchor='    finish(T, fy); return T;';if(site.split(anchor).length!==2)throw Error('Site return could not be identified safely.');
   site=site.replace(anchor,()=>"    finish(T, fy); const abc=units.find(x=>x.u==='ABC'); T.budgetContext=abc?.budgetContext||null; T.days.forEach(d=>{d.budgetContext=abc?.days.find(x=>x.date===d.date)?.budgetContext||null;}); return T;");code=code.slice(0,siteStart)+site+code.slice(siteEnd);
   range("    L.push({ k: 'line',", "    L.push({ k: 'net',", "    L.push({ k: 'line', v: T.line, t: '<b>Lines:</b> ' + CT.lines(T, LDs) });\n    const assumption=CT.assumptions(T,LDs); if(assumption)L.push({k:'assumptions',t:'<b>Budget assumptions:</b> '+assumption});\n");
   once('    return L;', "    return [L.find(x=>x.k==='line'),L.find(x=>x.k==='assumptions'),...L.filter(x=>x.k!=='line'&&x.k!=='assumptions')].filter(Boolean);");
   range("    const worst = [[", "    if (worst.length)", "    const worst = [['mix',T.mix,'Product mix: review the products whose volume shares changed'],['line',T.line,CT.focus(T,LDs)],['vol',T.vol,'Volume: review the impact of lower volume on labour recovery']].filter(x=>x[1]<-.5).sort((a,b)=>a[1]-b[1]);\n");
   once('    const allowOps = T.v * (T.bh + T.goe) / T.bv;', '    const allowOps = T.a + T.line - T.goeFx;');
   once('    const allow = T.v * T.bh / T.bv;', '    const allow = T.a + T.line;');
   once('// budget hours missing at this volume','// savings target at actual volume');
   range("    lines.push('<p style=\"margin:0 0 8px\">For the volume", '    const walk =', "    lines.push('<p style=\"margin:0 0 8px\">'+CT.pace(T)+'</p>');\n    const assumption=CT.assumptions(T,LD);if(assumption)lines.push('<p style=\"margin:0 0 8px\">'+assumption+'</p>');\n");
   once('Budget hours for the volume we made','Operating allowance before GOE at actual volume');
   once('Budget hours missing (to be investigated)','GOE savings target at actual volume');
   once('of which line performance','of which paid hours vs operating allowance before GOE');
   once('of which budget hours missing','of which GOE savings target');
   range('    const act = gap >= 0.5 ?', '    box.insertAdjacentHTML', "    const act = '<p><b>Suggested review:</b> '+CT.focus(T,LD)+'.</p>'+CT.detail(T);\n");
   once("bits.push(Math.abs(T.line) < 0.5 ? 'The lines ran at budget pace.' : T.line < 0 ? 'We also used more paid hours than budget pace allows.' : 'The lines ran faster than budget pace.');", "let LD;try{LD=lineData(R,T.u);}catch{}\n    bits.push((CT.strong(LD)?'Line efficiency was '+Math.round(LD.tot.eff*100)+'%. ':'')+(Math.abs(T.line)<.5?'Paid hours matched the final budget allowance.':T.line<0?'Paid hours remain above the final budget allowance; review coverage and the savings assumptions.':'Paid hours were below the final budget allowance.'));");
   range("    if (Math.abs(d.goeFx) >= 0.5) t.push('On line performance alone", "    t.push('<b>Overall:", "    const assumption=CT.day(d);if(assumption)t.push(assumption);\n");
   once("L.map(x => '<p style=\"margin:6px 0\">' + x.t + '</p>').join('') + '</div>');", "L.map(x => '<p style=\"margin:6px 0\">' + x.t + '</p>').join('') + CT.detail(T) + '</div>');");
   if(/budget is missing|budget hours missing|missing from the budget|On line performance alone/i.test(code))throw Error('An outdated commentary phrase remains. Your file has not been changed.');
  }
  const support=/<script\b[^>]*\bid=["']bva-commentary-support["'][^>]*>[\s\S]*?<\/script\s*>/gi;
  const existing=[...source.matchAll(support)];if(existing.length>1)throw Error('Multiple commentary support modules found.');
  const block='<scr'+'ipt id="bva-commentary-support">\n'+helper+'\n</scr'+'ipt>';
  if(existing.length)source=source.replace(support,()=>block);
  source=source.replace(regex,whole=>whole.replace(matches[0][1],()=>code));
  if(!existing.length){const start=regex.exec(source);source=source.slice(0,start.index)+block+'\n'+source.slice(start.index);}
  return source;
 }
 root.patchBvaCommentary=patchBvaCommentary;if(typeof module!=='undefined'&&module.exports)module.exports=patchBvaCommentary;
})(typeof window==='undefined'?globalThis:window);
