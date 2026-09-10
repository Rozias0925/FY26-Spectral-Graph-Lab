/* The second half follows functions → variational eigenvectors → spectral operators. */
(function(){
'use strict';
const modules=['foundations','playground','fiedler','clustering','mesh','smoothness','variational','fourier','convolution'];
Object.assign(window.LabCopy.zh,{
 smoothness:'圖上的函數與平滑性',variational:'Laplacian 的變分觀點',fourier:'圖傅立葉與濾波',convolution:'從譜濾波到圖卷積',
 smoothnessIntro:'04 留下了一個問題：低階模態看起來比較平滑，但「看起來」不能用來證明或比較。05 將向量讀成節點上的函數，把每條邊兩端的差異加起來，得到可計算的 Dirichlet 能量。',
 variationalIntro:'05 已經能替函數計算平滑能量。06 反過來尋找答案：在長度固定、排除常數方向後，哪個函數最平滑？沿著約束最小化前進，就會看見 02 的 Fiedler 向量不再是神奇公式，而是問題的解。',
 fourierIntro:'06 讓特徵向量依平滑程度排成一列。07 把這些方向當成一組基底，問任何節點訊號由多少低頻與高頻組成，再藉由改變各模態的比例完成重建與濾波。',
 convolutionIntro:'07 的濾波要先進入光譜座標。08 問最後一個問題：若增益是 Laplacian 的多項式，同一運算能否只靠鄰居完成？比較兩種算法後，再把重複平滑連到訊息傳遞、GNN 與過度平滑。',
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
 smoothnessIntro:'Module 04 left a question: low modes looked smoother, but appearance alone cannot prove or compare smoothness. Module 05 reads a vector as a function on vertices and sums its edgewise differences into a computable Dirichlet energy.',
 variationalIntro:'Module 05 can score a function by smoothness energy. Module 06 reverses the problem: which unit-length function is smoothest after constants are excluded? Constrained minimization makes the Fiedler vector from Module 02 emerge as the answer.',
 fourierIntro:'Module 06 ordered eigenvectors by smoothness. Module 07 uses those directions as a basis, asks how much low and high graph frequency a vertex signal contains, and changes modal contributions for reconstruction and filtering.',
 convolutionIntro:'Module 07 filtered in spectral coordinates. Module 08 asks whether a Laplacian polynomial can perform the same operation using only neighbors. Comparing both computations connects repeated smoothing to message passing, GNNs, and over-smoothing.',
 signalHelp:'This experiment uses the current drawing from 01. A signal is a function on vertices, distinct from edge weights. Select a preset or edit f(i) at a node, then switch between decomposition and frequency filtering. Modules 07–08 share this signal.',
 signalViews:'Experiments in 07',reconstructionView:'1. Decompose & reconstruct',filteringView:'2. Filter frequencies',
 reconstructionTask:'First keep all modes and check exact reconstruction. Then retain fewer modes and compare energy and node differences. Low-frequency approximations discard rapid changes across edges.',
 filteringTask:'Select Unnormalized and heat diffusion, then increase time to bring neighboring values closer together. Compare high-pass, which keeps the removed changes. Normalized modes measure smoothness in their respective inner products.',
 modeTieHelp:'This truncation splits a repeated eigenspace and depends on its chosen basis. In Frequency filtering, ideal low-pass treats equal eigenvalues with equal gain.',
 filterTransformHelp:'Project the vertex function onto the spectral basis introduced in this section.',
 spectralEnergyLink:'Return to 05: for the unnormalized Laplacian, weight each squared coefficient by its eigenvalue and sum to recover edgewise Dirichlet energy. Higher-eigenvalue modes contribute more variation at equal amplitude.',
 spectralEnergyNormalized:'This is spectral energy in the inner product for the selected normalized Laplacian. Choose Unnormalized for direct comparison with the edgewise Dirichlet energy in 05.'
});
Object.assign(window.LabCopy.zh,{
 playgroundIntro:'00 已把圖翻成 A、D、L 與特徵對。01 讓你主動改變圖，分辨光譜真正讀取的是連線與權重，還是螢幕上的排版位置。',
 fiedlerIntro:'01 顯示光譜會回應連線。02 聚焦在第二小特徵值 λ₂ 與 Fiedler 向量 v₂，追問它們能否指出薄弱連接，並把節點排成可切分的一維座標。',
 clusteringIntro:'02 用一個特徵向量把圖分成兩側。03 將想法推廣到多個低階特徵向量：先把資料變成相似度圖，再到光譜座標中執行 K-Means，處理原座標中不容易切開的群組。',
 meshIntro:'03 把特徵向量當成座標；04 把同一組數字畫回圖與曲面，視為離散空間上的模態，並比較低階平滑變化與高階振盪。'
});
Object.assign(window.LabCopy.en,{
 playgroundIntro:'Module 00 translated a graph into A, D, L, and eigenpairs. Module 01 lets you change the graph and separate structure carried by edges and weights from screen layout.',
 fiedlerIntro:'Module 01 showed the spectrum responding to edges. Module 02 focuses on λ₂ and the Fiedler vector v₂, asking whether they reveal weak connectivity and place vertices on a coordinate that can be cut.',
 clusteringIntro:'Module 02 split a graph with one eigenvector. Module 03 extends the idea to several low eigenvectors: build a similarity graph, then run K-Means in spectral coordinates to handle groups that are hard to separate in the original plane.',
 meshIntro:'Module 03 treated eigenvectors as coordinates. Module 04 draws the same values over graphs and surfaces as discrete modes, contrasting smooth low modes with oscillatory high modes.'
});
window.LabCopy.zh.foundationIntro='00 從整個故事的第一個問題開始：怎麼把「誰和誰有關係」交給線性代數處理？畫一張小圖後，依序建立 A、D、L 與特徵對，讓每個新符號都有來由，也替 01–08 準備同一套語言。';
window.LabCopy.en.foundationIntro='Module 00 begins with the course’s first question: how can linear algebra compute with relationships? Draw a small graph, then build A, D, L, and its eigenpairs in sequence so every symbol has a reason to appear and Modules 01–08 share one language.';
function resolveRoute(route){return route==='filtering'?'fourier':modules.includes(route)?route:null;}
function enter(state,module){state.module=module;if(module==='foundations')state.setup.step=0;return state;}
window.SpectralCourse={modules,resolveRoute,enter};
})();
