const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const katex=require('../assets/vendor/katex/katex.min.js'),M=require('../js/math.js'),Signal=require('../js/signal-math.js');
const types=['unnormalized','symmetric','randomwalk'];
function loadCopy(){
 const context={window:{}};
 for(const name of ['content','learning','course','module-guides'])vm.runInNewContext(fs.readFileSync(require.resolve(`../js/${name}.js`),'utf8'),context);
 return context.window;
}

test('two group labels measure crossing cost and balanced labels produce the stated RatioCut',()=>{
 const g=M.preset('path');g.edges.forEach((e,i)=>e.w=.3+.2*i);const a=M.analyze(g.nodes,g.edges),n=g.nodes.length;
 for(let size=1;size<n;size++){
  const other=n-size,cut=g.edges.filter(e=>(e.a<size)!==(e.b<size)).reduce((sum,e)=>sum+e.w,0);
  const labels=g.nodes.map((_,i)=>i<size?1:-1),balanced=g.nodes.map((_,i)=>i<size?Math.sqrt(other/(size*n)):-Math.sqrt(size/(other*n)));
  assert.ok(Math.abs(M.energy(a.A,labels)-4*cut)<1e-10);
  assert.ok(Math.abs(balanced.reduce((sum,x)=>sum+x,0))<1e-10);
  assert.ok(Math.abs(balanced.reduce((sum,x)=>sum+x*x,0)-1)<1e-10);
  assert.ok(Math.abs(M.energy(a.A,balanced)-cut*(1/size+1/other))<1e-10);
 }
});

test('ideal disconnected groups have equal spectral coordinates after the appropriate normalization',()=>{
 const nodes=Array.from({length:6},()=>({})),edges=[{a:0,b:1,w:1},{a:1,b:2,w:1},{a:3,b:4,w:2},{a:3,b:5,w:1}];
 for(const type of types){
  const a=M.analyze(nodes,edges,type),rows=nodes.map((_,i)=>a.vectors.slice(0,2).map(v=>v[i]));
  if(type==='symmetric')assert.ok(Math.hypot(...rows[0].map((x,j)=>x-rows[1][j]))>.1);
  const coordinates=type==='symmetric'?rows.map(row=>row.map(x=>x/Math.hypot(...row))):rows;
  for(const component of [[0,1,2],[3,4,5]])for(const i of component)assert.ok(Math.hypot(...coordinates[i].map((x,j)=>x-coordinates[component[0]][j]))<1e-9);
 }
});
test('all evaluated guide and signal explanation formulas parse strictly in both languages and every mode',()=>{
 const {SpectralCourse,LabCopy}=loadCopy(),formulas=[];
 const tex=source=>{formulas.push(source);return katex.renderToString(source,{throwOnError:true,strict:'error'});};
 for(const lang of ['zh','en']){
  for(const type of types)for(const module of SpectralCourse.modules)SpectralCourse.guide(module,lang,tex,type);
  for(const [key,source]of Object.entries(LabCopy[lang]))if(/Formula(?:Euclidean|Randomwalk|Unnormalized|Symmetric)$/.test(key))tex(source);
 }
 assert.ok(formulas.some(source=>source.includes('\\operatorname{RatioCut}')));
 assert.ok(formulas.some(source=>source.includes('f\\perp v_1,\\ldots,v_{r-1}')));
});
test('Fourier primer uses transpose only for symmetric Laplacians and the degree-weighted dual for random walk',()=>{
 const {SpectralCourse}=loadCopy();
 for(const lang of ['zh','en'])for(const type of types){
  const formulas=[];
  SpectralCourse.guide('fourier',lang,source=>{formulas.push(source);return `<math>${source}</math>`;},type);
  const basis=formulas.find(source=>source.includes('\\Lambda'));
  assert.ok(basis);
  if(type==='randomwalk'){
   assert.match(basis,/V\\Lambda V\^\{-1\}/);
   assert.match(basis,/\\frac\{v_r\^\{\\mathsf T\}D_\*f\}\{v_r\^\{\\mathsf T\}D_\*v_r\}/);
   assert.doesNotMatch(basis,/U\^\{\\mathsf T\}f/);
  }else{
   assert.match(basis,/U\^\{\\mathsf T\}U=I/);
   assert.match(basis,/\\widehat f&?=U\^\{\\mathsf T\}f/);
   assert.ok(basis.includes(type==='symmetric'?'L_{\\mathrm{sym}}':'L_0'));
  }
 }
});
test('the three energy explanations agree with the metric used for a constant signal on an irregular graph',()=>{
 const {LabCopy}=loadCopy(),A=[[0,1,0],[1,0,1],[0,1,0]],f=[1,1,1];
 for(const lang of ['zh','en'])for(const suffix of ['Unnormalized','Symmetric','Randomwalk'])assert.ok(LabCopy[lang][`spectralEnergy${suffix}`]);
 const unnormalized=Signal.transform(M.analyzeAdjacency(A,'unnormalized'),f,'unnormalized');
 const randomwalk=Signal.transform(M.analyzeAdjacency(A,'randomwalk'),f,'randomwalk');
 const symmetric=Signal.transform(M.analyzeAdjacency(A,'symmetric'),f,'symmetric');
 assert.ok(Math.abs(unnormalized.frequencyEnergy)<1e-10);
 assert.ok(Math.abs(randomwalk.frequencyEnergy)<1e-10);
 assert.ok(symmetric.frequencyEnergy>.1);
 assert.equal(unnormalized.signalSquaredNorm??unnormalized.energy,3);
 assert.equal(randomwalk.signalSquaredNorm??randomwalk.energy,4);
});
