const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../js/math.js'),S=require('../js/signal-math.js'),C=require('../js/convolution-math.js'),Session=require('../js/session.js'),katex=require('../assets/vendor/katex/katex.min.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Chapter VII polynomial output equals Chapter VIII local output with shared parameters',()=>{
 for(const kind of ['path','star','barbell','disconnected']){
  const graph=M.preset(kind);graph.edges.forEach((edge,i)=>edge.w=.25+(i%5)*.4);graph.nodes.push({x:0,y:0});
  const a=M.analyze(graph.nodes,graph.edges,'unnormalized'),f=graph.nodes.map((_,i)=>Math.cos(i*.7));
  for(const alphaFraction of [0,.5,1])for(const steps of [0,1,3,12]){
   const settings={alphaFraction,steps},options=C.settingsFor(a,settings),spectral=S.process(a,f,'unnormalized',{kind:'polynomial',alpha:options.alpha,steps}),local=C.process(a,f,settings);
   spectral.output.forEach((x,i)=>near(x,local.output[i]));
   spectral.gains.forEach((x,i)=>near(x,local.gains[i]));
   near(spectral.outputFrequencyEnergy,M.energy(a.A,local.output));
  }
 }
 for(const count of [0,1]){
  const a=M.analyze(Array.from({length:count},()=>({})),[]),f=Array(count).fill(1),options=C.settingsFor(a,{steps:12});
  assert.deepEqual(S.process(a,f,'unnormalized',{kind:'polynomial',...options}).output,f);
 }
});
test('the shared polynomial rejects normalized bases and invalid parameters',()=>{
 const graph=M.preset('star'),f=graph.nodes.map(()=>1);
 for(const type of ['symmetric','randomwalk'])assert.throws(()=>S.process(M.analyze(graph.nodes,graph.edges,type),f,type,{kind:'polynomial',alpha:.1,steps:1}),RangeError);
 const a=M.analyze(graph.nodes,graph.edges);
 for(const settings of [{alpha:-1,steps:1},{alpha:NaN,steps:1},{alpha:.1,steps:1.5},{alpha:.1,steps:13}])assert.throws(()=>S.process(a,f,'unnormalized',{kind:'polynomial',...settings}),RangeError);
});
function viewHarness(lang,type,kind,count=7){
 const graph={nodes:Array.from({length:count},(_,i)=>({x:60*i,y:30*(i%2),signal:Math.sin(i*.7)})),edges:Array.from({length:Math.max(0,count-1)},(_,i)=>({a:i,b:i+1,w:.5+i*.25}))};
 const state=Session.create(M,graph);Object.assign(state,{lang});Session.setType(state,type);Object.assign(state.spectralSignal,{view:kind==='truncate'?'reconstruction':'filtering',filter:kind==='truncate'?'heat':kind,selected:Math.max(0,count-1)});state.convolutionLab={alphaFraction:.8,steps:3,selected:0};
 const elements=new Map(),formulas=[],$=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',disabled:false});return elements.get(id);};
 const sandbox={window:{SignalMath:S,ConvolutionMath:C,LabSession:Session,location:{hash:''}},document:{activeElement:null,querySelectorAll:()=>[]}};
 for(const file of ['content','learning','course','signal-view','convolution-view'])vm.runInNewContext(fs.readFileSync(require.resolve(`../js/${file}.js`),'utf8'),sandbox);
 const ctx={state,M,$,t:key=>sandbox.window.LabCopy[lang][key]||key,tex:(source,displayMode=false)=>{formulas.push(source);return katex.renderToString(source,{throwOnError:true,strict:'error',displayMode});},fmt:(value,digits=3)=>value.toFixed(digits),header:title=>`<h3>${title}</h3>`,select:(id,key,options,value)=>`<select id="${id}">${options.map(option=>`<option value="${option}" ${option===value?'selected':''}>${option}</option>`).join('')}</select>`,svg:()=>'',color:()=>'',save(){},checkpoint(){},rerender(){sandbox.window.SignalLabView.render(ctx);}};
 sandbox.window.SignalLabView.render(ctx);
 return {state,sandbox,$,ctx,formulas,graph};
}
test('bilingual signal views parse every formula and explain squared norms separately from variation',()=>{
 for(const lang of ['zh','en'])for(const type of ['unnormalized','symmetric','randomwalk'])for(const kind of ['truncate','heat','highpass','ideal','polynomial'])for(const count of [0,1,7]){
  const {state,$,graph,formulas}=viewHarness(lang,type,kind,count);
  assert.deepEqual(state.graph.nodes.map(node=>node.signal),graph.nodes.map(node=>node.signal));
  assert.ok(formulas.some(source=>source.includes('Q(f)')));assert.ok(formulas.some(source=>source.includes('retention')));
  assert.match($('workspace').innerHTML,/signal-norm-explanation/);
  assert.match($('signal-metrics').innerHTML,lang==='zh'?/平方範數/:/squared norm/i);
  if(kind==='polynomial'){assert.equal(state.type,'unnormalized');assert.equal($('signal-laplacian').disabled,true);}
 }
});
test('VII and VIII handoff preserves the input, filter parameters, selected node, and saved polynomial',()=>{
 const {state,sandbox,$,ctx}=viewHarness('zh','randomwalk','polynomial'),input=state.graph.nodes.map(node=>node.signal);
 $('signal-poly-strength').oninput({target:{value:'.65'}});$('signal-poly-steps').oninput({target:{value:'5'}});
 $('continue-convolution').onclick();assert.equal(sandbox.window.location.hash,'convolution');assert.equal(state.convolutionLab.selected,state.spectralSignal.selected);
 sandbox.window.ConvolutionLabView.render(ctx);
 assert.deepEqual(state.graph.nodes.map(node=>node.signal),input);assert.equal(state.convolutionLab.alphaFraction,.65);assert.equal(state.convolutionLab.steps,5);
 $('convolution-return-poly').onclick();assert.equal(sandbox.window.location.hash,'fourier');assert.equal(state.spectralSignal.filter,'polynomial');assert.equal(state.type,'unnormalized');
 const restored=Session.create(M);assert.ok(Session.restore(restored,JSON.parse(JSON.stringify(Session.snapshot(state)))));
 assert.equal(restored.spectralSignal.filter,'polynomial');assert.deepEqual(restored.convolutionLab,state.convolutionLab);assert.deepEqual(restored.graph.nodes.map(node=>node.signal),input);
});
