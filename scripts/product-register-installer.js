/* Code-only installer: update modules without changing saved data blocks. */
(function(root){
 'use strict';
 function installProductRegister(source,code){
  if(!/<script\b[^>]*\bid=["']liveSnapMeta["']/i.test(source)||!source.includes('bva-script'))throw Error('Choose your latest saved Budget vs Actual cockpit HTML.');
  const quality=/<script\b[^>]*\bid=["']quality-module["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
  const matches=[...source.matchAll(quality)];if(matches.length!==1)throw Error('The Quality module could not be identified safely. Your file has not been changed.');
  const hook='if(window.ProductRegister)window.ProductRegister.mapQuality(c,hit); /* product-register-quality-link */';
  let body=matches[0][1];
  if(!body.includes('/* product-register-quality-link */')){
   const anchor='c.fam = (man && man.family)';
   if(body.split(anchor).length!==2)throw Error('This Quality version needs a different updater. Your file has not been changed.');
   body=body.replace(anchor,()=>hook+'\n      '+anchor);
  }
  source=source.replace(quality,whole=>whole.replace(matches[0][1],()=>body));
  const module=/<script\b[^>]*\bid=["']product-register-module["'][^>]*>[\s\S]*?<\/script\s*>/gi;
  const installed=[...source.matchAll(module)];if(installed.length>1)throw Error('Multiple product registers found. Your file has not been changed.');
  const block='<scr'+'ipt id="product-register-module">\n'+code+'\n</scr'+'ipt>';
  if(installed.length)return source.replace(module,()=>block);
  const end=[...source.matchAll(/<\/body\s*>/gi)].pop();if(!end)throw Error('The selected HTML has no closing body tag.');
  return source.slice(0,end.index)+'\n'+block+'\n'+source.slice(end.index);
 }
 root.installProductRegister=installProductRegister;
 if(typeof module!=='undefined'&&module.exports)module.exports=installProductRegister;
})(typeof window==='undefined'?globalThis:window);
