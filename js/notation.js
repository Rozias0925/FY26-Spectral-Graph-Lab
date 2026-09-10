/* Local KaTeX assets keep all equations available offline. */
(function(){
'use strict';
const formulas={
 'Lsym = D⁻¹ᐟ²L₀D⁻¹ᐟ²':String.raw`L_{\mathrm{sym}}=D^{-1/2}L_0D^{-1/2}`,
 'Lrw = D⁻¹L₀':String.raw`L_{\mathrm{rw}}=D^{-1}L_0`,
 'L₀ = D − A':'L_0=D-A','L = D − A':'L=D-A',
 'Lvᵣ = λᵣvᵣ':String.raw`L v_r=\lambda_r v_r`,'Lv = λv':String.raw`L v=\lambda v`,
 'Lvₖ = λₖvₖ':String.raw`L v_k=\lambda_k v_k`,
 'vₖᵀLvₖ = λₖ':String.raw`v_k^{\mathsf T}L v_k=\lambda_k`,
 '−Δφ = λφ':String.raw`-\Delta\varphi=\lambda\varphi`,
 '0 = λ₁ ≤ λ₂ ≤ ⋯ ≤ λₙ':String.raw`0=\lambda_1\leq\lambda_2\leq\cdots\leq\lambda_n`,
 'wᵢⱼ = exp(−‖xᵢ − xⱼ‖² / 2σ²)':String.raw`w_{ij}=\exp\!\left(-\frac{\lVert x_i-x_j\rVert^2}{2\sigma^2}\right)`,
 'U = [v₁, …, vₖ]':String.raw`U=[v_1,\ldots,v_k]`,
 'xᵢ → zᵢ → cluster':String.raw`x_i\longrightarrow z_i\longrightarrow\mathrm{cluster}`,
 'dᵢ = Σⱼ Aᵢⱼ':String.raw`d_i=\sum_j A_{ij}`,
 'Aᵢⱼ = Aⱼᵢ':'A_{ij}=A_{ji}','Aᵢⱼ = 0':'A_{ij}=0',
 'wᵢⱼ ≥ 0':String.raw`w_{ij}\geq 0`,
 'v₂(i) < t':'v_2(i)<t','v₂(i) ≥ t':String.raw`v_2(i)\geq t`,
 '‖vᵣ‖₂ = 1':String.raw`\lVert v_r\rVert_2=1`,
 'n = |V|':'n=|V|','n × n':String.raw`n\times n`,'0 × 0':String.raw`0\times0`,
 'exp(−距離² / 2σ²)':String.raw`\exp\!\left(-\frac{d^2}{2\sigma^2}\right)`,
 'exp(−distance² / 2σ²)':String.raw`\exp\!\left(-\frac{d^2}{2\sigma^2}\right)`,
 'fᵀL₀f':String.raw`f^{\mathsf T}L_0f`,'fᵀLf':String.raw`f^{\mathsf T}Lf`,
 'vᵣ(i)':'v_r(i)','v₂(i)':'v_2(i)','λᵣ':String.raw`\lambda_r`,'vᵣ':'v_r',
 'wᵢⱼ':'w_{ij}','Aᵢⱼ':'A_{ij}','dᵢ':'d_i','L₀':'L_0','Lsym':String.raw`L_{\mathrm{sym}}`,'Lrw':String.raw`L_{\mathrm{rw}}`,
 'λ₂':String.raw`\lambda_2`,'v₂':'v_2','Lv':'L v',
 'σ':String.raw`\sigma`,'ε':String.raw`\varepsilon`,'λ':String.raw`\lambda`
};
for(let i=1;i<=512;i++){const sub=String(i).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[+d]);formulas['λ'+sub]=String.raw`\lambda_{${i}}`;formulas['v'+sub]=`v_{${i}}`;}
const pattern=new RegExp(Object.keys(formulas).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const options={throwOnError:false,trust:false,strict:'error',output:'htmlAndMathml'};
function tex(source,displayMode=false){return window.katex.renderToString(source,{...options,displayMode});}
function typeset(root){
 if(!window.renderMathInElement)return;
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];
 while(walk.nextNode()){const n=walk.currentNode;if(n.parentElement&&!n.parentElement.closest('svg,canvas,select,option,script,style,textarea,pre,code,.katex,.katex-error'))nodes.push(n);}
 for(const n of nodes){if(n.data.includes('\\(')||n.data.includes('\\['))continue;const next=n.data.replace(pattern,match=>'\\('+formulas[match]+'\\)');if(next!==n.data)n.data=next;}
 window.renderMathInElement(root,{...options,ignoredTags:['script','noscript','style','textarea','pre','code','option','select','svg','canvas'],ignoredClasses:['katex','katex-error']});
}
window.LabNotation={tex,typeset,formulas};
})();
