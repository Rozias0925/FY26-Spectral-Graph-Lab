const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../js/math.js'),Session=require('../js/session.js');
function course(){const context={window:{}};for(const file of ['content','learning','course','module-guides'])vm.runInNewContext(fs.readFileSync(require.resolve(`../js/${file}.js`),'utf8'),context);return context.window;}
test('course routes follow smoothness, variation, Fourier, and convolution; old filtering links still resolve',()=>{
 const {SpectralCourse:c,LabCopy}=course();assert.deepEqual(Array.from(c.modules.slice(5)),['smoothness','variational','fourier','convolution']);assert.equal(c.resolveRoute('filtering'),'fourier');assert.equal(c.resolveRoute('missing'),null);assert.equal(typeof c.guide,'function');assert.equal(typeof c.summary,'function');
 for(const lang of ['zh','en'])for(const module of c.modules){assert.ok(LabCopy[lang][module]);assert.ok(LabCopy[lang][module==='foundations'?'foundationIntro':module+'Intro']);}
});
test('entering Prologue always starts at lesson step 1 without resetting other chapter progress',()=>{
 const {SpectralCourse:c}=course(),state={module:'mesh',setup:{step:3}};c.enter(state,'foundations');assert.equal(state.module,'foundations');assert.equal(state.setup.step,0);state.setup.step=4;c.enter(state,'playground');assert.equal(state.module,'playground');assert.equal(state.setup.step,4);
});
test('every module follows one four-part story and keeps deeper primers collapsed',()=>{
 const {SpectralCourse:c}=course(),tex=(value,display)=>`<math data-display="${display}">${value}</math>`;
 for(const lang of ['zh','en'])for(const module of c.modules){const html=c.guide(module,lang,tex);assert.match(html,/module-guide/);assert.match(html,/module-story/);assert.equal((html.match(/module-story-step/g)||[]).length,4);assert.match(html,/module-glossary/);assert.match(html,/<dt>/);assert.doesNotMatch(html,/Assumed background|預設先備知識/);if(module==='clustering'||c.modules.indexOf(module)>=5){assert.match(html,/module-primer/);assert.doesNotMatch(html,/<details class="module-primer" open/);}else assert.doesNotMatch(html,/module-primer/);}
 for(const label of ['研究脈絡','研究問題','實驗方法','下一個問題'])assert.match(c.guide('foundations','zh',tex),new RegExp(`>${label}<`));
 assert.doesNotMatch(c.guide('foundations','zh',tex),/MAIN STORY|一個問題，帶出下一個問題|>0[1-4] \/ /);
 assert.match(c.guide('clustering','zh',tex),/為什麼分群會變成特徵值問題/);assert.match(c.guide('smoothness','zh',tex),/Dirichlet 能量/);assert.match(c.guide('variational','zh',tex),/有約束最佳化/);assert.match(c.guide('convolution','zh',tex),/過度平滑/);
});
test('Chapter VIII ends with a visible recap of Prologue through Chapter VIII',()=>{
 const {SpectralCourse:c}=course(),html=c.summary('convolution','zh',value=>`<math>${value}</math>`);assert.match(html,/實驗室總結/);for(const label of ['Prologue','Chapter I','Chapter II','Chapter III','Chapter IV','Chapter V','Chapter VI','Chapter VII','Chapter VIII'])assert.match(html,new RegExp(`>${label}<`));assert.match(html,/local message passing/);assert.match(html,/過度平滑/);assert.equal(c.summary('fourier','zh',String),'');
});
test('chapter navigation appears only in the shared sidebar',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),css=fs.readFileSync(require.resolve('../course.css'),'utf8');
 assert.doesNotMatch(html,/course-guide|course-path/);assert.doesNotMatch(css,/\.course-path/);
 for(const route of ['foundations','playground','fiedler','clustering','mesh','smoothness','variational','fourier','convolution'])assert.equal((html.match(new RegExp(`data-module="${route}"`,'g'))||[]).length,1);
 for(const marker of ['Prologue','I','II','III','IV','V','VI','VII','VIII'])assert.match(html,new RegExp(`<span class="nav-number">${marker}<`));
 assert.doesNotMatch(html,/sidebar-note/);assert.match(html,/© 2026 文君豪\. All Rights Reserved\./);
});
test('chapter metadata is the single formatter for markers, headings, and prose references',()=>{
 const {SpectralCourse:c}=course(),expected=[['foundations','Prologue','Prologue'],['playground','I','Chapter I'],['fiedler','II','Chapter II'],['clustering','III','Chapter III'],['mesh','IV','Chapter IV'],['smoothness','V','Chapter V'],['variational','VI','Chapter VI'],['fourier','VII','Chapter VII'],['convolution','VIII','Chapter VIII']];
 for(const [key,marker,label] of expected){assert.equal(c.chapter(key).marker,marker);assert.equal(c.chapter(key).label,label);assert.equal(c.formatChapters(`Read {{chapter:${key}}}`),`Read ${label}`);}
});
test('Fiedler spectrum browsing clamps independently and is excluded from saved graph data',()=>{
 const {SpectralCourse:c}=course(),s=Session.create(M);s.fiedlerSpectrumIndex=7;assert.equal(c.clampSpectrumIndex(s.fiedlerSpectrumIndex,12),7);assert.equal(c.clampSpectrumIndex(7,3),2);assert.equal(c.clampSpectrumIndex(-4,3),0);assert.equal(c.clampSpectrumIndex(2,0),0);assert.equal(Object.hasOwn(Session.snapshot(s),'fiedlerSpectrumIndex'),false);
});
test('Chapter II smoothness panel states the fixed path, full identity, and unnormalized energy label',()=>{
 const {LabCopy}=course(),source=fs.readFileSync(require.resolve('../js/app.js'),'utf8');assert.match(LabCopy.zh.miniSmoothGraph,/1—2—3—4—5/);assert.match(LabCopy.zh.miniSmoothDefinition,/相連節點/);assert.match(source,/f\^\{\\mathsf T\}L_0f/);assert.match(source,/\\frac12\\sum_\{i,j\}/);assert.match(source,/E\(f\)=f\^\{\\mathsf T\}L_0f/);assert.doesNotMatch(source,/signal-energy'\)\.textContent=`fᵀLf/);
});
test('legacy saved drawings and node signals migrate without changes while teaching experiments start separately',()=>{
 const original=Session.create(M);original.graph.nodes[0].signal=-.75;original.graph.edges[0].w=.2;original.cluster.points[0]=[4,5];
 const saved=JSON.parse(JSON.stringify(Session.snapshot(original)));delete saved.variationalLab;delete saved.convolutionLab;delete saved.spectralSignal.view;
 const next=Session.create(M);assert.ok(Session.restore(next,saved));assert.deepEqual(next.graph.nodes,original.graph.nodes);assert.deepEqual(next.graph.edges,original.graph.edges);assert.deepEqual(next.cluster.points,original.cluster.points);
 assert.equal(next.variationalLab.smoothSource,'path5');assert.equal(next.variationalLab.descentSource,'bridge6');assert.equal(next.spectralSignal.view,'reconstruction');assert.equal(next.convolutionLab.steps,1);
});
test('teaching sliders, valid descent state, 07 tab, and 08 controls persist independently from the shared graph',()=>{
 const s=Session.create(M),graph=structuredClone(s.graph);Object.assign(s.variationalLab,{smoothValues:{path5:[1,1.1,1.2,1.3,1.4]},descentValues:[-.5,.5,-.5,.5],descentHistory:[1,.8,.5],descentIteration:2,descentGraphKey:'teaching-graph'});s.spectralSignal.view='filtering';s.convolutionLab={alphaFraction:.7,steps:12,selected:1};
 const restored=Session.create(M);assert.ok(Session.restore(restored,JSON.parse(JSON.stringify(Session.snapshot(s)))));assert.deepEqual(restored.variationalLab,s.variationalLab);assert.deepEqual(restored.convolutionLab,s.convolutionLab);assert.equal(restored.spectralSignal.view,'filtering');assert.deepEqual(restored.graph.nodes,graph.nodes);
});
test('malformed tutorial settings are ignored without losing a valid user drawing',()=>{
 const saved=JSON.parse(JSON.stringify(Session.snapshot(Session.create(M))));saved.variationalLab={smoothSource:'bad',descentValues:[null],descentHistory:['x'],smoothValues:{path5:[999]}};saved.convolutionLab={alphaFraction:-5,steps:100,selected:999};
 const next=Session.create(M);assert.ok(Session.restore(next,saved));assert.deepEqual(next.convolutionLab,{alphaFraction:.5,steps:1,selected:0});assert.deepEqual(next.variationalLab.descentValues,[]);assert.deepEqual(next.variationalLab.smoothValues,{});
});
