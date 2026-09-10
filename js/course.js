/* The second half follows functions → variational eigenvectors → spectral operators. */
(function(){
'use strict';
const modules=['foundations','playground','fiedler','clustering','mesh','smoothness','variational','fourier','convolution'];
Object.assign(window.LabCopy.zh,{
 smoothness:'圖上的函數與平滑性',variational:'Laplacian 的變分觀點',fourier:'圖傅立葉與濾波',convolution:'從譜濾波到圖卷積',
 smoothnessIntro:'04 的低階模態看起來比較平緩；這一節把「平滑」變成可計算的量。將向量視為節點上的函數，調整每個節點的值，再把每條邊的差異加起來，得到圖的 Dirichlet 能量。',
 variationalIntro:'05 定義了平滑能量。現在反過來問：在長度固定、排除常數方向後，哪個函數最平滑？逐步做約束最小化，就會看見 02 的 Fiedler 向量從問題中出現。這是有限維的變分觀點，再由它連到連續函數空間。',
 fourierIntro:'05、06 說明了特徵向量為何能依平滑程度排序。現在把它們當成一組基底：先分解節點訊號，再選擇保留哪些模態，最後以濾波改變不同頻率的貢獻。圖頻率描述沿連線的變化，並不是時間上的振動次數。',
 convolutionIntro:'07 在光譜座標中調整了各頻率。這一節把同一個運算寫成 Laplacian 的多項式，直接用鄰居數值計算，驗證譜濾波如何連到局部訊息傳遞，再理解圖神經網路多加了哪些可學習的步驟。',
 signalHelp:'這裡沿用 01 的目前作圖；訊號是每個節點上的函數值，與邊權重不同。先選一個訊號範例，或點左圖節點修改 f(i)，再切換下方的「分解與重建」和「頻率濾波」。07、08 共用這份訊號。',
 signalViews:'07 的實驗步驟',reconstructionView:'1. 分解與重建',filteringView:'2. 頻率濾波',
 reconstructionTask:'先按「保留全部模態」，確認原訊號能被重建；再減少保留數量，觀察能量與逐點差異。低頻近似會捨去沿邊快速變動的部分。',
 filteringTask:'先選「未正規化」與熱擴散低通，再增加擴散時間，觀察右圖的相鄰節點值變得接近。再比較高通：它保留的是低通所移除的變化。正規化模式則衡量各自內積中的平滑程度。',
 modeTieHelp:'目前截斷位置落在重複特徵值之中，部分重建會依基底選擇而不同。切到「頻率濾波」並選理想低通，可以讓相同特徵值使用相同增益。',
 filterTransformHelp:'先用本節的投影方式，把節點函數分解成各個模態係數。',
 spectralEnergyLink:'回到 05 的能量：在未正規化模式下，每個係數的平方乘上對應特徵值，再加總，就是沿邊的 Dirichlet 能量。高特徵值模態會讓同樣大小的訊號帶來較多變化。',
 spectralEnergyNormalized:'目前使用正規化 Laplacian，以下是相應內積中的光譜能量。若要與 05 的逐邊 Dirichlet 能量直接比較，請選「未正規化」。'
});
Object.assign(window.LabCopy.en,{
 smoothness:'Graph Functions & Smoothness',variational:'Variational View of the Laplacian',fourier:'Graph Fourier & Filtering',convolution:'From Spectral Filters to Graph Convolution',
 smoothnessIntro:'Low modes in 04 looked smoother. Here we make that observation precise: interpret a vector as a function on vertices, edit its values, and add the differences across edges to obtain its Dirichlet energy.',
 variationalIntro:'05 defined smoothness energy. Now ask which unit-length function is smoothest after excluding the constant direction. Follow constrained minimization to see the Fiedler vector from 02 emerge. This finite-dimensional variational viewpoint then leads to continuous function spaces.',
 fourierIntro:'05–06 explained why eigenvectors can be ordered by smoothness. Use them as a basis to decompose a node signal, reconstruct selected modes, and filter each frequency. Graph frequency measures variation across edges, rather than oscillations in time.',
 convolutionIntro:'07 adjusted frequencies in spectral coordinates. Write the same operator as a polynomial in the Laplacian and compute it from neighbor values. Compare both calculations, then see what learnable transformations and nonlinearities add in a graph neural network.',
 signalHelp:'This experiment uses the current drawing from 01. A signal is a function on vertices, distinct from edge weights. Select a preset or edit f(i) at a node, then switch between decomposition and frequency filtering. Modules 07–08 share this signal.',
 signalViews:'Experiments in 07',reconstructionView:'1. Decompose & reconstruct',filteringView:'2. Filter frequencies',
 reconstructionTask:'First keep all modes and check exact reconstruction. Then retain fewer modes and compare energy and node differences. Low-frequency approximations discard rapid changes across edges.',
 filteringTask:'Select Unnormalized and heat diffusion, then increase time to bring neighboring values closer together. Compare high-pass, which keeps the removed changes. Normalized modes measure smoothness in their respective inner products.',
 modeTieHelp:'This truncation splits a repeated eigenspace and depends on its chosen basis. In Frequency filtering, ideal low-pass treats equal eigenvalues with equal gain.',
 filterTransformHelp:'Project the vertex function onto the spectral basis introduced in this section.',
 spectralEnergyLink:'Return to 05: for the unnormalized Laplacian, weight each squared coefficient by its eigenvalue and sum to recover edgewise Dirichlet energy. Higher-eigenvalue modes contribute more variation at equal amplitude.',
 spectralEnergyNormalized:'This is spectral energy in the inner product for the selected normalized Laplacian. Choose Unnormalized for direct comparison with the edgewise Dirichlet energy in 05.'
});
window.LabCopy.zh.foundationIntro='00 是這個實驗室的起點：先放置節點、建立連線與設定權重，再依序理解鄰接矩陣 A、加權度數 D、Laplacian L，以及特徵值與特徵向量。右側每一步代入目前作圖的數值，說明哪些量由你設定、哪些由圖計算。01–04 與 07–08 可沿用目前作圖；05–06 先用小型教學圖理解平滑與變分，也能切換到目前作圖。';
window.LabCopy.en.foundationIntro='Start by placing nodes, connecting edges, and setting weights, then derive adjacency A, weighted degrees D, Laplacian L, and its eigenpairs. Each worked step uses your drawing to distinguish inputs from computed quantities. Modules 01–04 and 07–08 can reuse this drawing; 05–06 begin with small teaching graphs for smoothness and variation, with the current drawing also available.';
function resolveRoute(route){return route==='filtering'?'fourier':modules.includes(route)?route:null;}
function enter(state,module){state.module=module;if(module==='foundations')state.setup.step=0;return state;}
window.SpectralCourse={modules,resolveRoute,enter};
})();
