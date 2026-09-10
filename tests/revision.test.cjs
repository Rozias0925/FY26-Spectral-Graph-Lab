const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../js/math.js'),S=require('../js/session.js'),katex=require('../assets/vendor/katex/katex.min.js');
const types=['unnormalized','symmetric','randomwalk'];
const options={method:'gaussian',neighbors:7,epsilon:.4,sigma:.77,k:2,type:'unnormalized',seed:20};
// Rounded coordinates from the user's rendered 48-point experiment: 40 outer + 8 inner.
const editedCircles=[[1.03,-.01],[.98,.12],[.94,.37],[.86,.47],[.86,.58],[.64,.70],[.62,.87],[.39,.90],[.28,.92],[.16,.98],[0,1],[-.24,.92],[-.35,.90],[-.51,.89],[-.64,.79],[-.72,.61],[-.82,.56],[-.89,.40],[-.92,.27],[-1.03,.05],[-.96,-.02],[-.99,-.19],[-.97,-.43],[-.87,-.48],[-.79,-.62],[-.66,-.72],[-.55,-.86],[-.41,-.88],[-.22,-1.03],[-.09,-.97],[.12,-1.04],[.33,-.91],[.41,-.91],[.61,-.84],[.70,-.72],[.84,-.60],[.93,-.50],[.93,-.33],[.94,-.13],[.97,.04],[-.05,.05],[.05,.05],[.10,-.09],[.02,-.11],[-.06,-.16],[-.16,-.08],[-.15,.03],[-.07,.13]];
test('regression: broad Gaussian circles split sideways; suggested sigma separates all 40 + 8 points',()=>{
 const truth=editedCircles.map((_,i)=>i<40?0:1),before=M.cluster(editedCircles,options);
 assert.equal(M.samePartition(before.spectral.labels,truth),false);
 for(const type of types){const after=M.cluster(editedCircles,{...options,type,sigma:M.recommendSigma(editedCircles)});assert.ok(M.samePartition(after.spectral.labels,truth),type);assert.notDeepEqual(before.analysis.A,after.analysis.A);assert.notDeepEqual(before.analysis.values,after.analysis.values);}
});
test('recommended local graph separates generated circles and moons across seeds and all Laplacians',()=>{
 for(const kind of ['circles','moons'])for(const seed of [7,20,42])for(const type of types){const p=M.dataset(kind,80,seed),r=M.cluster(p,{...options,...M.recommendGraph(p),seed,type});assert.ok(M.samePartition(r.spectral.labels,p.map((_,i)=>i%2)),`${kind} ${seed} ${type}`);}
});
test('sigma recommendation follows geometry scale and handles duplicates and empty input',()=>{
 const p=[[0,0],[1,0],[3,0]];assert.equal(M.recommendSigma(p),1);assert.equal(M.recommendSigma(p.map(p=>p.map(x=>10*x))),10);assert.equal(M.recommendSigma([[0,0],[0,0]]),null);assert.equal(M.recommendSigma([]),null);assert.equal(M.recommendSigma([[0,0]]),null);assert.equal(M.recommendSigma([[0,0],[0,0],[2,0]]),2);assert.equal(M.recommendSigma(p,[{a:0,b:2}]),3);
});
test('coordinate mode only weights selected edges and recomputes after moving',()=>{
 const s=S.create(M,{nodes:[{x:360,y:180},{x:460,y:180},{x:660,y:180}],edges:[{a:0,b:1,w:2}]});S.setGraphMode(M,s,'coordinate');s.graph.sigma=1;S.refreshWeights(M,s);assert.ok(Math.abs(s.graph.edges[0].w-Math.exp(-.5))<1e-12);const before=S.clusterShared(M,s);s.graph.nodes[1].x=560;S.refreshWeights(M,s);assert.ok(Math.abs(s.graph.edges[0].w-Math.exp(-2))<1e-12);assert.equal(s.graph.edges.length,1);assert.equal(S.clusterShared(M,s).analysis.A[0][2],0);assert.notDeepEqual(S.clusterShared(M,s).analysis.A,before.analysis.A);S.setGraphMode(M,s,'manual');assert.equal(s.graph.edges[0].w,2);
});
test('undo restores a whole drawing operation across modules without aliasing',()=>{
 const s=S.create(M),before=structuredClone(S.snapshot(s).graph);S.checkpoint(s);s.graph.nodes=[];s.graph.edges=[];s.module='playground';assert.ok(S.undo(s));assert.deepEqual(s.graph.nodes,before.nodes);assert.deepEqual(s.graph.edges,before.edges);assert.equal(S.undo(s),false);S.checkpoint(s);s.graph.nodes[0].x=999;S.checkpoint(s);s.graph.nodes[0].x=888;S.undo(s);assert.equal(s.graph.nodes[0].x,999);S.undo(s);assert.equal(s.graph.nodes[0].x,before.nodes[0].x);
});
test('coordinate mode, bandwidth, and original manual weights survive reload',()=>{
 const s=S.create(M);S.setGraphMode(M,s,'coordinate');s.graph.sigma=.625;S.refreshWeights(M,s);const next=S.create(M);assert.ok(S.restore(next,JSON.parse(JSON.stringify(S.snapshot(s)))));assert.equal(next.graph.mode,'coordinate');assert.equal(next.graph.sigma,.625);assert.deepEqual(next.graph.edges,s.graph.edges);S.setGraphMode(M,next,'manual');assert.equal(next.graph.edges[0].w,1);
});
test('partition comparison ignores label permutations but detects actual membership changes',()=>{assert.ok(M.samePartition([0,0,1],[4,4,8]));assert.ok(!M.samePartition([0,0,1],[4,8,8]));assert.ok(!M.samePartition([0,1],[0]));});
test('all centralized and explicit LaTeX formulas parse strictly',()=>{
 const c={window:{katex}};vm.runInNewContext(fs.readFileSync(require.resolve('../js/notation.js'),'utf8'),c);for(const source of Object.values(c.window.LabNotation.formulas))assert.doesNotThrow(()=>katex.renderToString(source,{throwOnError:true,strict:'error'}),source);
 const app=fs.readFileSync(require.resolve('../js/app.js'),'utf8');for(const match of app.matchAll(/String\.raw`([^`]*)`/g)){if(match[1].includes('${'))continue;assert.doesNotThrow(()=>katex.renderToString(match[1],{throwOnError:true,strict:'error'}),match[1]);}
});
test('worked lessons emit valid evaluated LaTeX with actual sum, fraction, and eigenvalue commands',()=>{
 const source=fs.readFileSync(require.resolve('../js/app.js'),'utf8'),lesson=source.slice(source.indexOf('function updateLesson(){'),source.indexOf('function renderParameterSettings(){'));
 const nodes=new Map(),formulas=[],state=S.create(M),context={state,graphMode:()=>1,fmt:(v,d=3)=>v.toFixed(d),t:key=>key,option:(key,selected,label)=>`<option>${label}</option>`,eigenControls:()=>'',bindEigenPicker:()=>{},saveState:()=>{},$:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);},tex:(source)=>{formulas.push(source);return katex.renderToString(source,{throwOnError:true,strict:'error'});}};
 Object.assign(state.graph,M.preset('path'));vm.createContext(context);vm.runInContext(lesson,context);
 for(const type of types)for(let step=0;step<5;step++){state.type=type;state.setup.step=step;state.graph.result=M.analyze(state.graph.nodes,state.graph.edges,type);context.updateLesson();}
 assert.ok(formulas.some(f=>f.includes('\\sum_j')));assert.ok(formulas.some(f=>f.includes('\\frac')));assert.ok(formulas.some(f=>f.startsWith('\\lambda_r v_r')));assert.ok(formulas.filter(f=>f.includes('sum_j')).every(f=>f.includes('\\sum_j')));
});
