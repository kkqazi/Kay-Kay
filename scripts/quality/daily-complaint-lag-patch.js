/* Code-only adjustment: daily report D uses complaint ticket day D-1. */
function applyDailyComplaintLag(text){
 const marker='/* Daily complaint reporting lag v1 */';
 function edit(id,fn){const rx=new RegExp('(<script\\b[^>]*\\bid="'+id+'"[^>]*>)([\\s\\S]*?)(<\\/script>)'),m=rx.exec(text);if(!m)throw Error('The '+id+' module is missing. No file was changed.');const s=fn(m[2]);text=text.slice(0,m.index)+m[1]+s+m[3]+text.slice(m.index+m[0].length);}
 const once=(s,a,b)=>{if(s.indexOf(a)<0||s.indexOf(a)!==s.lastIndexOf(a))throw Error('Cannot safely identify the daily report code. No file was changed.');return s.replace(a,b);};
 edit('reports',s=>{
  if(s.includes(marker))return s;
  const helper=`
  /* Daily complaint reporting lag v1 */
  function complaintWindow(W) {
    if(W.grain!=='day')return W;
    const d=addD(W.from,-1),f=P.fiscal(d)||{};
    return Object.assign({},W,{from:d,to:d,fy:f.fy,w:f.w,label:'complaints dated '+dmy(d)});
  }
  function complaintTiming(D) {
    if(D.W.grain!=='day')return '';
    return 'Report date '+dmy(D.W.from)+' · Complaints dated '+dmy(D.QW.from)+' (reported one day later). Complaint comparisons: '+dmy(D.QPW.from)+' last week and '+dmy(D.QYW.from)+' last year (matching weekday). Other measures use the report date.';
  }
  function complaintTimingHtml(D) {
    const t=complaintTiming(D);if(!t)return '';
    const missing=D.k.q_cmp?.v===null?' Complaint data is unavailable for that ticket date.':'';
    return '<div data-quality-date style="padding:8px 12px;background:#fff8e6;color:#664a1e;font-size:12px;line-height:1.5">'+esc(t+missing)+'</div>';
  }
  function complaintValue(k,W,u,X) {
    const valid=typeof W.from==='string'&&W.from>=X.minComplaintDate&&W.to<=X.maxDate.cmp;
    if(W.grain==='day'&&!valid)return null;
    if(W.grain==='day'&&k.id==='q_cpku'){
      const f=P.fiscal(W.from);if(!f)return null;
      const o=APP.E.daily(f.fy,u,f.w).find(d=>d.date===W.from);
      const v=o&&o.has.labour?o.vol:null;if(!(v>0))return null;
      return X.cmp.filter(c=>c.d===W.from&&(u==='SITE'||c.u===u)).length/v*1000;
    }
    return k.calc(W,u,X);
  }
`;
  s=once(s,'  /* ---------------- data ---------------- */',helper+'\n  /* ---------------- data ---------------- */');
  s=once(s,"const todayIso = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };", "const todayIso = () => { const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day; };");

  s=once(s,'const W = mkWin(R); const u = R.unit; const X = await MT.index(); const E = APP.E;',`const W = mkWin(R); const u = R.unit; const baseX = await MT.index(); const E = APP.E;
    let qualityOk=true;try{await QM.load();}catch(e){qualityOk=false;console.warn('Report complaints unavailable',e);}
    const cmp=(qualityOk&&QM.Q.ready&&!QM.Q.err?QM.Q.C:[]).filter(c=>/^\\d{4}-\\d{2}-\\d{2}$/.test(c.d||'')&&!Number.isNaN(Date.parse(c.d)));
    const ds=cmp.map(c=>c.d).sort();
    const X=Object.assign({},baseX,{cmp,minComplaintDate:ds[0]||'',maxDate:Object.assign({},baseX.maxDate,{cmp:ds[ds.length-1]||''})});`);
  s=once(s,'const { PW, YW, share } = cmpWins(W, last);',`const { PW, YW, share } = cmpWins(W, last);
    const QW=complaintWindow(W),qCompare=cmpWins(QW,X.maxDate.cmp),QPW=qCompare.PW,QYW=qCompare.YW;`);
  s=once(s,'const D = { R, W, PW, YW, u,','const D = { R, W, PW, YW, QW, QPW, QYW, u,');
  s=once(s,'const r = { k, L, v: null, pv: null, py: null, tgt: null };',`const isComplaint=['q_cmp','q_sev','q_cpku'].includes(id);
      const CW=isComplaint?QW:W,CP=isComplaint?QPW:PW,CY=isComplaint?QYW:YW;
      const calc=window=>isComplaint?complaintValue(k,window,u,X):k.calc(window,u,X);
      const r = { k, L, v: null, pv: null, py: null, tgt: null, complaintDate:isComplaint&&W.grain==='day'?QW.from:null };`);
  s=once(s,'r.v = k.calc(W, u, X);','r.v = calc(CW);');
  s=once(s,'r.pv = k.calc(PW, u, X);','r.pv = calc(CP);');
  s=once(s,'r.py = k.calc(YW, u, X);','r.py = calc(CY);');
  s=once(s,"D.cmp = (X.cmp || []).filter(c => c.d >= W.from && c.d <= W.to && (u === 'SITE' || c.u === u));","D.cmp = (X.cmp || []).filter(c => c.d >= QW.from && c.d <= QW.to && (u === 'SITE' || c.u === u));");
  s=once(s,'D.headline = headline(D); D.focus = focus(D);',`if(W.grain==='day'&&D.k.q_sev&&D.k.q_sev.v===0&&D.cmp.some(c=>!c.sev))D.k.q_sev.rag='warn';
    D.headline = headline(D); D.focus = focus(D);`);
  s=once(s,"if (qc !== null) out.push(qc + ' complaint'", "if (qc !== null) out.push(qc + (D.W.grain==='day'?' loaded':'') + ' complaint'");
  s=once(s,"+ D.PW.label : '') + '.');", "+ (D.W.grain==='day'?D.QPW.label:D.PW.label) : '') + (D.W.grain==='day'?' · ticket date '+dmy(D.QW.from):'') + '.');");
  s=once(s,"['Q', okN(v('q_cmp')) ? v('q_cmp') + ' complaints' : '—',", "['Q', okN(v('q_cmp')) ? v('q_cmp') + ' complaints' : (D.W.grain==='day'?'Unavailable':'—'),");
  s=once(s,"+ n0(k.q_cmp.pv) + ' ' + D.PW.label : ''),", "+ n0(k.q_cmp.pv) + ' ' + (D.W.grain==='day'?D.QPW.label:D.PW.label) : '') + (D.W.grain==='day'?' · '+dmy(D.QW.from):''),");
  s=once(s,"name: k.label + (r.pro ? ' *' : ''),", "name: k.label + (r.pro ? ' *' : '') + (r.complaintDate?' · '+dmy(r.complaintDate):''),");
  s=once(s,"+ '. Complaint data runs about a day behind.';", "+ (D.W.grain==='day'?'. '+complaintTiming(D)+'. '+D.cmp.filter(c=>!c.sev).length+' tickets lack severity classification.':'. Counts use the selected complaint ticket-date range.');");
  s=once(s,"+ head + hl + secs.map", "+ head + complaintTimingHtml(D) + hl + secs.map");
  s=once(s,"L.push(''); L.push(D.headline); L.push('');", "if(complaintTiming(D))L.push(complaintTiming(D));L.push(''); L.push(D.headline); L.push('');");
  s=once(s,"+ '. Safety figures are entered in the report or on the Site Meeting.</div>';", "+ '. Safety figures are entered in the report or on the Site Meeting.' + (D.W.grain==='day'?'<br>'+esc(complaintTiming(D))+' Complaint counts are loaded tickets; upload completeness is unverified. Complaint rates use production volume for the complaint ticket date.':'') + '</div>';");
  s=once(s,"{ a: 'Generated', b: dmy(isoOf(D.generated)) },", "{ a: 'Generated', b: dmy(isoOf(D.generated)) }, { a: 'Complaint reporting dates', b: complaintTiming(D) || 'Selected ticket-date range' },");
  s=once(s,"kpi: r.k.label, v: okN(r.v)","kpi: r.k.label + (r.complaintDate?' · '+dmy(r.complaintDate):''), v: okN(r.v)");
  s=once(s,"if (!R.date) { const ld = MT.S && MT.S.idx && MT.S.idx.maxDate ? MT.S.idx.maxDate.lab || MT.S.idx.maxDate.eff : null; R.date = ld || addD(todayIso(), -1); }", "if (!R.date) R.date = todayIso();");
  s=once(s,"items.push({ label: 'Day', el: di });", "items.push({ label: 'Report day', el: di });items.push({label:'Complaints dated',el:h('span',{class:'sel'},dmy(addD(R.date,-1)))});");
  return s;
 });
 edit('quality-reports',s=>{
  if(s.includes(marker))return s;
  s=marker+'\n'+s;
  s=once(s,'const QualityReports=(()=>{',"const QualityReports=(()=>{\n const reportingToday=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day;};");
  s=once(s,"date:b.max||iso(new Date())","date:reportingToday()");

  s=once(s,"if(s.mode==='daily')from=to=s.date;", "if(s.mode==='daily')from=to=add(s.date,-1);");
  s=once(s,'return{s:JSON.parse(JSON.stringify(s)),all,base,b,from,to,',"return{reportDate:s.mode==='daily'?s.date:null,s:JSON.parse(JSON.stringify(s)),all,base,b,from,to,");
  s=once(s,"function describe(r){return fmt(r.from)", "function describe(r){return (r.reportDate?'Report '+fmt(r.reportDate)+' · Complaints dated ':'')+fmt(r.from)");
  s=once(s,"if(s.mode==='daily')dateField('Report date','date');", "if(s.mode==='daily'){dateField('Report date','date');form.append(N('span','qr-muted','Complaints dated '+fmt(add(s.date,-1))+' · reported one day later'));}");
  return s;
 });
 return {html:text};
}
