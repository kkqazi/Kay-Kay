/* Public fixtures are synthetic. Actual source files are supplied as private command arguments. */
const assert=require('node:assert/strict'),fs=require('node:fs'),EO=require('../scripts/daily-labour/efficiency.js');
const csv='\uFEFFLine Name,Shift Date,Valid Packs,Packs Made,Pack Count Adjustment,Run ID,Product Description\r\n'+
 'Unit A - Line 01,01/10/2026,120,120,0,one,"Product, with comma"\r\n'+
 'Unit B - Line 02,10/01/2026,999,999,0,other,Other day\r\n'+
 ',,,,,,\r\n'+
 'Unit C - Line 03,01/10/2026,80,80,0,two,"Quoted ""name""\nsecond line"\r\n';
const p=EO.parseCSV(csv,{id:'csv',productionDate:'2026-10-01'}),o=EO.output({efficiencyFiles:[p],dayEfficiency:{'2026-10-01':['csv']}},'2026-10-01');
assert.equal(o.totalReportedUnits,200);assert.equal(o.included.length,2);assert.equal(p.rows[0].description,'Product, with comma');assert.equal(p.rows[1].description,'Quoted "name"\nsecond line');assert.deepEqual(p.rows.map(x=>x.row),[2,5]);assert.equal(p.meta.observedFirstDate,'2026-01-10');
assert.throws(()=>EO.parseCSV(csv,{productionDate:'2026-10-02'}),/No Efficiency CSV output rows match/);
assert.throws(()=>EO.parseCSV(csv+'"unterminated'),/quoted field/);
assert.equal(EO.parseCSV('Line Name;Shift Date;Packs Made\nUnit A - Line 01;01/10/2026;23',{productionDate:'2026-10-01'}).rows[0].units,23);
assert.equal(EO.productionDate('46296'),'2026-10-01');
assert.equal(EO.parseCSV(csv+'Unit A - Line 01,46296,25,25,0,serial,Serial date\n',{productionDate:'2026-10-01'}).rows.length,3);
let actualDates=0;
if(process.argv[2]){
 const raw=fs.readFileSync(process.argv[2],'utf8'),oracle=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 for(const[date,expected]of Object.entries(oracle)){
  const f=EO.parseCSV(raw,{id:'actual',productionDate:date}),out=EO.output({efficiencyFiles:[f],dayEfficiency:{[date]:['actual']}},date);
  assert.deepEqual(out.blocked,[]);assert.equal(out.duplicates,0);assert.equal(f.meta.outputField,'Valid Packs');assert.equal(f.meta.dateBasis,'Shift Date');
  for(const[u,quantity]of Object.entries(expected.units)){assert.equal(out.byUnit[u].units,quantity);assert.equal(out.byUnit[u].runs,expected.runs[u]);}
  assert.deepEqual(f.rows.map(x=>x.row),expected.sourceRows);actualDates++;
 }
}
console.log(JSON.stringify({status:'PASS',actualDates,syntheticChecks:'UK dates, original rows, escaped commas/quotes/newlines, semicolon, wrong date, malformed CSV'}));
