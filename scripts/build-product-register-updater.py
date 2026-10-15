"""Rebuild the code-only product register updater and ZIP; no source data needed."""
from pathlib import Path
import zipfile
r=Path(__file__).resolve().parent.parent
p=r/'Cockpit_Product_Register_Updater.html'
old=p.read_text(); header=old.split('<script id="product-register-payload"')[0]
header=header.replace('Add the product register to your cockpit','Fix product units in your cockpit')
header=header.replace('The updater also corrects the identified Bang Bang wrap mapping.', 'The updater links the Bang Bang chicken wrap to Unit B in Quality reports, charts and complaint lists. Files with the earlier product register can also be updated.')
code=(r/'scripts/product-register.js').read_text();installer=(r/'scripts/product-register-installer.js').read_text()
assert '</script' not in code.lower() and '</script' not in installer.lower()
handler='''(function(){'use strict';const input=document.getElementById('source'),status=document.getElementById('status'),download=document.getElementById('download');let url,request=0;
input.onchange=async()=>{const current=++request;download.hidden=true;try{
 const file=input.files[0];if(!file)return;status.textContent='Checking your saved cockpit…';
 const source=await file.text();if(current!==request)return;
 const result=installProductRegister(source,document.getElementById('product-register-payload').textContent);
 if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob([result],{type:'text/html'}));download.href=url;download.download=file.name.replace(/\\.html?$/i,'')+'_Quality_Unit_Fix.html';download.hidden=false;
 status.textContent='Ready. Click Download updated cockpit below, then open the new HTML file. Bang Bang Chicken Wrap will be in Unit B. Your saved records and original file are retained.';
}catch(error){if(current===request)status.textContent=error.message;}};
})();'''
p.write_text(header+'<script id="product-register-payload" type="text/plain">'+code+'</script><script>\n'+installer+'\n'+handler+'\n</script></body></html>')
with zipfile.ZipFile(r/'Cockpit_Product_Register_Updater.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['Cockpit_Product_Register_Updater.html','Product_Register_Updater_Guide.md']:z.write(r/name,name)
print('Built code-only updater and ZIP')
