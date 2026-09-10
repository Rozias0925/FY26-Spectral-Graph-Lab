/* Finite-dimensional Dirichlet energy and constrained descent for L0 = D - A. */
(function(root){
'use strict';
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const multiply=(A,f)=>A.map(row=>dot(row,f));
function teachingGraph(kind='path5'){
 const n=kind==='bridge6'?6:5;
 return {nodes:Array.from({length:n},(_,i)=>({x:70+i*580/(n-1),y:140})),edges:Array.from({length:n-1},(_,i)=>({a:i,b:i+1,w:kind==='bridge6'&&i===2?.08:1}))};
}
function energyDetails(analysis,f){
 const edges=[];
 for(let i=0;i<analysis.A.length;i++)for(let j=i+1;j<analysis.A.length;j++)if(analysis.A[i][j]>0)edges.push({a:i,b:j,w:analysis.A[i][j],difference:f[i]-f[j],energy:analysis.A[i][j]*(f[i]-f[j])**2});
 return {edges,total:edges.reduce((s,e)=>s+e.energy,0),quadratic:dot(f,multiply(analysis.raw,f))};
}
function projectNormalize(values){
 if(values.length<2)return null;
 const mean=values.reduce((s,x)=>s+x,0)/values.length,projected=values.map(x=>x-mean),norm=Math.hypot(...projected);
 if(!Number.isFinite(norm)||norm<1e-14)return null;
 return projected.map(x=>x/norm);
}
function initialize(n,seed=7){
 if(n<2)return null;
 let a=seed>>>0;
 const random=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
 return projectNormalize(Array.from({length:n},()=>random()*2-1))||projectNormalize(Array.from({length:n},(_,i)=>i===0?1:0));
}
function targetSpace(analysis){
 if(analysis.values.length<2)return {value:null,basis:[],dimension:0};
 const value=analysis.values[1],tolerance=Math.max(1e-10,analysis.tolerance||0),basis=[];
 analysis.values.forEach((lambda,r)=>{
  if(Math.abs(lambda-value)>tolerance)return;
  const v=analysis.vectors[r],mean=v.reduce((s,x)=>s+x,0)/v.length;
  let p=v.map(x=>x-mean);
  // Orthogonalize twice so the constant direction is removed even in a repeated zero space.
  for(let pass=0;pass<2;pass++)for(const b of basis){const c=dot(p,b);p=p.map((x,i)=>x-c*b[i]);}
  const norm=Math.hypot(...p);if(norm>1e-7)basis.push(p.map(x=>x/norm));
 });
 return {value,basis,dimension:basis.length};
}
function diagnostics(analysis,f,target=targetSpace(analysis)){
 if(!f||f.length<2)return {feasible:false,energy:0,mean:0,norm:0,residual:0,distance:null,target:target.value};
 const Lf=multiply(analysis.raw,f),norm=Math.hypot(...f),energy=energyDetails(analysis,f).total,rayleigh=norm?energy/(norm*norm):0;
 const projectionSquared=target.basis.reduce((s,b)=>s+dot(f,b)**2,0);
 return {feasible:true,energy,mean:f.reduce((s,x)=>s+x,0)/f.length,norm,residual:Math.hypot(...Lf.map((x,i)=>x-rayleigh*f[i])),distance:Math.sqrt(Math.max(0,norm*norm-projectionSquared)),target:target.value};
}
function step(analysis,values){
 const f=projectNormalize(values||[]);if(!f)return null;
 const lambdaMax=Math.max(0,...analysis.values);
 if(lambdaMax<1e-14)return f;
 const gradient=multiply(analysis.raw,f).map(x=>2*x),eta=.45/lambdaMax;
 return projectNormalize(f.map((x,i)=>x-eta*gradient[i]))||f;
}
const api={teachingGraph,energyDetails,projectNormalize,initialize,targetSpace,diagnostics,step,dot,multiply};
if(typeof module==='object'&&module.exports)module.exports=api;else root.VariationalMath=api;
})(typeof window!=='undefined'?window:globalThis);
