// Rebuild the first 31 Bunny eigenvectors for an instant offline mesh preview.
// Uses the same solver as interactive graphs. No network access is needed.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../js/math.js'),file=path.join(__dirname,'../js/mesh-data.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const mesh=context.window.SpectralMeshes.bunny,edges=M.meshEdges(mesh);
mesh.modes={};
for(const type of ['unnormalized','symmetric']){
 const start=performance.now(),r=M.analyze(mesh.vertices,edges,type);
 mesh.modes[type]={values:r.values.map(v=>+v.toFixed(12)),vectors:r.vectors.slice(0,31).map(v=>v.map(x=>+x.toFixed(12)))};
 console.log(type+': '+Math.round(performance.now()-start)+' ms');
}
fs.writeFileSync(file,'// Stanford Computer Graphics Laboratory, Bunny (res4). See assets/mesh/SOURCE.md.\nwindow.SpectralMeshes = '+JSON.stringify(context.window.SpectralMeshes)+';\n');
console.log('Stored 31 modes per symmetric problem; random-walk modes derive from Lsym.');
