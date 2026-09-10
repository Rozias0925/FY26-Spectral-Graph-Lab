/* Fourier coefficients in the selected Laplacian basis, including the dual
   basis of the nonsymmetric random-walk Laplacian. No display dependencies. */
(function(root){
'use strict';
function transform(analysis,signal,type='unnormalized'){
 const n=analysis.values.length;
 if(signal.length!==n||signal.some(x=>!Number.isFinite(x)))throw new RangeError('One finite signal value is required per node');
 const metric=analysis.degree.map(d=>type==='randomwalk'&&d>0?d:1);
 const norms=analysis.vectors.map(v=>v.reduce((sum,x,i)=>sum+metric[i]*x*x,0));
 const coefficients=analysis.vectors.map((v,r)=>v.reduce((sum,x,i)=>sum+metric[i]*x*signal[i],0)/(norms[r]||1));
 const modalEnergy=coefficients.map((x,r)=>x*x*norms[r]);
 return {coefficients,norms,metric,modalEnergy,energy:signal.reduce((sum,x,i)=>sum+metric[i]*x*x,0),frequencyEnergy:modalEnergy.reduce((sum,x,r)=>sum+Math.max(0,analysis.values[r])*x,0)};
}
function reconstruct(analysis,coefficients){
 if(coefficients.length!==analysis.vectors.length)throw new RangeError('Coefficient count must match the basis');
 return analysis.values.map((_,i)=>analysis.vectors.reduce((sum,v,r)=>sum+v[i]*coefficients[r],0));
}
function gain(lambda,kind='heat',tau=1,cutoff=1){
 const value=Math.max(0,lambda);
 if(kind==='ideal')return value<=cutoff?1:0;
 const low=Math.exp(-Math.max(0,tau)*value);
 return kind==='highpass'?1-low:low;
}
function process(analysis,signal,type,settings){
 const ft=transform(analysis,signal,type),n=signal.length,m=Math.min(n,Math.max(0,Math.floor(settings.modes??n)));
 const gains=analysis.values.map((lambda,r)=>settings.kind==='truncate'?(r<m?1:0):gain(lambda,settings.kind,settings.tau,settings.cutoff));
 const coefficients=ft.coefficients.map((x,r)=>x*gains[r]),output=reconstruct(analysis,coefficients),full=reconstruct(analysis,ft.coefficients);
 return {...ft,gains,output,filteredCoefficients:coefficients,fullError:Math.max(0,...signal.map((x,i)=>Math.abs(x-full[i]))),error:Math.max(0,...signal.map((x,i)=>Math.abs(x-output[i]))),outputEnergy:coefficients.reduce((sum,x,r)=>sum+x*x*ft.norms[r],0),outputFrequencyEnergy:coefficients.reduce((sum,x,r)=>sum+Math.max(0,analysis.values[r])*x*x*ft.norms[r],0)};
}
const api={transform,reconstruct,gain,process};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SignalMath=api;
})(typeof window!=='undefined'?window:this);
