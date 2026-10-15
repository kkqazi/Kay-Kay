/* Evidence-based labour commentary; no saved business data. */
(function(root){
 'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x),positive=x=>finite(x)&&x>0;
 function context(E,fy,unit,days){
  if(fy!==27||unit!=='ABC'||!days.length)return null;
  try{
   const sub=E.submission(),budget=E.budgetVersion(E.settings?.budgetVersion||'FY27 Budget')?.units?.ABC;
   if(!sub||!budget)return null;
   let earlier=0,operating=0,paid=0,goe=0,weekEquivalent=0,volumeChanged=false;const seen=new Set();
   for(const day of days){const key=day.w+'|'+day.d;if(seen.has(key))continue;seen.add(key);const i=day.w-1,share=E.dayShare('ABC',fy,day.w)?.[day.d];
    if(!finite(share)||share<0||!positive(sub.dl?.[i])||!positive(budget.ops?.[i])||!positive(budget.hrs?.[i])||!positive(sub.vol?.[i])||!positive(budget.vol?.[i]))return null;
    earlier+=sub.dl[i]*share;operating+=budget.ops[i]*share;paid+=budget.hrs[i]*share;goe+=(budget.ops[i]-budget.hrs[i])*share;weekEquivalent+=share;
    if(Math.abs(sub.vol[i]-budget.vol[i])>Math.max(1,sub.vol[i]*1e-6))volumeChanged=true;
   }
   if(!weekEquivalent)return null;
   return{scope:'ABC',earlier,operating,paid,goe,weekEquivalent,operatingReduction:earlier-operating,weeklyReduction:(earlier-operating)/weekEquivalent,totalReduction:earlier-paid,volumeChanged};
  }catch{return null;}
 }
 function create(F){
  const number=x=>F.n(Math.abs(x),0),hours=x=>number(x)+' hours',money=(x,rate)=>'£'+number(x*rate),tone=x=>x>=0?'favourable':'adverse';
  const strong=LD=>!!LD?.tot?.n&&Number.isFinite(LD.tot.eff)&&LD.tot.eff>=1;
  function assumptions(T,LD){
   const C=T.budgetContext,scope=T.u==='SITE'?'For ABC within the site, ':'',good=strong(LD),line=T.u==='SITE'&&C?C.paidHoursVariance:T.line;
   if(C&&C.operatingReduction>0.5){
    if(C.volumeChanged)return scope+'The operating allowance is below the earlier plan. Volume assumptions also changed, so the additional efficiency stretch needs a like-for-like reconciliation.';
    const amount='around <b>'+hours(C.weeklyReduction)+' per week</b>';
    const basis=scope+'The operating allowance is '+amount+' below the earlier plan, before the separate GOE savings target.';
    if(line<-.5)return basis+(good?' With strong line efficiency but paid hours still above budget, this may indicate an optimistic planning assumption.':' This is additional planning stretch; paid-hour coverage and operational losses also need review.')+' Check the basis and achievable savings.';
    return basis+(finite(line)?' Current paid hours '+(line>.5?'are within':'match')+' the final budget allowance; keep the assumption under review.':' Review this allowance alongside paid-hour coverage.');
   }
   if(T.line<-.5&&good)return 'Strong line efficiency and a paid-hours shortfall can occur together because they measure different hours and targets. Review paid-hour coverage and the savings assumptions in the budget.';
   if(T.line<-.5)return 'Review the lines below standard, paid-hour coverage and the savings assumptions in the budget.';
   return '';
  }
  function lines(T,LD){
   const tot=LD?.tot||{};let text='';
   if(tot.n&&finite(tot.eff))text='The lines achieved <b>'+Math.round(tot.eff*100)+'% efficiency</b> against their line standard (LCM): '+tot.on+' of '+tot.n+' lines at or above 100%. ';
   text+='Paid-labour UPLH was <b>'+F.u(T.Ua)+'</b> against <b>'+F.u(T.Ub)+'</b> in budget. ';
   text+=Math.abs(T.line)<.5?'Paid hours matched the final budget allowance.':'At the volume made, paid hours were <b>'+hours(T.line)+(T.line<0?' above':' below')+'</b> the final budget allowance ('+money(T.line,T.rate)+' '+tone(T.line)+').';
   return text;
  }
  function focus(T,LD){
   if(T.line>=-.5)return 'Sustain line performance and monitor paid-hour coverage against budget';
   if(T.line<-.5&&strong(LD))return 'Review the achievable savings assumed in the budget and reconcile paid-hour coverage alongside the strong line efficiency';
   return 'Review lines below standard, paid-hour coverage and the budget savings assumptions';
  }
  function pace(T){return 'Against the operating allowance before GOE, paid hours were <b>'+hours(T.pace)+' '+tone(T.pace)+'</b>. The budget includes a separate savings target of <b>'+hours(T.goeFx)+'</b> at actual volume. This target is included in the variance above; delivery must be reconciled separately.';}
  function day(d){
   const C=d.budgetContext;if(!C||C.operatingReduction<=.5)return '';
   if(C.volumeChanged)return 'The earlier plan used different volume assumptions; reconcile the budget stretch on a like-for-like basis.';
   return (d.u==='SITE'?'For ABC within the site, today’s':'Today’s')+' operating allowance includes around <b>'+hours(C.operatingReduction)+'</b> of additional stretch against the earlier plan.'+((d.u==='SITE'?C.paidHoursVariance:d.line)<-.5?' Review whether this assumption was optimistic alongside paid-hour coverage and operational losses.':' Paid hours are within the final budget allowance.');
  }
  function detail(T){
   const C=T.budgetContext;if(!C)return '';
   const qualifier=T.u==='SITE'?'ABC component only. ':'';
   return '<details class="bva-budget-assumptions"><summary>Planning assumptions — supporting hours</summary><p>'+qualifier+'For the selected dates: earlier planned hours '+number(C.earlier)+'; operating allowance before GOE '+number(C.operating)+'; final paid-hours budget '+number(C.paid)+'. The operating reduction is '+hours(C.operatingReduction)+' for these dates (around '+hours(C.weeklyReduction)+' per week). Separate GOE deduction: '+hours(C.goe)+'. These figures explain the target and are already included in the budget comparison.</p><p>Partial weeks use the same daily budget profile. '+(C.volumeChanged?'Volume assumptions changed; a like-for-like reconciliation is required. ':'')+'Line efficiency covers recorded production runs; paid-labour UPLH covers paid direct labour. High line efficiency alone does not establish the cause of a paid-hours variance. The savings target at actual volume follows this dashboard’s volume-flex convention; confirm that treatment with Finance.</p></details>';
  }
  return{assumptions,lines,focus,pace,day,detail,strong};
 }
 const api={context,create};root.BvaCommentary=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window==='undefined'?globalThis:window);
