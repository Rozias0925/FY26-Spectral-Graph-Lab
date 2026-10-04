const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../js/math.js'),Session=require('../js/session.js');

function modeFixture(n=41){
 return {kind:'grid',index:0,lambda:0,nodes:Array.from({length:n},(_,i)=>({x:i%7,y:Math.floor(i/7),z:0})),edges:Array.from({length:n-1},(_,i)=>({a:i,b:i+1,w:1})),faces:[],values:Array(n).fill(1/Math.sqrt(n))};
}

test('a surface mode survives reload independently of the editable forty-node drawing',()=>{
 const state=Session.create(M),drawing=structuredClone(state.graph),mode=modeFixture();
 state.variationalLab.modeSnapshot=mode;state.variationalLab.smoothSource='ivMode';state.variationalLab.smoothValues.ivMode=mode.values.map((v,i)=>i===0?v+.1:v);
 const saved=JSON.parse(JSON.stringify(Session.snapshot(state))),restored=Session.create(M);
 assert.ok(Session.restore(restored,saved));assert.equal(restored.variationalLab.smoothSource,'ivMode');
 assert.deepEqual(restored.variationalLab.modeSnapshot,mode);assert.deepEqual(restored.variationalLab.smoothValues.ivMode,state.variationalLab.smoothValues.ivMode);
 assert.deepEqual(restored.graph.nodes,drawing.nodes);assert.deepEqual(restored.graph.edges,drawing.edges);
 saved.variationalLab.modeSnapshot.values[0]=99;assert.notEqual(restored.variationalLab.modeSnapshot.values[0],99);
});

test('invalid saved mode cases fall back safely without discarding the user drawing',()=>{
 const invalid=[m=>{m.nodes[0].x=null;},m=>{m.edges[0].b=m.nodes.length;},m=>{m.values[0]=null;},m=>{m.values.pop();},m=>{m.index=-1;},m=>{m.lambda=null;},m=>{m.faces=[[0,1,9999]];},m=>{m.kind='missing';},m=>{m.nodes=Array(1025).fill({x:0,y:0});}];
 for(const corrupt of invalid){const original=Session.create(M),saved=JSON.parse(JSON.stringify(Session.snapshot(original)));saved.variationalLab.modeSnapshot=modeFixture();saved.variationalLab.smoothSource='ivMode';corrupt(saved.variationalLab.modeSnapshot);
  const restored=Session.create(M);assert.ok(Session.restore(restored,saved));assert.equal(restored.variationalLab.smoothSource,'path5');assert.equal(restored.variationalLab.modeSnapshot,undefined);assert.deepEqual(restored.graph.nodes,original.graph.nodes);
 }
});

test('polynomial filter and shared neighbor-mixing parameters survive reload together',()=>{
 const state=Session.create(M);state.spectralSignal.view='filtering';state.spectralSignal.filter='polynomial';state.convolutionLab={alphaFraction:.63,steps:4,selected:1};state.graph.nodes[1].signal=-.42;
 const restored=Session.create(M);assert.ok(Session.restore(restored,JSON.parse(JSON.stringify(Session.snapshot(state)))));
 assert.equal(restored.spectralSignal.filter,'polynomial');assert.equal(restored.spectralSignal.view,'filtering');assert.deepEqual(restored.convolutionLab,state.convolutionLab);assert.equal(restored.graph.nodes[1].signal,-.42);
});
