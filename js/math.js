/* Small, dependency-free numerical core. Undirected graphs, nonnegative weights. */
(function (root) {
  'use strict';
  const zeros = n => Array.from({length:n}, () => Array(n).fill(0));
  function eigenSymmetric(matrix) {
    const n=matrix.length;
    if(!n)return {values:[],vectors:[]};
    const a=Float64Array.from(matrix.flat()), v=new Float64Array(n*n);
    for(let i=0;i<n;i++)v[i*n+i]=1;
    const scale=Math.max(1,...matrix.map((r,i)=>Math.abs(r[i]))), tolerance=scale*1e-12;
    for(let sweep=0;sweep<70;sweep++){
      let maximum=0;
      for(let p=0;p<n-1;p++)for(let q=p+1;q<n;q++){
        const apq=a[p*n+q];maximum=Math.max(maximum,Math.abs(apq));
        if(Math.abs(apq)<tolerance)continue;
        const tau=(a[q*n+q]-a[p*n+p])/(2*apq);
        const t=(tau>=0?1:-1)/(Math.abs(tau)+Math.sqrt(1+tau*tau));
        const c=1/Math.sqrt(1+t*t),s=t*c;
        a[p*n+p]-=t*apq;a[q*n+q]+=t*apq;a[p*n+q]=a[q*n+p]=0;
        for(let k=0;k<n;k++){
          if(k!==p&&k!==q){const akp=a[k*n+p],akq=a[k*n+q];a[k*n+p]=a[p*n+k]=c*akp-s*akq;a[k*n+q]=a[q*n+k]=s*akp+c*akq;}
          const vp=v[k*n+p],vq=v[k*n+q];v[k*n+p]=c*vp-s*vq;v[k*n+q]=s*vp+c*vq;
        }
      }
      if(maximum<tolerance)break;
    }
    const order=Array.from({length:n},(_,i)=>i).sort((i,j)=>a[i*n+i]-a[j*n+j]);
    return {values:order.map(i=>Math.abs(a[i*n+i])<tolerance*10?0:a[i*n+i]),vectors:order.map(i=>orient(Array.from({length:n},(_,k)=>v[k*n+i])))};
  }
  function orient(v){const norm=Math.hypot(...v)||1;let pivot=0;for(let i=1;i<v.length;i++)if(Math.abs(v[i])>Math.abs(v[pivot]))pivot=i;const sign=v[pivot]<0?-1:1;return v.map(x=>sign*x/norm);}
  function components(A){const seen=new Set(),groups=[];for(let i=0;i<A.length;i++){if(seen.has(i))continue;const group=[],stack=[i];seen.add(i);while(stack.length){const u=stack.pop();group.push(u);for(let j=0;j<A.length;j++)if(A[u][j]>0&&!seen.has(j)){seen.add(j);stack.push(j);}}groups.push(group);}return groups;}
  function analyze(nodes,edges,type='unnormalized',precomputed=null){
    const A=zeros(nodes.length);
    for(const e of edges){if(e.a!==e.b&&e.a>=0&&e.b>=0&&e.a<nodes.length&&e.b<nodes.length&&Number.isFinite(e.w)&&e.w>0)A[e.a][e.b]=A[e.b][e.a]=e.w;}
    return analyzeAdjacency(A,type,precomputed);
  }
  function analyzeAdjacency(A,type='unnormalized',precomputed=null){
    const n=A.length,degree=A.map(r=>r.reduce((s,x)=>s+x,0)),D=zeros(n),L=zeros(n),sym=zeros(n),raw=zeros(n);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      D[i][j]=i===j?degree[i]:0;raw[i][j]=D[i][j]-A[i][j];
      sym[i][j]=degree[i]>0&&degree[j]>0?raw[i][j]/Math.sqrt(degree[i]*degree[j]):0;
      L[i][j]=type==='unnormalized'?raw[i][j]:type==='symmetric'?sym[i][j]:degree[i]>0?raw[i][j]/degree[i]:0;
    }
    const eig=precomputed||eigenSymmetric(type==='unnormalized'?raw:sym);
    const vectors=type==='randomwalk'?eig.vectors.map(v=>orient(v.map((x,i)=>degree[i]>0?x/Math.sqrt(degree[i]):x))):eig.vectors;
    const tol=1e-8*Math.max(1,...eig.values.map(Math.abs));
    return {A,D,L,raw,sym,degree,values:eig.values,vectors,symVectors:eig.vectors,components:components(A),zeros:eig.values.filter(x=>Math.abs(x)<tol).length,tolerance:tol};
  }
  function energy(A,f){let e=0;for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++)e+=A[i][j]*(f[i]-f[j])**2;return e;}
  function preset(kind='bridge',weight=.3){
    let nodes=[],edges=[];const add=(a,b,w=1,bridge=false)=>edges.push({a,b,w,bridge});
    if(kind==='bridge'||kind==='barbell'||kind==='disconnected'){
      for(let g=0;g<2;g++)for(let i=0;i<6;i++){const angle=(i/6)*Math.PI*2;nodes.push({x:205+g*310+88*Math.cos(angle),y:180+93*Math.sin(angle)});}
      for(let g=0;g<2;g++)for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)add(g*6+i,g*6+j);
      if(kind==='barbell'){nodes.push({x:336,y:180},{x:384,y:180});add(0,12);add(12,13,weight,true);add(13,9);}
      else if(kind!=='disconnected')add(0,9,weight,true);
    }else if(kind==='grid'){
      for(let y=0;y<4;y++)for(let x=0;x<5;x++){nodes.push({x:170+x*95,y:65+y*75});const i=y*5+x;if(x)add(i-1,i);if(y)add(i-5,i);}
    }else if(kind==='path'){
      for(let i=0;i<10;i++){nodes.push({x:60+i*67,y:180+45*Math.sin(i*.65)});if(i)add(i-1,i);}
    }else{
      const n=kind==='complete'?8:10;
      if(kind==='star'){nodes.push({x:360,y:180});for(let i=1;i<n;i++){const a=(i-1)*2*Math.PI/(n-1);nodes.push({x:360+145*Math.cos(a),y:180+125*Math.sin(a)});add(0,i);}}
      else{for(let i=0;i<n;i++){const a=i*2*Math.PI/n-Math.PI/2;nodes.push({x:360+158*Math.cos(a),y:180+125*Math.sin(a)});}for(let i=0;i<n;i++)if(kind==='complete'){for(let j=i+1;j<n;j++)add(i,j);}else add(i,(i+1)%n);}
    }
    return {nodes,edges};
  }
  function rng(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function dataset(kind='moons',n=80,seed=7){const random=rng(seed),points=[],normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),1e-12)))*Math.cos(2*Math.PI*random());for(let i=0;i<n;i++){const g=i%2,t=Math.floor(i/2)/(Math.ceil(n/2)-1),noise=()=> (random()-.5)*.12;let x,y;if(kind==='moons'){x=g?1-Math.cos(t*Math.PI):Math.cos(t*Math.PI);y=g?.45-Math.sin(t*Math.PI):Math.sin(t*Math.PI);}else if(kind==='circles'){const r=g?.48:1,a=t*2*Math.PI;x=r*Math.cos(a);y=r*Math.sin(a);}else{const g3=i%3,c=[[-.75,-.5],[.75,-.25],[0,.85]][g3];x=c[0]+normal()*.2;y=c[1]+normal()*.2;}points.push([x+noise(),y+noise()]);}return points;}
  const dist2=(a,b)=>a.reduce((s,x,i)=>s+(x-b[i])**2,0);
  const median=values=>{const a=values.slice().sort((a,b)=>a-b),n=a.length;return n?(a[Math.floor((n-1)/2)]+a[Math.floor(n/2)])/2:null;};
  // A geometric starting scale, independent of dataset names or cluster labels.
  function recommendSigma(points,edges=null){
    const distances=edges?.length?edges.map(e=>Math.sqrt(dist2(points[e.a],points[e.b]))):points.map((p,i)=>Math.min(...points.filter((_,j)=>j!==i).map(q=>Math.sqrt(dist2(p,q))).filter(d=>d>0)));
    return median(distances.filter(d=>Number.isFinite(d)&&d>0));
  }
  function recommendGraph(points){return {method:'knn',neighbors:Math.min(4,Math.max(1,points.length-1)),sigma:recommendSigma(points)||1};}
  function gaussianWeight(a,b,sigma){if(!Number.isFinite(sigma)||sigma<=0)throw new RangeError('sigma must be positive');return Math.exp(-dist2(a,b)/(2*sigma*sigma));}
  function samePartition(a,b){if(!a||a.length!==b.length)return false;const forward=new Map(),reverse=new Map();for(let i=0;i<a.length;i++){if(forward.has(a[i])&&forward.get(a[i])!==b[i]||reverse.has(b[i])&&reverse.get(b[i])!==a[i])return false;forward.set(a[i],b[i]);reverse.set(b[i],a[i]);}return true;}
  function similarity(points,method='knn',neighbors=7,epsilon=.35,sigma=.3){const n=points.length,A=zeros(n),dist=points.map(p=>points.map(q=>dist2(p,q)));for(let i=0;i<n;i++){
    const near=new Set(Array.from({length:n},(_,j)=>j).filter(j=>j!==i).sort((a,b)=>dist[i][a]-dist[i][b]).slice(0,neighbors));
    for(let j=0;j<n;j++)if(i!==j&&((method==='knn'&&near.has(j))||(method==='epsilon'&&dist[i][j]<epsilon**2)||method==='gaussian')){const w=Math.exp(-dist[i][j]/(2*sigma*sigma));A[i][j]=A[j][i]=w;}
  }return A;}
  function kmeans(points,k,seed=7,restarts=7){
    if(!points.length)return {labels:[],centers:[],inertia:0};k=Math.min(k,points.length);let best=null;
    for(let run=0;run<restarts;run++){
      const random=rng(seed+run*301),centers=[points[Math.floor(random()*points.length)].slice()];
      while(centers.length<k){const ds=points.map(p=>Math.min(...centers.map(c=>dist2(p,c))));let pick=random()*ds.reduce((a,b)=>a+b,0),idx=ds.length-1;for(let i=0;i<ds.length;i++){pick-=ds[i];if(pick<=0){idx=i;break;}}centers.push(points[idx].slice());}
      let labels=Array(points.length).fill(-1);
      for(let it=0;it<100;it++){
        const next=points.map(p=>{let idx=0,md=Infinity;centers.forEach((c,i)=>{const d=dist2(p,c);if(d<md){md=d;idx=i;}});return idx;});
        const unchanged=next.every((l,i)=>l===labels[i]);labels=next;
        for(let c=0;c<k;c++){const ids=labels.map((l,i)=>l===c?i:-1).filter(i=>i>=0);if(ids.length){for(let d=0;d<points[0].length;d++)centers[c][d]=ids.reduce((s,i)=>s+points[i][d],0)/ids.length;}else{let far=0,fd=-1;points.forEach((p,i)=>{const d=dist2(p,centers[labels[i]]);if(d>fd){fd=d;far=i;}});centers[c]=points[far].slice();labels[far]=c;}}
        if(unchanged)break;
      }
      const inertia=points.reduce((s,p,i)=>s+dist2(p,centers[labels[i]]),0);
      if(!best||inertia<best.inertia)best={labels:labels.slice(),centers:centers.map(c=>c.slice()),inertia};
    }return best;
  }
  function cluster(points,options){const {method,neighbors,epsilon,sigma,k,type,seed}=options,A=similarity(points,method,neighbors,epsilon,sigma),analysis=analyzeAdjacency(A,type);let embedding=points.map((_,i)=>analysis.vectors.slice(0,k).map(v=>v[i]));if(type==='symmetric')embedding=embedding.map(p=>{const n=Math.hypot(...p)||1;return p.map(x=>x/n);});return {analysis,embedding,original:kmeans(points,k,seed),spectral:kmeans(embedding,k,seed)};}
  function mesh(kind='torus'){
    const vertices=[],faces=[];
    if(kind==='grid'){const w=13,h=11;for(let j=0;j<h;j++)for(let i=0;i<w;i++)vertices.push([(i-(w-1)/2)/4,(j-(h-1)/2)/4,.14*Math.cos(i*.55)*Math.cos(j*.55)]);for(let j=0;j<h-1;j++)for(let i=0;i<w-1;i++){const a=j*w+i;faces.push([a,a+1,a+w],[a+1,a+w+1,a+w]);}}
    else if(kind==='sphere'){
      const lon=18,lat=9;vertices.push([0,0,1.4]);for(let j=1;j<lat;j++)for(let i=0;i<lon;i++){const a=2*Math.PI*i/lon,b=Math.PI*j/lat;vertices.push([1.4*Math.sin(b)*Math.cos(a),1.4*Math.sin(b)*Math.sin(a),1.4*Math.cos(b)]);}const south=vertices.length;vertices.push([0,0,-1.4]);for(let i=0;i<lon;i++){faces.push([0,1+i,1+(i+1)%lon]);faces.push([south,1+(lat-2)*lon+(i+1)%lon,1+(lat-2)*lon+i]);}for(let j=0;j<lat-2;j++)for(let i=0;i<lon;i++){const a=1+j*lon+i,b=1+j*lon+(i+1)%lon,c=a+lon,d=b+lon;faces.push([a,b,c],[b,d,c]);}
    }else{const nu=20,nv=9;for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=i/nu*2*Math.PI,v=j/nv*2*Math.PI,r=1.15+.45*Math.cos(v);vertices.push([r*Math.cos(u),r*Math.sin(u),.45*Math.sin(v)]);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*nv+j,b=((i+1)%nu)*nv+j,c=i*nv+(j+1)%nv,d=((i+1)%nu)*nv+(j+1)%nv;faces.push([a,b,c],[b,d,c]);}}
    return {vertices,faces};
  }
  function meshEdges(mesh){const edgeMap=new Map();for(const f of mesh.faces)for(let i=0;i<3;i++){const a=Math.min(f[i],f[(i+1)%3]),b=Math.max(f[i],f[(i+1)%3]);edgeMap.set(a+','+b,{a,b,w:1});}return [...edgeMap.values()];}
  const api={zeros,eigenSymmetric,analyze,analyzeAdjacency,energy,preset,rng,dataset,similarity,kmeans,cluster,mesh,meshEdges,components,recommendSigma,recommendGraph,gaussianWeight,samePartition};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SpectralMath=api;
})(typeof window!=='undefined'?window:this);
