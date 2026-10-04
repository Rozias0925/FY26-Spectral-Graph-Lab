const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../js/math.js'),V=require('../js/variational-math.js'),Session=require('../js/session.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);

test('a carried mode preserves weighted topology and values independently of later graph edits',()=>{
 const graph=V.teachingGraph('bridge6'),analysis=M.analyze(graph.nodes,graph.edges),snapshot=V.createModeSnapshot(graph,analysis,1);
 const before=JSON.stringify(snapshot);near(Math.hypot(...snapshot.values),1);
 const copied=M.analyze(snapshot.nodes,snapshot.edges,'unnormalized',{values:[snapshot.lambda],vectors:[snapshot.values]});
 near(V.energyDetails(copied,snapshot.values).total,snapshot.lambda);
 graph.nodes[0].x+=100;graph.edges[0].w=7;analysis.vectors[1][0]=10;
 assert.equal(JSON.stringify(snapshot),before);
 snapshot.edges[0].w=3;assert.equal(graph.edges[0].w,7);
});

test('the handoff rejects normalized modes and missing eigenpairs',()=>{
 const graph=V.teachingGraph(),analysis=M.analyze(graph.nodes,graph.edges);
 for(const type of ['symmetric','randomwalk'])assert.equal(V.createModeSnapshot(graph,analysis,1,'shared',type),null);
 for(const index of [-1,5,1.2])assert.equal(V.createModeSnapshot(graph,analysis,index),null);
 assert.equal(V.createModeSnapshot({nodes:[],edges:[]},M.analyze([],[]),0),null);
});

test('surface modes reach Chapter V without a fresh eigensolve, preserve the drawing, and restore after editing',()=>{
 const meshContext={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../js/mesh-data.js'),'utf8'),meshContext);
 const bunny=meshContext.window.SpectralMeshes.bunny;
 for(const lang of ['zh','en'])for(const kind of ['shared','grid','sphere','torus','bunny']){
  const data=kind==='shared'?null:kind==='bunny'?bunny:M.mesh(kind);
  const graph=data?{nodes:data.vertices.map(([x,y,z])=>({x,y:-y,z})),edges:M.meshEdges(data),faces:data.faces}:V.teachingGraph('bridge6');
  const original=M.analyze(graph.nodes,graph.edges,'unnormalized',kind==='bunny'?bunny.modes.unnormalized:null);
  const snapshot=V.createModeSnapshot(graph,original,1,kind);
  const state=Session.create(M,V.teachingGraph());state.module='smoothness';state.lang=lang;state.type='randomwalk';
  Object.assign(state.variationalLab,{modeSnapshot:snapshot,smoothSource:'ivMode',smoothValues:{ivMode:snapshot.values.slice()}});
  const before=JSON.stringify(state.graph),elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};
  const context={window:{VariationalMath:V,LabSession:Session},document:{querySelectorAll:()=>[]},setTimeout,clearTimeout};
  vm.runInNewContext(fs.readFileSync(require.resolve('../js/variational-view.js'),'utf8'),context);
  let calls=0;const math={...M,analyze(nodes,edges,type,precomputed){calls++;assert.equal(type,'unnormalized');assert.ok(precomputed);assert.equal(precomputed.vectors[0],snapshot.values);return M.analyze(nodes,edges,type,precomputed);}};
  const katex=require('../assets/vendor/katex/katex.min.js');
  context.window.VariationalLabView.render({state,M:math,$,tex:(source,displayMode=false)=>katex.renderToString(source,{displayMode,throwOnError:true,strict:'error'}),fmt:(x,d=3)=>Number.isFinite(x)?x.toFixed(d):'—',header:title=>`<h3>${title}</h3>`,svg:()=>'',color:()=>'',save(){},rerender(){}});
  assert.equal(calls,1);assert.equal(JSON.stringify(state.graph),before);assert.equal(state.type,'randomwalk');
  assert.match($('workspace').innerHTML,/function-selected-value/);assert.doesNotMatch($('workspace').innerHTML,/id="function-node-\d/);
  assert.match($('function-mode-check').innerHTML,lang==='zh'?/目前 f 就是/:/current f is this mode/);
  if(data)assert.equal(($('variational-graph').innerHTML.match(/<polygon /g)||[]).length,data.faces.length);
  $('function-selected-value').oninput({target:{value:String(snapshot.values[0]+.2)}});
  near(state.variationalLab.smoothValues.ivMode[0],snapshot.values[0]+.2);
  assert.match($('function-mode-check').innerHTML,lang==='zh'?/目前函數已修改/:/current function has been edited/);
  $('function-restore-mode').onclick();assert.deepEqual(state.variationalLab.smoothValues.ivMode,snapshot.values);
  assert.equal(calls,1);assert.equal(JSON.stringify(state.graph),before);
  if(kind==='bunny')assert.ok(snapshot.nodes.length>40);
 }
});
