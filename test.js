// Pruebas del motor (sin dependencias): node test.js
const fs=require('fs'),assert=require('assert');
const src=fs.readFileSync(__dirname+'/server.js','utf8');
const createEngine=new Function(src.slice(src.indexOf('function createEngine'),src.indexOf('//#ENGINE-END'))+';return createEngine')();
let k=0;const E=createEngine(()=>'id'+ ++k),H=(p,b)=>E.api('POST',p,{},b||{},true);
const a=E.api('POST','/join',{},{name:'Ana'}),b=E.api('POST','/join',{},{name:'ana'});
assert.equal(a[0],200);assert.notEqual(a[1].name.toLowerCase(),b[1].name.toLowerCase(),'nombres únicos');
assert.equal(a[1].cards[0].length,16,'cartilla 4x4 = 16 números');
assert.ok(a[1].cards[0].every(n=>n>=1&&n<=60)&&new Set(a[1].cards[0]).size===16,'16 números distintos del 1 al 60');
assert.equal(a[1].t,0,'por defecto platino');
assert.equal(E.api('POST','/join',{},{name:'<b>x​</b>'})[1].name,'bx/b','limpia <> y caracteres invisibles');
assert.equal(E.api('POST','/draw',{},{},false)[0],403,'sorteo exige clave');
assert.equal(H('/tier',{name:'Ana'})[1].t,1,'cambia a dorado');
assert.equal(E.api('POST','/tier',{},{name:'Ana'},false)[0],403,'cambiar categoría exige clave');
assert.equal(E.snap().top.find(x=>x[0]==='Ana')[3],1,'la lista muestra la categoría');
H('/config',{t:0,places:2});H('/config',{t:1,places:1,prizes:['Oro','','','','']});
assert.equal(E.snap().prizes[1][0],'Oro');
let n=0;while(H('/draw')[0]===200&&n<70)n++;
const s=E.snap();assert.ok(s.over,'la partida termina');assert.ok(new Set(s.called).size===s.called.length,'sin repetidos');
assert.ok(s.win[0].length&&s.win[0][0].place===1,'hay ganadores platino');
assert.ok(s.win[1].length===1&&s.win[1][0].names[0]==='Ana','Ana gana solo en dorado');
assert.ok(!s.win[0].some(g=>g.names.includes('Ana')),'un dorado no gana en platino');
assert.equal(H('/tier',{name:'Ana'})[0],409,'no se cambia de categoría con la partida empezada');
H('/reset');assert.equal(E.snap().called.length,0);assert.equal(E.snap().round,2);
assert.equal(E.snap().top.find(x=>x[0]==='Ana')[3],1,'la categoría se conserva en Nueva partida');
console.log('OK: todas las pruebas pasaron');
// v9: una cartilla completa = un premio; desempate con evento; imágenes de premios
{let k=0;const F=createEngine(()=>'z'+ ++k),G=(p,b)=>F.api('POST',p,{},b||{},true);
 const m=F.api('POST','/join',{},{name:'Multi'})[1];F.api('POST','/join',{},{name:'Solo'});G('/addcard',{name:'Multi',n:3});
 G('/config',{t:0,places:5});let n=0;while(G('/draw')[0]===200&&n<70)n++;
 const w=F.snap().win[0],all=w.flatMap(g=>g.names);
 assert.ok(all.filter(x=>x.startsWith('Multi')).length>=2,'quien tiene varias cartillas gana varios puestos');
 assert.ok(all.some(x=>/🎟️\d/.test(x)),'se indica la cartilla');
 const bad=G('/pimg',{i:0,img:'data:text/html;base64,AAAA'});assert.equal(bad[0],400,'solo imágenes');
 assert.equal(G('/pimg',{i:0,img:'data:image/jpeg;base64,AAAA'})[0],200);assert.equal(F.snap().iv[0],1);
 assert.equal(F.api('GET','/pimg',{i:'0'})[1].img,'data:image/jpeg;base64,AAAA');assert.equal(F.api('POST','/pimg',{},{i:0,img:null},false)[0],403,'imagen exige clave');
}
{let k=0;const F=createEngine(()=>'t'+ ++k),G=(p,b)=>F.api('POST',p,{},b||{},true);
 for(let i=0;i<4;i++)F.api('POST','/join',{},{name:'P'+i});G('/config',{t:0,places:3});
 let tied=false;for(let n=0;n<60&&!tied;n++){G('/draw');tied=F.snap().tie}
 if(tied){const r=G('/tiebreak'),e=F.snap().tbe;assert.equal(r[0],200);assert.ok(e&&e.k===1&&e.g[0].order.length===e.g[0].pool.length&&e.g[0].np>=1,'evento de desempate');
  assert.equal(G('/tiebreak')[0],409,'ya resuelto')}}
console.log('OK v9')
