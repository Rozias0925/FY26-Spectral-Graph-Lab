(function(root){
'use strict';
const TYPES=['unnormalized','symmetric','randomwalk'];
function theoryDefaults(){return {variationalLab:{smoothSource:'path5',smoothValues:{},descentSource:'bridge6',descentSeed:7,descentValues:[],descentHistory:[],descentGraphKey:'',descentIteration:0},convolutionLab:{alphaFraction:.5,steps:1,selected:0}};}
function validGraph(g){
  return Boolean(g && Array.isArray(g.nodes) && g.nodes.length<=40 && g.nodes.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)) && Array.isArray(g.edges) && g.edges.every(e=>e&&Number.isInteger(e.a)&&Number.isInteger(e.b)&&e.a>=0&&e.b>=0&&e.a<g.nodes.length&&e.b<g.nodes.length&&e.a!==e.b&&Number.isFinite(e.w)&&e.w>=0&&e.w<=10));
}
function create(M,initial){
  const g=validGraph(initial)?structuredClone(initial):{nodes:[{x:170,y:190},{x:360,y:110},{x:550,y:190}],edges:[{a:0,b:1,w:1},{a:1,b:2,w:1}],preset:'custom',index:1};
  return {...theoryDefaults(),version:2,lang:'zh',module:'foundations',type:'unnormalized',graph:{...g,tool:'move',pending:null,selected:null,matrix:'L'},newWeight:1,bridgeWeight:1,edgeIndex:0,threshold:0,color:'continuous',signal:[1,1.1,1.2,1.3,1.4],setup:{step:0,i:0,j:1},spectralSignal:{view:'reconstruction',preset:'impulseSignal',selected:0,modes:4,filter:'heat',tau:1,cutoff:1,seed:7},cluster:{source:'shared',dataset:'moons',points:M.dataset(),method:'knn',neighbors:4,epsilon:.4,sigma:M.recommendSigma(M.dataset())||.1,k:2,type:'unnormalized',seed:7,tool:'move'},mesh:{kind:'shared',index:1,type:'unnormalized',rotation:[0,0],zoom:1,wire:true}};
}
function snapshot(state){
  const {nodes,edges,preset,index,tool,matrix,mode:drawingMode,sigma:drawingSigma}=state.graph;
  const {source,dataset,points,method,neighbors,epsilon,sigma,k,seed}=state.cluster;
  const {kind,index:mode,rotation,zoom,wire}=state.mesh;
  return {version:2,lang:state.lang,type:state.type,graph:{nodes,edges,preset,index,tool,matrix,mode:drawingMode,sigma:drawingSigma},newWeight:state.newWeight,edgeIndex:state.edgeIndex,threshold:state.threshold,color:state.color,signal:state.signal,setup:state.setup,spectralSignal:state.spectralSignal,variationalLab:state.variationalLab,convolutionLab:state.convolutionLab,cluster:{source,dataset,points,method,neighbors,epsilon,sigma,k,seed},mesh:{kind,index:mode,rotation,zoom,wire}};
}
function restore(state,saved){
  if(!saved||saved.version!==2||!validGraph(saved.graph))return false;
  Object.assign(state.graph,structuredClone(saved.graph),{pending:null,selected:null});
  state.graph.index=Math.min(Math.max(0,Number(state.graph.index)||0),Math.max(0,state.graph.nodes.length-1));
  if(TYPES.includes(saved.type))state.type=saved.type;
  if(['zh','en'].includes(saved.lang))state.lang=saved.lang;
  for(const key of ['newWeight','threshold','edgeIndex'])if(Number.isFinite(saved[key]))state[key]=saved[key];
  if(['continuous','partition'].includes(saved.color))state.color=saved.color;
  if(Array.isArray(saved.signal)&&saved.signal.length===5&&saved.signal.every(v=>Number.isFinite(v)&&v>=-2&&v<=2))state.signal=saved.signal.slice();
  if(saved.setup&&[0,1,2,3,4].includes(saved.setup.step))Object.assign(state.setup,saved.setup);
  state.graph.mode=saved.graph.mode==='coordinate'?'coordinate':'manual';
  state.graph.sigma=Number.isFinite(saved.graph.sigma)&&saved.graph.sigma>0?saved.graph.sigma:1;
  const signal=saved.spectralSignal;
  if(signal){
    if(['reconstruction','filtering'].includes(signal.view))state.spectralSignal.view=signal.view;
    for(const [key,min,max] of [['selected',0,39],['modes',0,40],['tau',0,10],['cutoff',0,1000],['seed',0,9999]])if(Number.isFinite(signal[key])&&signal[key]>=min&&signal[key]<=max)state.spectralSignal[key]=['selected','modes','seed'].includes(key)?Math.floor(signal[key]):signal[key];
    if(['heat','highpass','ideal'].includes(signal.filter))state.spectralSignal.filter=signal.filter;
    if(['impulseSignal','constantSignal','alternatingSignal','noiseSignal','customSignal'].includes(signal.preset))state.spectralSignal.preset=signal.preset;
  }
  const defaults=theoryDefaults();
  state.variationalLab=defaults.variationalLab;state.convolutionLab=defaults.convolutionLab;
  const theory=saved.variationalLab;
  if(theory){
    for(const key of ['smoothSource','descentSource'])if(['path5','bridge6','shared'].includes(theory[key]))state.variationalLab[key]=theory[key];
    for(const key of ['descentSeed','descentIteration'])if(Number.isInteger(theory[key])&&theory[key]>=0&&theory[key]<=100000)state.variationalLab[key]=theory[key];
    if(typeof theory.descentGraphKey==='string')state.variationalLab.descentGraphKey=theory.descentGraphKey.slice(0,40000);
    if(Array.isArray(theory.descentValues)&&theory.descentValues.length<=40&&theory.descentValues.every(Number.isFinite))state.variationalLab.descentValues=theory.descentValues.slice();
    if(Array.isArray(theory.descentHistory)&&theory.descentHistory.length<=10001&&theory.descentHistory.every(Number.isFinite))state.variationalLab.descentHistory=theory.descentHistory.slice();
    if(theory.smoothValues&&typeof theory.smoothValues==='object')for(const key of ['path5','bridge6','shared']){const v=theory.smoothValues[key];if(Array.isArray(v)&&v.length<=40&&v.every(x=>Number.isFinite(x)&&Math.abs(x)<=2))state.variationalLab.smoothValues[key]=v.slice();}
  }
  const convolution=saved.convolutionLab;
  if(convolution){
    if(Number.isFinite(convolution.alphaFraction)&&convolution.alphaFraction>=0&&convolution.alphaFraction<=1)state.convolutionLab.alphaFraction=convolution.alphaFraction;
    for(const [key,max]of [['steps',3],['selected',39]])if(Number.isInteger(convolution[key])&&convolution[key]>=0&&convolution[key]<=max)state.convolutionLab[key]=convolution[key];
  }
  const c=saved.cluster;
  if(c&&Array.isArray(c.points)&&c.points.length>=8&&c.points.length<=120&&c.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)))Object.assign(state.cluster,c);
  if(saved.mesh&&Array.isArray(saved.mesh.rotation)&&saved.mesh.rotation.length===2&&saved.mesh.rotation.every(Number.isFinite))Object.assign(state.mesh,saved.mesh);
  state.cluster.type=state.mesh.type=state.type;
  return true;
}
function setType(state,type){if(!TYPES.includes(type))return;state.type=state.cluster.type=state.mesh.type=type;}
function graphForModule(state){return state.graph;}
function graphSnapshot(state){const {nodes,edges,preset,index,mode,sigma}=state.graph;return structuredClone({nodes,edges,preset,index,mode:mode||'manual',sigma:sigma||1});}
function checkpoint(state){const item=graphSnapshot(state);state.undoHistory||=[];if(JSON.stringify(state.undoHistory.at(-1))!==JSON.stringify(item))state.undoHistory.push(item);if(state.undoHistory.length>40)state.undoHistory.shift();}
function undo(state){const item=state.undoHistory?.pop();if(!item)return false;Object.assign(state.graph,item,{selected:null,pending:null,result:null});state.edgeIndex=Math.min(state.edgeIndex,Math.max(0,item.edges.length-1));return true;}
function graphCoordinates(state){return state.graph.nodes.map(p=>[(p.x-360)/100,(180-p.y)/100]);}
function refreshWeights(M,state){const g=state.graph;if(g.mode!=='coordinate')return;const points=graphCoordinates(state);for(const e of g.edges){e.manualWeight??=e.w;e.w=M.gaussianWeight(points[e.a],points[e.b],g.sigma||1);}}
function setGraphMode(M,state,mode){if(!['manual','coordinate'].includes(mode))return;const g=state.graph;if((g.mode||'manual')===mode)return;checkpoint(state);g.mode=mode;if(mode==='coordinate'){g.sigma=M.recommendSigma(graphCoordinates(state),g.edges)||1;refreshWeights(M,state);}else for(const e of g.edges){e.w=e.manualWeight??1;delete e.manualWeight;}}
function clusterShared(M,state){
  const r=M.analyze(state.graph.nodes,state.graph.edges,state.type),k=Math.min(state.cluster.k,state.graph.nodes.length);
  if(k<1)return {analysis:r,embedding:[],original:{labels:[]},spectral:{labels:[]},k:0};
  let embedding=state.graph.nodes.map((_,i)=>r.vectors.slice(0,k).map(v=>v[i]));
  if(state.type==='symmetric')embedding=embedding.map(row=>{const norm=Math.hypot(...row)||1;return row.map(v=>v/norm);});
  const points=state.graph.nodes.map(p=>[p.x,-p.y]);
  return {analysis:r,embedding,original:M.kmeans(points,k,state.cluster.seed),spectral:M.kmeans(embedding,k,state.cluster.seed),k};
}
const api={create,snapshot,restore,validGraph,setType,graphForModule,clusterShared,checkpoint,undo,graphCoordinates,refreshWeights,setGraphMode};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LabSession=api;
})(typeof window!=='undefined'?window:this);
