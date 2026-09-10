/* A finite-dimensional bridge from spectral filters to local aggregation.
   This module deliberately uses the symmetric, unnormalized Laplacian. */
(function(root){
'use strict';
const finiteOr=(x,fallback)=>Number.isFinite(x)?x:fallback;
function settingsFor(analysis,settings={}){
 const maxDegree=Math.max(0,...analysis.degree);
 const fraction=Math.min(1,Math.max(0,finiteOr(settings.alphaFraction,.5)));
 const steps=Math.min(12,Math.max(0,Math.floor(finiteOr(settings.steps,1))));
 return {maxDegree,alphaFraction:fraction,alpha:maxDegree>0?fraction/maxDegree:0,steps};
}
function coefficients(alpha,steps){
 const result=[1];
 for(let k=0;k<steps;k++){
  const next=Array(result.length+1).fill(0);
  result.forEach((c,j)=>{next[j]+=c;next[j+1]-=alpha*c;});
  result.splice(0,result.length,...next);
 }
 return result;
}
function step(analysis,signal,alpha){
 return analysis.raw.map((row,i)=>signal[i]-alpha*row.reduce((sum,l,j)=>sum+l*signal[j],0));
}
function hopDistances(A,selected){
 const distance=Array(A.length).fill(Infinity);
 if(!Number.isInteger(selected)||selected<0||selected>=A.length)return distance;
 distance[selected]=0;const queue=[selected];
 for(let next=0;next<queue.length;next++){
  const i=queue[next];
  A[i].forEach((w,j)=>{if(w>0&&distance[j]===Infinity){distance[j]=distance[i]+1;queue.push(j);}});
 }
 return distance;
}
function process(analysis,signal,settings={}){
 const n=analysis.degree.length;
 if(signal.length!==n||signal.some(x=>!Number.isFinite(x)))throw new RangeError('One finite signal value is required per node');
 if(analysis.L.some((row,i)=>row.some((x,j)=>Math.abs(x-analysis.raw[i][j])>1e-10)))throw new RangeError('Convolution requires an unnormalized Laplacian eigensystem');
 const options=settingsFor(analysis,settings),{alpha,steps}=options,iterates=[signal.slice()];
 for(let k=0;k<steps;k++)iterates.push(step(analysis,iterates[k],alpha));
 const gains=analysis.values.map(lambda=>(1-alpha*lambda)**steps);
 const fourier=analysis.vectors.map(v=>v.reduce((sum,x,i)=>sum+x*signal[i],0));
 const spectral=signal.map((_,i)=>analysis.vectors.reduce((sum,v,r)=>sum+v[i]*gains[r]*fourier[r],0));
 const output=iterates[steps],difference=Math.max(0,...output.map((x,i)=>Math.abs(x-spectral[i])));
 return {...options,iterates,output,spectral,gains,fourier,difference,coefficients:coefficients(alpha,steps)};
}
function contributions(analysis,result,selected){
 if(!Number.isInteger(selected)||selected<0||selected>=analysis.degree.length)return [];
 const before=result.iterates[Math.max(0,result.steps-1)];
 const terms=[{node:selected,self:true,weight:result.steps?1-result.alpha*analysis.degree[selected]:1,value:before[selected]}];
 if(result.steps)analysis.A[selected].forEach((w,j)=>{if(w>0)terms.push({node:j,self:false,weight:result.alpha*w,value:before[j]});});
 return terms.map(term=>({...term,contribution:term.weight*term.value}));
}
const api={settingsFor,coefficients,step,hopDistances,process,contributions};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ConvolutionMath=api;
})(typeof window!=='undefined'?window:this);
