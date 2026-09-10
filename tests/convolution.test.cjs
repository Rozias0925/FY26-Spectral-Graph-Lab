const test=require('node:test'),assert=require('node:assert/strict'),M=require('../js/math.js'),C=require('../js/convolution-math.js');
const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<eps,`${a} != ${b}`);
function path(n){return {nodes:Array.from({length:n},(_,i)=>({x:i,y:0})),edges:Array.from({length:Math.max(0,n-1)},(_,i)=>({a:i,b:i+1,w:1+i*.1}))};}
test('spectral filtering equals repeated local multiplication on irregular weighted graphs',()=>{
 for(const kind of ['star','barbell','grid','disconnected']){
  const g=M.preset(kind);g.edges.forEach((e,i)=>e.w*=.2+(i%5)*.35);g.nodes.push({x:0,y:0});
  const a=M.analyze(g.nodes,g.edges),f=g.nodes.map((_,i)=>Math.sin(i*.7)+i*.02);
  for(const alphaFraction of [0,.5,1])for(let steps=0;steps<=3;steps++){
   const r=C.process(a,f,{alphaFraction,steps});assert.ok(r.difference<1e-8);
   r.output.forEach((x,i)=>near(x,r.spectral[i]));
   near(r.output.at(-1),f.at(-1));
  }
 }
});
test('a degree-K polynomial cannot carry an impulse beyond K graph edges',()=>{
 const g=path(8),a=M.analyze(g.nodes,g.edges),f=[1,0,0,0,0,0,0,0],distances=C.hopDistances(a.A,0);
 for(let steps=0;steps<=3;steps++){
  const r=C.process(a,f,{steps,alphaFraction:.5});
  r.output.forEach((x,i)=>{if(distances[i]>steps)near(x,0);else assert.ok(x>0);});
 }
});
test('constant component values, total mass and convex range are preserved',()=>{
 const g=path(7);g.edges.splice(2,1);g.nodes.push({});const a=M.analyze(g.nodes,g.edges),componentConstant=[2,2,2,-1,-1,-1,-1,7];
 for(const alphaFraction of [0,.5,1])for(let steps=0;steps<=3;steps++){
  const r=C.process(a,componentConstant,{alphaFraction,steps});r.output.forEach((x,i)=>near(x,componentConstant[i]));
  const f=[-2,1,.3,-.5,1,0,-1,.4],q=C.process(a,f,{alphaFraction,steps});
  near(q.output.reduce((x,y)=>x+y,0),f.reduce((x,y)=>x+y,0));
  assert.ok(q.output.every(x=>x>=-2-1e-9&&x<=1+1e-9));
 }
});
test('displayed self and neighbor terms add to the final selected-node result',()=>{
 const g=M.preset('star'),a=M.analyze(g.nodes,g.edges),f=g.nodes.map((_,i)=>Math.cos(i));
 for(let steps=0;steps<=3;steps++)for(const selected of [0,4]){
  const r=C.process(a,f,{steps,alphaFraction:.75}),terms=C.contributions(a,r,selected);
  near(terms.reduce((sum,x)=>sum+x.contribution,0),r.output[selected]);
  near(terms.reduce((sum,x)=>sum+x.weight,0),1);assert.ok(terms.every(x=>x.weight>=0));
 }
});
test('expanded polynomial coefficients give the same filter through powers of L',()=>{
 const g=path(6),a=M.analyze(g.nodes,g.edges),f=g.nodes.map((_,i)=>Math.sin(i));
 for(let steps=0;steps<=3;steps++){
  const r=C.process(a,f,{steps,alphaFraction:.7}),polynomial=Array(f.length).fill(0);let power=f.slice();
  r.coefficients.forEach(coefficient=>{power.forEach((v,i)=>polynomial[i]+=coefficient*v);power=a.raw.map(row=>row.reduce((sum,l,j)=>sum+l*power[j],0));});
  polynomial.forEach((x,i)=>near(x,r.output[i]));
 }
});
test('empty, isolated and zero-weight graphs use identity without NaN',()=>{
 for(let n=0;n<=2;n++){
  const a=M.analyze(Array.from({length:n},()=>({})),n===2?[{a:0,b:1,w:0}]:[]),f=Array(n).fill(.7);
  const r=C.process(a,f,{steps:3});assert.deepEqual(r.output,f);assert.equal(r.alpha,0);near(r.difference,0);
  assert.deepEqual(C.contributions(a,r,-1),[]);
 }
});
test('nonsymmetric or normalized eigensystems and invalid signals are rejected',()=>{
 const g=M.preset('star'),f=g.nodes.map(()=>1);
 for(const type of ['symmetric','randomwalk'])assert.throws(()=>C.process(M.analyze(g.nodes,g.edges,type),f),RangeError);
 assert.throws(()=>C.process(M.analyze(g.nodes,g.edges),[NaN]),RangeError);
});
test('evaluated bilingual view renders valid LaTeX and preserves the shared graph and Laplacian choice',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),katex=require('../assets/vendor/katex/katex.min.js');
 const source=fs.readFileSync(require.resolve('../js/convolution-view.js'),'utf8');
 for(const lang of ['zh','en'])for(const count of [0,1,7])for(const steps of [0,1,3]){
  const g=path(count);g.nodes.forEach((p,i)=>p.signal=Math.sin(i*.8));
  const original=JSON.stringify(g),state={lang,type:'randomwalk',graph:g,convolutionLab:{alphaFraction:.75,steps,selected:0},undoHistory:[]},elements=new Map(),formulas=[];
  const $=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',disabled:false});return elements.get(id);};
  const sandbox={window:{ConvolutionMath:C,LabSession:{refreshWeights(){}}},document:{activeElement:null}};
  vm.runInNewContext(source,sandbox);
  sandbox.window.ConvolutionLabView.render({state,M,$,tex:(value,displayMode=false)=>{formulas.push(value);return katex.renderToString(value,{throwOnError:true,strict:'error',displayMode});},fmt:(value,digits=3)=>value.toFixed(digits),header:title=>`<h3>${title}</h3>`,svg:()=>'',color:()=>'',save(){},checkpoint(){},rerender(){}});
  assert.equal(JSON.stringify(g),original);assert.equal(state.type,'randomwalk');
  assert.ok(formulas.includes(String.raw`\rho`));assert.ok(formulas.includes(String.raw`L_0=U\Lambda U^{\mathsf T}`));
  assert.ok(formulas.some(value=>value.includes(String.raw`\sum`)));assert.ok(!formulas.some(value=>/[\r\n\t]/.test(value)));
  assert.match($('convolution-error').textContent,/e[+-]\d+/);
 }
});
