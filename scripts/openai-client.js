/* OpenAI Responses API. The key vault is outside all HTML/JSON save scopes. */
const OpenAIClient=(()=>{
 const active=new Set(),DEFAULT_MODEL='gpt-4.1-mini';
 function configure(){const s=APP.settings;if(s.apiProvider!=='openai'||/^claude/i.test(s.apiModel||'')){s.apiOn=false;s.apiProvider='openai';}if(!s.apiModel||/^claude/i.test(s.apiModel))s.apiModel=DEFAULT_MODEL;delete s.apiKey;}
 function safe(message,key){let text=String(message||'');if(key)text=text.split(key).join('[redacted key]');return text.replace(/sk-[A-Za-z0-9_-]+/g,'[redacted key]').replace(/Bearer\s+[A-Za-z0-9._-]{8,}/gi,'Bearer [redacted]').slice(0,1600);}
 let lastError=null;
 function clearDiagnostic(){document.getElementById('openai-error-panel')?.remove();}
 function showDiagnostic(d){lastError=d;clearDiagnostic();const panel=document.createElement('section');panel.id='openai-error-panel';panel.setAttribute('role','alert');panel.setAttribute('aria-label','OpenAI connection error');panel.style.cssText='position:fixed;right:12px;bottom:78px;z-index:2147483646;box-sizing:border-box;width:min(650px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:#fff;color:#25352b;border:2px solid #bb4735;border-radius:12px;padding:16px;box-shadow:0 8px 32px #0003;font:13px/1.5 Arial,sans-serif';
  const title=document.createElement('strong');title.textContent=d.status?'OpenAI HTTP '+d.status:'OpenAI connection failed';title.style.fontSize='17px';panel.append(title);
  const message=document.createElement('p');message.textContent=d.message;message.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';panel.append(message);
  const hint=document.createElement('p');hint.textContent=d.hint;panel.append(hint);const meta=document.createElement('p');meta.textContent='Model: '+d.model+' | Code: '+(d.code||'not provided')+(d.requestId?' | Request ID: '+d.requestId:'');meta.style.cssText='font-size:11px;overflow-wrap:anywhere';panel.append(meta);
  const copy=document.createElement('button');copy.type='button';copy.textContent='Copy error details';copy.style.cssText='padding:7px 12px;margin-right:8px;cursor:pointer';copy.onclick=async()=>{const report=JSON.stringify(lastError,null,2);try{await navigator.clipboard.writeText(report);copy.textContent='Copied';}catch(e){let box=panel.querySelector('textarea');if(!box){box=document.createElement('textarea');box.readOnly=true;box.style.cssText='display:block;box-sizing:border-box;width:100%;height:140px;margin-top:10px';panel.append(box);}box.value=report;box.focus();box.select();copy.textContent='Select and copy the details below';}};const close=document.createElement('button');close.type='button';close.textContent='Close';close.style.cssText='padding:7px 12px;cursor:pointer';close.onclick=clearDiagnostic;panel.append(copy,close);document.body.append(panel);
 }
 function hintFor(status,code,message,json){if(!json)return 'The endpoint returned a non-JSON response. A work proxy or gateway may have blocked it. Ask IT to check access to https://api.openai.com/v1/responses; do not share your key.';
  if(/missing.*(?:bearer|authentication|authorization)/i.test(message))return 'The server says authentication was missing. This dashboard sets an Authorization header. In Edge Network, check only whether that header exists on the failed POST; do not share its value. If present, ask IT to check whether a proxy, redirect or gateway removes it.';
  if(status===403&&/unsupported_country|country|region/i.test(code+' '+message))return 'This response concerns a country or region restriction. Check the supported region with OpenAI or your IT team.';
  if(status===403&&/scope|permission/i.test(code+' '+message))return 'Check this API key’s permissions for the Responses endpoint (Write), and your role in the OpenAI project. A key restricted to Chat Completions cannot call Responses.';
  if(status===403)return 'Use the message above to check the key’s OpenAI project, allowed model and permissions. If the message names a work gateway or policy, ask IT to review the block.';
  return {401:'Check or replace the OpenAI API key in Settings.',404:'Check that the model name is available to this OpenAI project.',429:code==='insufficient_quota'?'Check OpenAI API billing and quota. ChatGPT subscriptions do not include API credit.':'Requests are being limited. Wait before retrying.'}[status]||'Review the server message above before retrying.';
 }
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
    let r;try{r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify(body),signal:controller.signal});}catch(e){if(controller.signal.aborted)throw e;const message='Cannot reach OpenAI. Check your connection and whether your work network allows api.openai.com. No classification was applied for this request.';showDiagnostic({at:new Date().toISOString(),status:null,code:'network_error',model,message,hint:'The browser did not receive a readable HTTP response. Your work network, proxy, browser policy or CORS may be involved; ask IT to check the Network error.',requestId:null});throw Error(message);}
    let j=null,raw=await r.text();try{j=JSON.parse(raw);}catch(e){}const isJson=!!j&&typeof j==='object'&&!Array.isArray(j);
    if(!r.ok){
     const code=safe(isJson?j?.error?.code||j?.code||'':'',key),detail=safe(isJson?j?.error?.message||j?.message||'The server did not provide an error message.':'The server returned '+(r.headers.get('content-type')||'a non-JSON response')+' rather than an OpenAI JSON error.',key);
     if(r.status===429&&code!=='insufficient_quota'&&attempt<2){const retry=+r.headers.get('retry-after');await wait(Math.min(30000,Number.isFinite(retry)&&retry>0?retry*1000:1000*2**attempt),controller.signal);continue;}
     const hint=hintFor(r.status,code,detail,isJson);showDiagnostic({at:new Date().toISOString(),status:r.status,code:code||null,type:safe(isJson?j?.error?.type||'':'',key)||null,model,message:detail,hint,requestId:safe(r.headers.get('x-request-id')||'',key)||null,responseFormat:isJson?'JSON':'Non-JSON',authorizationConfigured:true,redirected:r.redirected,responseUrl:r.url?new URL(r.url).origin+new URL(r.url).pathname:null});
     throw Error('OpenAI HTTP '+r.status+' — '+detail+(code?' [code: '+code+']':'')+' '+hint);
    }
    if(!isJson)throw Error('OpenAI returned an unreadable response (HTTP '+r.status+').');
    if(j.error||j.status==='failed')throw Error('OpenAI response failed: '+safe(j.error?.message||'No answer returned.'));
    if(j.status==='incomplete')throw Error('OpenAI response was incomplete ('+safe(j.incomplete_details?.reason||'output limit')+'). This complaint remains unclassified.');
    const content=(j.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]);if(content.some(x=>x.type==='refusal'))throw Error('OpenAI declined this request. Review the complaint manually.');
    const text=content.filter(x=>x.type==='output_text').map(x=>x.text||'').join('')||j.output_text||'';if(!text.trim())throw Error('OpenAI returned no usable text.');
    lastError=null;clearDiagnostic();return {text,model:j.model||model,responseId:j.id||''};
   }
  }catch(e){if(timeout)throw Error('OpenAI timed out after 90 seconds. Retry the remaining complaints.');throw e;}
  finally{clearTimeout(timer);active.delete(controller);}
 }
 const classificationFormat={type:'json_schema',name:'complaint_classification',strict:true,schema:{type:'object',additionalProperties:false,properties:{nature:{type:'string',enum:['objective','subjective','mixed']},objective_signals:{type:'array',items:{type:'string'}},subjective_signals:{type:'array',items:{type:'string'}},severity:{type:'integer',enum:[1,2,3,4,5]},severity_reason:{type:'string'},root_cause_hypothesis:{type:'string'},summary:{type:'string'}},required:['nature','objective_signals','subjective_signals','severity','severity_reason','root_cause_hypothesis','summary']}};
 function validClassification(v){return !!v&&!Array.isArray(v)&&['objective','subjective','mixed'].includes(v.nature)&&Number.isInteger(v.severity)&&v.severity>=1&&v.severity<=5&&['objective_signals','subjective_signals'].every(k=>Array.isArray(v[k])&&v[k].every(x=>typeof x==='string'))&&['severity_reason','root_cause_hypothesis','summary'].every(k=>typeof v[k]==='string');}
 return {configure,request,cancelAll,classificationFormat,validClassification,DEFAULT_MODEL,get lastError(){return lastError;},clearDiagnostic};
})();
