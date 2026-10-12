"""Apply the OpenAI migration to a supplied v6.5 cockpit without changing data.
Usage: python scripts/build-openai-cockpit.py source.html [output.html]
"""
from pathlib import Path
import sys,re,hashlib,json
ROOT=Path(__file__).resolve().parent.parent
src=Path(sys.argv[1]);dest=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT/'Cockpit_Cost_PO_OpenAI_v6_5_1.html'
original=src.read_text();html=original
client=(ROOT/'scripts/openai-client.js').read_text();classifier=(ROOT/'scripts/openai-classification.js').read_text()
def once(s,a,b):
 assert s.count(a)==1,(a[:100],s.count(a));return s.replace(a,b,1)
cores=[m for m in re.finditer(r'<script\b[^>]*>(.*?)</script>',html,re.S) if 'const KEYV = (function' in m[1]];assert len(cores)==1
m=cores[0];core=m[1]
core=once(core,"const KEYV = (function () {",client+"\nconst KEYV = (function () {")
core=core.replace("'fy27key.enc'","'fy27openai.enc'").replace("'fy27key.api'","'fy27openai.api'")
core=core.replace('fy27key.enc','fy27openai.enc')
core=once(core,"if (!/^sk-ant-/.test(key || '')) throw new Error('That does not look like an Anthropic key (sk-ant-…)');","if (!/^sk-[A-Za-z0-9_-]{12,}$/.test(key || '') || /^sk-ant-/.test(key)) throw new Error('Enter an OpenAI API key (sk-…), not an Anthropic key.');")
core=once(core,"function lock() { mem = null;", "function lock() { mem = null; OpenAIClient.cancelAll();")
core=once(core,"function forget() { try", "function forget() { OpenAIClient.cancelAll(); try")
core=once(core,"await set(key, newPw); toast(","await set(key, newPw); mem = null; toast(")
# Do not migrate legacy keys from file-saved settings into a browser vault.
core=once(core,"function boot(old) { try {", "function boot(old) { OpenAIClient.configure(); old = null; try {")
core=once(core,"    KEYV.boot(se && se.apiKey);", "    if(se && se.apiProvider!=='openai')APP.settings.apiProvider='legacy'; KEYV.boot(se && se.apiKey);")
core=once(core,"const restored = await restoreSaved();", "const restored = await restoreSaved(); OpenAIClient.configure();")
core=once(core,"function openSettings() {", "function openSettings() { OpenAIClient.configure();") if 'function openSettings() {' in core else core
core=core.replace('Claude','OpenAI').replace('claude-sonnet-5','gpt-4.1-mini').replace('placeholder="sk-ant-…"','placeholder="sk-proj-…"')
# The helper migration guard must still recognise stored Claude model names.
core=core.replace("apiOn: false, apiModel: 'gpt-4.1-mini'", "apiOn: false, apiProvider: 'openai', apiModel: 'gpt-4.1-mini'")
core=core.replace('from OpenAI via the Anthropic API','from OpenAI via its API')
core=core.replace('Only summary figures (no names, no SKU detail) are sent.', 'The analyst sends summary figures and your question; complaint classification sends complaint text. The key is decrypted in this browser during use and excluded from saved HTML/JSON. API billing is separate from ChatGPT subscriptions.')
core=core.replace('Nobody can use the OpenAI API from this Cockpit without the password.', 'The saved key can be used through this dashboard only after unlocking it. This is a local key lock, not a login or protection for the dashboard data.')
# Replace the complete provider-specific analyst adapter; render returned text safely.
a=core.index('AI.askOpenAI = async function (q, c) {');b=core.index('\n};',a)+3
core=core[:a]+"""AI.askOpenAI = async function (q, c) {
  const r=await OpenAIClient.request({instructions:'You are an operations finance analyst for a Greencore food-to-go factory (Northampton, Units ABC, D, K). Answer concisely using ONLY the JSON figures given. Hours: positive = adverse. UPLH = units per labour hour. Product mix effects are commercial, execution is operational. Use short plain-text bullet points, no HTML. Dates dd-mm-yyyy. If the data cannot answer, say what file would.',input:'Data: '+AI.contextSummary(c)+'\\n\\nQuestion: '+q,maxOutputTokens:1200});
  return F.esc(r.text).replace(/\\n/g,'<br>');
};"""+core[b:]
assert 'api.anthropic.com' not in core
html=html[:m.start(1)]+core+html[m.end(1):]
# Preserve old classification objects; append provenance only for new API results.
m=re.search(r'<script id="quality-module">(.*?)</script>',html,re.S);quality=m[1]
a=quality.index('  async function classifyApi() {');b=quality.index('  function copyPack(list) {',a);quality=quality[:a]+classifier+'\n'+quality[b:]
quality=once(quality,"cmp: [].concat(cl.objective_signals || [], cl.subjective_signals || []).join(', '),", "cmp: esc([].concat(cl.objective_signals || [], cl.subjective_signals || []).join(', ')),")
quality=once(quality,'function applyCls(id, parsed) {','function applyCls(id, parsed, provenance) {')
quality=once(quality,'    const raw = Object.assign({}, (Q.d.complaints[id])',"    if(provenance)cls.provenance=provenance;\n    const raw = Object.assign({}, (Q.d.complaints[id])")
quality=once(quality,"if (Q.running) { Q.cancel = true; return; }", "if (Q.running) { Q.cancel = true; Q.controller?.abort(); return; }")
quality=quality.replace('Claude','OpenAI').replace('to Anthropic','to OpenAI').replace('paste it into OpenAI','paste it into your approved ChatGPT workspace')
quality=quality.replace('The Context Pack route keeps data off the wire:', 'The dashboard makes no API call for Context Packs:')
quality=once(quality,'    g.appendChild(s1);',"    s1.classList.add('q-openai-source');g.appendChild(s1);")
quality=once(quality,"      cd.insertAdjacentHTML('beforeend', '<table", "      if(cl.provenance)kv.push(['Classification source',cl.provenance.provider+' · '+cl.provenance.model+' · '+cl.provenance.classifiedAt],['Review status',cl.provenance.review||'AI suggestion']);\n      cd.insertAdjacentHTML('beforeend', '<table")
html=html[:m.start(1)]+quality+html[m.end(1):]
html=html.replace('</head>','<style id="openai-responsive">.q-openai-source .t{table-layout:fixed;width:100%}.q-openai-source th{width:35%!important}.q-openai-source th,.q-openai-source td{white-space:normal;overflow-wrap:anywhere}#q-cls-prog{overflow-wrap:anywhere}</style></head>',1)
# Settings restored by JSON imports must use the same explicit migration.
html=once(html,'delete APP.settings.apiKey;if(j.runRate', 'delete APP.settings.apiKey;OpenAIClient.configure();if(j.runRate')
# Live saves must choose an OpenAI shell, rather than silently reverting to Claude.
html=once(html,'<head>\n<meta charset="utf-8">','<head>\n<meta charset="utf-8">\n<meta name="cockpit-ai-provider" content="openai-v1">')
html=once(html,"  var head=await file.slice(0,Math.min(file.size,2*1024*1024)).text();", "  var head=await file.slice(0,Math.min(file.size,2*1024*1024)).text();\n  if(document.querySelector('meta[name=\"cockpit-ai-provider\"]')&&head.indexOf('name=\"cockpit-ai-provider\" content=\"openai-v1\"')<0)throw new Error('Choose the updated OpenAI v6.5.1 HTML file. Older files would restore the Claude connection.');")
html=html.replace("fileBase\": \"FY27_Labour_Command_Cockpit\"", "fileBase\": \"Cockpit_Cost_PO_OpenAI_v6_5_1\"")
# Leave all embedded snapshots, seeds and business data byte-for-byte identical.
for match in re.finditer(r'<script\b([^>]*)>(.*?)</script>',original,re.S):
 attrs,body=match.groups()
 if 'type="application/' in attrs:
  identity=re.search(r'id="([^"]+)"',attrs)
  if identity:
   new=re.search(r'<script\b[^>]*\bid="'+identity[1]+r'"[^>]*>(.*?)</script>',html,re.S)
   assert new and new[1]==body,identity[1]
assert 'api.anthropic.com' not in html
assert html.count('https://api.openai.com/v1/responses')==1
dest.write_text(html)
print(json.dumps({'output':str(dest),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'embeddedDataUnchanged':True},indent=2))
