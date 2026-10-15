/* Add a per-million companion to the existing Quality per-thousand rate. */
(function(root){
 'use strict';
 function applyComplaintMillionRate(text){
  const marker='/* Quality per-million companion v1 */';
  const regex=/<script\b[^>]*\bid=["']quality-module["'][^>]*>([\s\S]*?)<\/script\s*>/gi,matches=[...text.matchAll(regex)];
  if(matches.length!==1)throw Error('Choose a saved cockpit with one Quality module. Your file has not been changed.');
  let code=matches[0][1];if(code.includes(marker))return text;
  function once(before,after){if(code.split(before).length!==2)throw Error('This Quality version needs a different rate updater. Your file has not been changed.');code=code.replace(before,()=>after);}
  const oldCard="      { lab: 'Per thousand units (CPKU)', val: cp.val === null ? '—' : F.n(cp.val, 3), cmp: cp.val === null ? (SUBU.includes(c.unit) ? 'volume is reported for ABC as a whole' : 'needs Labour Report volume for these weeks') : dlt(+cp.val.toFixed(4), cpp.val === null ? null : +cpp.val.toFixed(4), false, 3) + ' · ' + cp.weeks + ' wks with volume', fn: () => { APP.state.qView = 'labour'; go(true); } },";
  const cards="      "+marker+"\n"+
   "      { lab: 'Per thousand units (CPKU)', title: 'Complaints ÷ units made × 1,000. Uses weeks with Labour Report volume; unattributed complaints are excluded.', val: cp.val === null ? '—' : F.n(cp.val, 3), cmp: cp.val === null ? (SUBU.includes(c.unit) ? 'volume is reported for ABC as a whole' : 'needs Labour Report volume for these weeks') : dlt(cp.val, cpp.val, false, 3) + ' · ' + cp.weeks + ' wks with volume', fn: () => { APP.state.qView = 'labour'; go(true); } },\n"+
   "      { lab: 'Per million units (CPMU)', title: 'Complaints ÷ units made × 1,000,000. Uses the same unrounded rate, weeks and volume as CPKU; unattributed complaints are excluded.', val: cp.val === null ? '—' : F.n(cp.val * 1000, 2), cmp: cp.val === null ? (SUBU.includes(c.unit) ? 'volume is reported for ABC as a whole' : 'needs Labour Report volume for these weeks') : dlt(cp.val * 1000, cpp.val === null ? null : cpp.val * 1000, false, 2) + ' · ' + cp.weeks + ' wks with volume', fn: () => { APP.state.qView = 'labour'; go(true); } },";
  once(oldCard,cards);
  const column="{ k: 'cpmu', t: 'CPKU (per 1,000 units)', n: 1, f: v => v === null ? '—' : F.n(v, 3) },";
  once("n: cl.length, cpmu: cp.val, scale:","n: cl.length, cpmu: cp.val, cpmillion: cp.val === null ? null : cp.val * 1000, scale:");
  once(column,column.replace("f: v =>","x: v => v === null ? '' : Math.round(v * 1000) / 1000, f: v =>")+" { k: 'cpmillion', t: 'CPMU (per 1,000,000 units)', n: 1, f: v => v === null ? '—' : F.n(v, 2) },");
  const drill="        { lab: 'Complaints', val: F.n(cl.length), cmp: r.cpmu === null ? '' : 'CPKU ' + F.n(r.cpmu, 3), fn: cl.length ? () => drillComplaints(cl, 'Complaints · ' + r.label) : null },";
  once(drill,drill+"\n        { lab: 'Per million units (CPMU)', val: r.cpmu === null ? '—' : F.n(r.cpmillion, 2), cmp: r.vol === null ? 'needs Labour Report volume for this week' : F.vol(r.vol) + ' units made', fn: cl.length ? () => drillComplaints(cl, 'Complaints · ' + r.label) : null },");
  // The source calculation and denominator selection remain unchanged.
  return text.replace(regex,whole=>whole.replace(matches[0][1],()=>code));
 }
 root.applyComplaintMillionRate=applyComplaintMillionRate;if(typeof module!=='undefined'&&module.exports)module.exports=applyComplaintMillionRate;
})(typeof window==='undefined'?globalThis:window);
