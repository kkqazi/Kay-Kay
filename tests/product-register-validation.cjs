const assert=require('node:assert/strict'),{validate,lineUnit,isCode}=require('../scripts/product-register.js');
const d={code:'87958',description:'Bang Bang butternut wrap',unit:'B',line:'B4'};let checks=0;
assert.equal(validate(d).unit,'B');checks++;
for(const bad of [{...d,line:'A6'},{...d,unit:'SITE'},{...d,description:''},{...d,code:'constructor'},{...d,code:'<script>'},{...d,line:'B'.repeat(49)}]){assert.throws(()=>validate(bad));checks++;}
assert.equal(validate({...d,line:''}).line,'');checks++;
assert.equal(validate({...d,code:'custom-01',unit:'k',line:'k2'}).code,'CUSTOM-01');checks++;
assert.equal(lineUnit('Unit B - Line 04'),'B');checks++;
assert.equal(isCode('__proto__'),false);checks++;
console.log(JSON.stringify({status:'PASS',checks}));
