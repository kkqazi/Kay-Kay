const fs=require('fs');const records=fs.readFileSync(process.argv[2],'utf8').trim().split('\n').map(JSON.parse),accs={};
const acc=()=>({a:0x811c9dc5,b:0x01000193^0x9e3779b9,n:0});
function feed(x,s){for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);x.a^=c;x.a=Math.imul(x.a,16777619);x.b^=c;x.b=Math.imul(x.b,0x5bd1e995);x.b^=x.b>>>15;}x.n+=s.length;}
const end=x=>(x.a>>>0).toString(16)+(x.b>>>0).toString(16)+'-'+x.n.toString(36);
for(const o of records){const p=o.t==='ls'?'ls:'+o.k:o.t==='db'?'db:'+o.name:['rows','se'].includes(o.t)?'idb:'+o.db+'/'+o.s:null;if(p)feed(accs[p]||(accs[p]=acc()),JSON.stringify(o));}
const parts=Object.fromEntries(Object.entries(accs).map(([k,v])=>[k,end(v)])),total=acc();Object.keys(parts).sort().forEach(k=>feed(total,k+'='+parts[k]+';'));process.stdout.write(JSON.stringify({parts,hash:end(total)}));
