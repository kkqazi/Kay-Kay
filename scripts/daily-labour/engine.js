/* Daily Labour Phase 1: one parser, classification and clocking engine.
   Civil timestamps are interpreted in Europe/London, independently of the PC timezone. */
(function(root){
'use strict';
const norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
const header=v=>norm(v).replace(/[^a-z0-9]/g,'');
const clock=v=>/^\d+(?:\.0+)?$/.test(String(v??'').trim())?String(Number(v)):'';
const key=r=>norm(r.role)+'|'+r.section;
const zone='Europe/London',fmt=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function civil(ms){const p=Object.fromEntries(fmt.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;}
function timestamp(value){
 let s;if(value instanceof Date)s=value.toISOString().slice(0,19);else if(typeof value==='number')s=new Date(Date.UTC(1899,11,30)+Math.round(value*864e5)).toISOString().slice(0,19);else s=String(value??'').trim().replace(' ','T');
 if(/Z$|[+-]\d\d:\d\d$/.test(s)){const ms=Date.parse(s);return {ms,ambiguous:false};}
 let m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(?:\.\d+)?)?$/.exec(s);
 if(!m){const q=/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})[ T](\d{1,2}):(\d\d)(?::(\d\d))?$/.exec(s);if(q)m=[q[0],q[3].length===2?'20'+q[3]:q[3],q[2].padStart(2,'0'),q[1].padStart(2,'0'),q[4].padStart(2,'0'),q[5],q[6]||'00'];}
 if(!m)return {ms:NaN,ambiguous:false};
 const wall=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)),target=`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]||'00'}`;
 const candidates=[wall-3600000,wall].filter(ms=>civil(ms)===target);
 return {ms:candidates[0]??NaN,ambiguous:candidates.length>1};
}
function addDate(d,n){return new Date(Date.parse(d+'T12:00:00Z')+n*864e5).toISOString().slice(0,10);}
function windowFor(d){if(!/^\d{4}-\d\d-\d\d$/.test(d)||addDate(d,0)!==d)throw Error('Select a valid production date.');const previous=addDate(d,-1);return {date:d,from:previous+'T19:00:00',to:d+'T18:00:00',start:timestamp(previous+'T19:00:00').ms,end:timestamp(d+'T18:00:00').ms};}
function classify(r,overrides={}){
 const override=overrides[key(r)];if(override)return {class:override.class,section:override.section,source:'Manual role mapping'};
 let n=norm(r.role).replace(/\s*\([^)]*\)/g,'').trim(),section=r.section;
 if(['line coordinator','line co-ordinator','lc'].includes(n))return {class:'LC',section:'LC',source:'Role rules'};
 if(['manufacturing manager','zone manager','zm'].includes(n))return {class:'EXCLUDED',section:'Excluded',source:'Role rules'};
 if(/^(fridge porter|qm|quality monitor|sanitiser|sanitizer|clerk|ns clerk|trainer|ns trainer|h&s|ns h&s)$/.test(n))return {class:'IDL',section:'IDL',source:'Role rules'};
 if(/^(prep setter|setter mixer|prep mixer|mixer|prep op|prep operative)$/.test(n))return {class:'DL',section:'Prep',source:'Role rules'};
 if(/^oven operatives?$/.test(n))return {class:'DL',section:'Oven',source:'Role rules'};
 if(/^(setter|pot setter)$/.test(n))return {class:'DL',section:'Setters',source:'Role rules'};
 if(/^(machine minder|mm|porter|platters|pot line|line operative|line op\/pink labels|packing operative|packing operative\/pot line|multiskilled operative|lo agency)$/.test(n)||/^(roller|cutter|feeder)(\/(roller|cutter|feeder))*( wraps only)?$/.test(n))return {class:'DL',section:section==='Packing'?'Packing':'Production',source:'Role rules'};
 return {class:'REVIEW',section:section||'Review',source:n?'Unknown role':'Missing role'};
}
function findHeader(grid,test){for(let i=0;i<Math.min(grid.length,30);i++){const hs=(grid[i]||[]).map(header);if(test(hs))return {row:i,hs};}return null;}
function field(hs,aliases){return hs.findIndex(x=>aliases.includes(x));}
function parseRoster(sheets,meta={},unit='ABC'){
 if(!['ABC','D','K'].includes(unit))throw Error('Choose ABC, D or K as the roster scope.');
 const rows=[],mapping=[],ignored=[];
 for(const s of sheets){const grid=s.grid,H=findHeader(grid,hs=>field(hs,['clockno','clocknumber','employeenumber','employeeid'])>=0&&field(hs,['role','job'])>=0);if(!H){ignored.push(s.name);continue;}
  const c=field(H.hs,['clockno','clocknumber','employeenumber','employeeid']),r=field(H.hs,['role','job']),n=field(H.hs,['name','employeename','bantus']);
  if(n<0)throw Error(s.name+': employee Name column not recognised.');
  const u=field(H.hs,['unit']),sh=field(H.hs,['shift','team']),ca=field(H.hs,['coreagency','agencycore','employmenttype']);
  const section=/^PROD\b/i.test(s.name)?'Production':/^PACKING\b/i.test(s.name)?'Packing':/^PREP\b/i.test(s.name)?'Prep':/^SETTERS\b/i.test(s.name)?'Setters':/^OVEN\b/i.test(s.name)?'Oven':/^MANAGERS\b/i.test(s.name)?'Support':null;
  if(!section)throw Error(s.name+': operational section not recognised. Supply a Production / Packing / Prep / Setters / Oven / Managers sheet.');
  mapping.push({sheet:s.name,headerRow:H.row+1,name:n+1,clock:c+1,role:r+1,unit:u<0?null:u+1,shift:sh<0?null:sh+1});
  for(let i=H.row+1;i<grid.length;i++){const a=grid[i]||[],name=String(a[n]??'').trim(),role=String(a[r]??'').trim(),id=clock(a[c]);
   if(!name||/^(total\b|training$|high care$|packing$|prep$|authorised absence$|unauthorised absence$|sick(?:ness)?$|holiday$|rest days?$|mar?ternity$|paternity$|bereavement$)/i.test(name))continue;
   if(!role&&!id)continue;
   rows.push({id:s.name+':'+(i+1),clock:id,rawClock:String(a[c]??''),name,role,unit,area:u>=0?String(a[u]??'').trim().toUpperCase().replace(/^UNIT\s+/,''):'',section,team:/\bNS\b/i.test(s.name)?'Night':/\bDS\b/i.test(s.name)?'Day':'Support',shift:sh>=0?String(a[sh]??''):'',employment:ca>=0?String(a[ca]??'').trim():/agency/i.test(role)?'Agency (role label)':'Unknown',sheet:s.name,row:i+1});
  }
 }
 if(!rows.length)throw Error('No roster employee rows found. Required fields: Name, Clock No, Role; recognised operational worksheets.');
 return {rows,meta:{...meta,unit,mapping,ignoredSheets:ignored,employees:rows.length}};
}
function parseCrown(sheets,meta={}){
 const events=[],mapping=[],errors=[],warnings=[];let captureFrom=null,captureTo=null;
 for(const s of sheets){const H=findHeader(s.grid,hs=>hs.includes('employeeid')&&hs.includes('clockingdatetimeunrounded'));if(!H)continue;
  const hs=H.hs,c=field(hs,['employeeid']),t=field(hs,['clockingdatetimeunrounded']),flag=field(hs,['dayreviewinoutflag']),io=field(hs,['inout']),f=field(hs,['forenames']),sn=field(hs,['surname']),unit=field(hs,['unit']),area=field(hs,['timeclockdescription']);
  if(f<0||sn<0||area<0||(flag<0&&io<0))throw Error(s.name+': missing FORENAMES, SURNAME, TIMECLOCKDESCRIPTION or clock direction.');
  const derived=!!s.derivedDirection;
  if(flag<0&&derived)throw Error('Crown In / Out is occurrence-derived and no authoritative direction flag is available. Export actual IN/OUT events.');
  if(derived)warnings.push('In / Out is occurrence-derived; DAYREVIEWINOUTFLAG is used instead. −1 is unresolved.');
  mapping.push({sheet:s.name,headerRow:H.row+1,employee:c+1,time:t+1,direction:flag>=0?'DAYREVIEWINOUTFLAG (0 IN / 1 OUT / −1 unresolved)':'In / Out',timestamp:'CLOCKINGDATETIMEUNROUNDED'});
  for(const a of s.grid.slice(0,H.row)){const at=a.findIndex(v=>header(v)==='startdate'),to=a.findIndex(v=>header(v)==='enddate');if(at>=0)captureFrom=timestamp(a[at+1]).ms;if(to>=0)captureTo=timestamp(a[to+1]).ms;}
  for(let i=H.row+1;i<s.grid.length;i++){const a=s.grid[i]||[];if(a.every(v=>v==null||v===''))continue;const id=clock(a[c]),tm=timestamp(a[t]);
   if(!id||!Number.isFinite(tm.ms)){errors.push({sheet:s.name,row:i+1,clock:id,type:!id?'Missing employee number':'Invalid clock timestamp'});continue;}
   const raw=flag>=0?String(a[flag]??'').trim():norm(a[io]),direction=flag>=0?(raw==='0'?'IN':raw==='1'?'OUT':'UNKNOWN'):/^(in|i|0)$/.test(raw)?'IN':/^(out|o|1)$/.test(raw)?'OUT':'UNKNOWN';
   const location=String(a[area]??'').trim(),rawUnit=unit>=0?String(a[unit]??'').trim():'',u=/^(?:unit\s+)?([A-EK])$/i.exec(rawUnit)||/^Unit\s+([A-EK])\b/i.exec(location);
   events.push({clock:id,employeeCode:String(a[field(hs,['employeecode'])]??''),name:[a[f],a[sn]].filter(Boolean).join(' ').trim(),time:tm.ms,wall:civil(tm.ms),direction,rawFlag:raw,unit:u?u[1].toUpperCase():'Unknown',location,sheet:s.name,row:i+1,ambiguous:tm.ambiguous});
  }
 }
 if(!events.length)throw Error('No Crown events found. Required: EMPLOYEEID, CLOCKINGDATETIMEUNROUNDED, FORENAMES, SURNAME, TIMECLOCKDESCRIPTION and direction.');
 const times=events.map(e=>e.time);
 return {events,meta:{...meta,mapping,warnings,errors,captureFrom:Number.isFinite(captureFrom)?captureFrom:Math.min(...times),captureTo:Number.isFinite(captureTo)?captureTo:Math.max(...times),events:events.length}};
}
function rosterAudit(previous,next,overrides={}){
 const index=rows=>{const m=new Map();for(const r of rows||[])if(r.clock){if(!m.has(r.clock))m.set(r.clock,[]);m.get(r.clock).push(r);}return m;},old=index(previous?.rows),now=index(next.rows),changes=[];
 for(const [id,rs]of now){if(rs.length>1)changes.push({clock:id,type:'Duplicated clock number',detail:rs.map(r=>r.sheet+': '+r.role).join(' / ')});
  if(!old.has(id)){if(previous)changes.push({clock:id,type:'New starter / newly listed',detail:rs[0].name});continue;}
  if(rs.length!==1||old.get(id).length!==1)continue;const a=old.get(id)[0],b=rs[0],ac=classify(a,overrides),bc=classify(b,overrides);
  for(const f of ['role','unit','area'])if(norm(a[f])!==norm(b[f]))changes.push({clock:id,type:f+' change',detail:`${a[f]||'blank'} → ${b[f]||'blank'}`});
  if(ac.class!==bc.class)changes.push({clock:id,type:'Labour class change',detail:ac.class+' → '+bc.class});
 }
 if(previous)for(const[id,rs]of old)if(!now.has(id))changes.push({clock:id,type:'Leaver / no longer listed',detail:rs[0].name});
 const names=new Map();for(const r of next.rows){const name=norm(r.name);if(!names.has(name))names.set(name,[]);names.get(name).push(r);if(!r.clock)changes.push({clock:'',type:'Missing / TBC clock number',detail:r.name+' · '+r.sheet+':'+r.row});if(classify(r,overrides).class==='REVIEW')changes.push({clock:r.clock,type:'Unknown role',detail:r.role+' · '+r.name});}
 for(const rs of names.values())if(rs.length>1)changes.push({clock:rs.map(r=>r.clock||'TBC').join('/'),type:'Duplicate employee name',detail:rs[0].name+' · '+rs.map(r=>r.sheet+':'+r.row).join(' / ')});
 return changes;
}
function nameSimilarity(a,b){const tokens=s=>norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/[^a-z0-9]+/).filter(Boolean);const x=tokens(a),y=tokens(b);if(!x.length||!y.length)return 0;const near=(a,b)=>{let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;}return 1-prev[b.length]/Math.max(a.length,b.length);};const hits=y.filter(t=>x.some(q=>q===t||(q.length>=4&&t.length>=3&&(q.startsWith(t)||t.startsWith(q)||near(q,t)>=.8)))).length;return hits/y.length;}
function mergeIntervals(xs){const sorted=xs.filter(x=>x.end>x.start).sort((a,b)=>a.start-b.start),out=[];for(const x of sorted){const p=out.at(-1);if(p&&x.start<p.end){p.end=Math.max(p.end,x.end);p.overlap=true;}else out.push({...x});}return out;}
function calculate(model,date){
 const W=windowFor(date),rosters=model.rosters||{},ex=[],people=[],segments=[],groups=new Map(),duplicates=[],files=(model.crownFiles||[]).filter(f=>(!f.meta.productionDate||f.meta.productionDate===date)&&f.meta.captureFrom<W.end&&f.meta.captureTo>=W.start),seen=new Set(),lookup=new Map();
 const issue=(type,e,detail,level='Review')=>ex.push({type,clock:e?.clock||'',name:e?.name||'',unit:e?.unit||'',detail,level});
 for(const roster of Object.values(rosters))for(const r of roster.rows){if(r.clock){if(!lookup.has(r.clock))lookup.set(r.clock,[]);lookup.get(r.clock).push(r);}}
 for(const f of files){for(const er of f.meta.errors||[])issue(er.type,er,`${f.meta.file} · ${er.sheet}:${er.row}`);for(const e of f.events){const k=[e.clock,e.time,e.direction,e.unit,e.location].join('|');if(seen.has(k)){duplicates.push(e);continue;}seen.add(k);if(!groups.has(e.clock))groups.set(e.clock,[]);groups.get(e.clock).push(e);}}
 for(const e of duplicates)if(e.time>=W.start&&e.time<=W.end)issue('Duplicate clock event removed',e,e.wall+' · '+e.location);
 for(const [id,events]of groups){events.sort((a,b)=>a.time-b.time);const relevant=events.filter(e=>e.time>=W.start&&e.time<=W.end);let open=null,raw=[],flags=[];
  for(const e of events){if(e.time>W.end)break;
   if(e.direction==='UNKNOWN'){if(e.time>=W.start){flags.push('Unresolved Crown direction');issue('Unresolved Crown direction',e,`Flag ${e.rawFlag} at ${e.wall}; no guessed IN/OUT.`);}continue;}
   if(e.direction==='IN'){if(open){issue('Repeated IN / overlapping clock period',e,'Earliest open IN retained; no double-counting.');flags.push('Repeated IN');}else open=e;}
   else if(open){if(e.time>=W.start&&e.time>open.time)raw.push({start:Math.max(open.time,W.start),end:Math.min(e.time,W.end),event:open,out:e,capped:e.time>=W.end});if(open.unit!==e.unit&&e.time>=W.start){flags.push('Clock location unit changed');issue('Unit / area mismatch',e,open.unit+' → '+e.unit+'; hours retained at IN unit pending review.');}open=null;}
   else if(e.time>=W.start){flags.push('Missing IN');issue('Missing IN',e,e.wall+' OUT without a preceding IN; no hours invented.');}
  }
  if(open&&open.time<W.end){raw.push({start:Math.max(open.time,W.start),end:W.end,event:open,out:null,capped:true});flags.push('Missing OUT');issue('Missing / incomplete clock-out – hours capped at production-day boundary',open,W.to+' Europe/London; estimated hours visible.');}
  if(!relevant.length&&!raw.length)continue;
  const merged=mergeIntervals(raw);for(const x of merged)if(x.overlap)issue('Overlapping periods merged',x.event,'Overlapping seconds counted once.');
  const rows=lookup.get(id)||[],correction=model.employees?.[id]||{},selected=rows.find(r=>r.id===correction.rosterRow),r=selected||(rows.length===1?rows[0]:null),first=relevant[0]||raw[0]?.event||events[0];
  let cls=r?classify(r,model.overrides):{class:'REVIEW',section:'Review',source:'No unique roster match'};
  if(!rows.length)issue('Crown employee not found in roster',first,'Match key EMPLOYEEID = Clock No. Name matching is not used.');
  else if(rows.length>1&&!selected){issue('Duplicate Clock Number / employee',first,rows.map(x=>x.sheet+':'+x.row+' '+x.role).join(' / '));flags.push('Duplicate roster clock');}
  if(r&&!correction.nameAccepted&&nameSimilarity(first.name,r.name)<.6){issue('Employee number matched but name differs',first,'Roster: '+r.name+'; confirm identity in employee review.');flags.push('Name disagreement');}
  const possibleUnits=new Set(merged.map(x=>x.event.unit));if(!merged.length)possibleUnits.add(first.unit);
  if(r){for(const u of possibleUnits){const scope=['A','B','C'].includes(u)?'ABC':u;
   if(scope!==r.unit){flags.push('Roster / clock unit disagreement');issue('Unexpected working Unit',first,`Roster ${r.unit}; Crown ${u}.`);}
   if(r.area&&r.area!=='ABC'&&!r.area.split(/[\/,&\s]+/).includes(u)){flags.push('Roster / clock area disagreement');issue('Area mismatch',first,`Roster ${r.area}; Crown ${u}.`);}}
   if(cls.class==='REVIEW')issue(r.role?'New unknown role / REVIEW':'Missing role',first,r.role||'Roster role is blank.');
  }
  if(events.some(e=>e.ambiguous&&e.time>=W.start&&e.time<=W.end)){flags.push('Ambiguous DST timestamp');issue('Ambiguous daylight-saving clock time',first,'Repeated local clock hour has no UTC offset; resolve before DL use.');}
  const unsafe=flags.some(x=>!['Missing OUT','Missing IN','Repeated IN'].includes(x));if(unsafe&&cls.class!=='EXCLUDED')cls={class:'REVIEW',section:'Review',source:'Identity / clock exception'};
  const future=[...possibleUnits].some(u=>['D','K'].includes(u)&&!rosters[u]);if(future&&cls.class!=='EXCLUDED')cls={class:'REVIEW',section:'Review',source:'Future – roster required'};
  let total=0;for(const x of merged){const hours=(x.end-x.start)/36e5;total+=hours;segments.push({...x,clock:id,name:r?.name||first.name,crownName:first.name,role:r?.role||'',class:cls.class,section:cls.section,employment:r?.employment||'Unknown',unit:x.event.unit,rosterUnit:r?.unit||'',sheet:r?.sheet||'',hours,flags:flags.join('; '),source:cls.source});}
  const p={clock:id,name:r?.name||first.name,crownName:first.name,role:r?.role||'',class:cls.class,section:cls.section,hours:total,employment:r?.employment||'Unknown',unit:[...possibleUnits].join('/'),shift:r?.shift||'',team:r?.team||'',flags:flags.join('; '),rosterRows:rows,roster:r};people.push(p);
  if(cls.class==='EXCLUDED'&&total)issue('Excluded salaried employee included in Crown',p,'Hours visible but excluded from DL, IDL, LC and productive headcount.','Info');
  if(cls.class!=='DL'&&total)issue('Crown hours outside DL denominator',p,cls.class+' · '+total.toFixed(2)+' hours','Info');
 }
 const aggregate=(id,filter)=>{const xs=segments.filter(filter),ps=people.filter(p=>xs.some(x=>x.clock===p.clock)||(p.hours===0&&p.unit.split('/').some(u=>id==='SITE'?['A','B','C'].includes(u)||!!rosters[u]:id==='ABC'?['A','B','C'].includes(u):u===id))),a={area:id,status:id==='SITE'&&!rosters.D&&!rosters.K?'ABC only – D/K inactive':files.length?'FLASH – Crown Labour':'Awaiting Crown',units:null,uplh:null,dlHeads:0,dlHours:0,idlHeads:0,idlHours:0,lcHeads:0,lcHours:0,reviewHours:0,excludedHours:0,totalHours:0,operatingHours:0,prepHours:0,prepHeads:0,people:ps.length};
  for(const cl of ['DL','IDL','LC']){a[cl.toLowerCase()+'Hours']=xs.filter(x=>x.class===cl).reduce((n,x)=>n+x.hours,0);a[cl.toLowerCase()+'Heads']=new Set(xs.filter(x=>x.class===cl&&x.hours>0).map(x=>x.clock)).size;}
  a.reviewHours=xs.filter(x=>x.class==='REVIEW').reduce((n,x)=>n+x.hours,0);a.excludedHours=xs.filter(x=>x.class==='EXCLUDED').reduce((n,x)=>n+x.hours,0);a.totalHours=xs.reduce((n,x)=>n+x.hours,0);a.operatingHours=a.dlHours+a.idlHours+a.lcHours;a.idlPercent=a.dlHours+a.idlHours?a.idlHours/(a.dlHours+a.idlHours)*100:null;
  a.prepHours=xs.filter(x=>x.class==='DL'&&x.section==='Prep').reduce((n,x)=>n+x.hours,0);a.prepHeads=new Set(xs.filter(x=>x.class==='DL'&&x.section==='Prep').map(x=>x.clock)).size;
  if(['D','K'].includes(id)&&!rosters[id])a.status='Future – roster required';return a;};
 const areas=['SITE','ABC','A','B','C','D','K'].map(id=>aggregate(id,x=>id==='SITE'?['A','B','C'].includes(x.unit)||!!rosters[x.unit]:id==='ABC'?['A','B','C'].includes(x.unit):x.unit===id));
 const excludedCoverage=segments.filter(x=>!['A','B','C'].includes(x.unit)&&!rosters[x.unit]).reduce((n,x)=>n+x.hours,0);
 const coverage={files:files.map(f=>f.meta),full:files.some(f=>f.meta.captureFrom<=W.start&&f.meta.captureTo>=W.end),events:seen.size,people:people.length,matched:people.filter(p=>p.roster).length,cappedHeads:people.filter(p=>p.flags.includes('Missing OUT')).length,futureHours:excludedCoverage};
 return {W,areas,people,segments,exceptions:ex,coverage};
}
const api={norm,header,clock,key,timestamp,civil,addDate,windowFor,classify,parseRoster,parseCrown,rosterAudit,nameSimilarity,mergeIntervals,calculate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DailyLabourEngine=api;
})(typeof window==='undefined'?globalThis:window);
