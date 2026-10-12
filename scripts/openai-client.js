/* OpenAI Responses API. The key vault is outside all HTML/JSON save scopes. */
const OpenAIClient=(()=>{
 const active=new Set(),DEFAULT_MODEL='gpt-4.1-mini';
 function configure(){const s=APP.settings;if(s.apiProvider!=='openai'||/^claude/i.test(s.apiModel||'')){s.apiOn=false;s.apiProvider='openai';}if(!s.apiModel||/^claude/i.test(s.apiModel))s.apiModel=DEFAULT_MODEL;delete s.apiKey;}
 function safe(message){return String(message||'').replace(/sk-[A-Za-z0-9_-]{8,}/g,'[redacted key]').slice(0,500);}
 function cancelAll(){for(const c of active)c.abort();}
 function wait(ms,signal){return new Promise((resolve,reject)=>{if(signal.aborted)return reject(new DOMException('Stopped','AbortError'));const stop=()=>{clearTimeout(t);reject(new DOMException('Stopped','AbortError'));},t=setTimeout(()=>{signal.removeEventListener('abort',stop);resolve();},ms);signal.addEventListener('abort',stop,{once:true});});}
 async function request({instructions,input,format,maxOutputTokens=1200,controller=new AbortController()}){
  configure();if(!APP.settings.apiOn)throw Error('OpenAI API is off. Enable it in Settings and save settings first.');
  const model=String(APP.settings.apiModel||DEFAULT_MODEL).trim();if(/^claude/i.test(model))throw Error('Choose an OpenAI model in Settings.');
  const key=await KEYV.get('Enter your password to use the OpenAI API.');if(!/^sk-/.test(key)||/^sk-ant-/.test(key))throw Error('Add an OpenAI API key in Settings.');
  if(controller.signal.aborted)throw new DOMException('Stopped','AbortError');
  const body={model,store:false,instructions,input,max_output_tokens:maxOutputTokens};if(format)body.text={format};
  let timeout=false;const timer=setTimeout(()=>{timeout=true;controller.abort();},90000);active.add(controller);
  try{
   for(let attempt=0;attempt<3;attempt++){
    let r;try{r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify(body),signal:controller.signal});}catch(e){if(controller.signal.aborted)throw e;throw Error('Cannot reach OpenAI. Check your connection and whether your work network allows api.openai.com. No classification was applied for this request.');}
    let j;try{j=await r.json();}catch(e){throw Error('OpenAI returned an unreadable response (HTTP '+r.status+').');}
    if(!r.ok){
     const code=j?.error?.code||'',detail=safe(j?.error?.message);
     if(r.status===429&&code!=='insufficient_quota'&&attempt<2){const retry=+r.headers.get('retry-after');await wait(Math.min(30000,Number.isFinite(retry)&&retry>0?retry*1000:1000*2**attempt),controller.signal);continue;}
     const hint={401:'The key was rejected. Check or replace your OpenAI API key in Settings.',403:'This key or work connection does not have access to the requested model.',404:'The model was not found or is unavailable to your OpenAI project. Check Model in Settings.',429:code==='insufficient_quota'?'API credit or quota is exhausted. Check OpenAI API billing; a ChatGPT subscription does not include API credit.':'OpenAI is limiting requests. Wait and retry the remaining complaints.'}[r.status];
     throw Error('OpenAI HTTP '+r.status+' — '+(hint||detail||'Please retry later.'));
    }
    if(j.error||j.status==='failed')throw Error('OpenAI response failed: '+safe(j.error?.message||'No answer returned.'));
    if(j.status==='incomplete')throw Error('OpenAI response was incomplete ('+safe(j.incomplete_details?.reason||'output limit')+'). This complaint remains unclassified.');
    const content=(j.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]);if(content.some(x=>x.type==='refusal'))throw Error('OpenAI declined this request. Review the complaint manually.');
    const text=content.filter(x=>x.type==='output_text').map(x=>x.text||'').join('')||j.output_text||'';if(!text.trim())throw Error('OpenAI returned no usable text.');
    return {text,model:j.model||model,responseId:j.id||''};
   }
  }catch(e){if(timeout)throw Error('OpenAI timed out after 90 seconds. Retry the remaining complaints.');throw e;}
  finally{clearTimeout(timer);active.delete(controller);}
 }
 const classificationFormat={type:'json_schema',name:'complaint_classification',strict:true,schema:{type:'object',additionalProperties:false,properties:{nature:{type:'string',enum:['objective','subjective','mixed']},objective_signals:{type:'array',items:{type:'string'}},subjective_signals:{type:'array',items:{type:'string'}},severity:{type:'integer',enum:[1,2,3,4,5]},severity_reason:{type:'string'},root_cause_hypothesis:{type:'string'},summary:{type:'string'}},required:['nature','objective_signals','subjective_signals','severity','severity_reason','root_cause_hypothesis','summary']}};
 function validClassification(v){return !!v&&!Array.isArray(v)&&['objective','subjective','mixed'].includes(v.nature)&&Number.isInteger(v.severity)&&v.severity>=1&&v.severity<=5&&['objective_signals','subjective_signals'].every(k=>Array.isArray(v[k])&&v[k].every(x=>typeof x==='string'))&&['severity_reason','root_cause_hypothesis','summary'].every(k=>typeof v[k]==='string');}
 return {configure,request,cancelAll,classificationFormat,validClassification,DEFAULT_MODEL};
})();
