/* The second half follows functions → variational eigenvectors → spectral operators. */
(function(){
'use strict';
const modules=['foundations','playground','fiedler','clustering','mesh','smoothness','variational','fourier','convolution'];
const chapterMeta={
 foundations:{marker:'Prologue',label:'Prologue'},
 playground:{marker:'I',label:'Chapter I'},
 fiedler:{marker:'II',label:'Chapter II'},
 clustering:{marker:'III',label:'Chapter III'},
 mesh:{marker:'IV',label:'Chapter IV'},
 smoothness:{marker:'V',label:'Chapter V'},
 variational:{marker:'VI',label:'Chapter VI'},
 fourier:{marker:'VII',label:'Chapter VII'},
 convolution:{marker:'VIII',label:'Chapter VIII'}
};
Object.assign(window.LabCopy.zh,{
 smoothness:'圖上的函數與平滑性',variational:'Laplacian 的變分觀點',fourier:'圖傅立葉與濾波',convolution:'從譜濾波到圖卷積',
 sharedGraphLabel:'沿用 Prologue 作圖',autoWeight:'依距離自動計算；到 Chapter I 調整座標或 σ。',datasetScale:'依 Chapter III 目前幾何資料估計',geometrySettingsHelp:'這些參數只在「Chapter III → 幾何資料集」建圖時生效，不會改動你手畫的連線。',emptyShared:'目前沒有節點。請到 Prologue 作圖後再分析。',foundationContinue:'前往 Chapter I 觀察光譜 →',
 smoothnessIntro:'Chapter IV 留下一個問題：低階模態看起來比較平滑，但「看起來」不能用來證明或比較。Chapter V 將向量讀成節點上的函數，把每條邊兩端的差異加起來，得到可計算的 Dirichlet 能量。',
 variationalIntro:'Chapter V 已經能替函數計算平滑能量。Chapter VI 反過來尋找答案：在長度固定、排除常數方向後，哪個函數最平滑？沿著約束最小化前進，就會看見 Chapter II 的 Fiedler 向量不再是神奇公式，而是問題的解。',
 fourierIntro:'Chapter VI 找到最平滑的非定值方向。再依序排除已找到的方向、繼續最小化，就能得到完整的正交基底。Chapter VII 用這組基底分解節點訊號，再改變各模態的比例完成重建與濾波。',
 convolutionIntro:'Chapter VII 的濾波要先進入光譜座標。Chapter VIII 問最後一個問題：若增益是 Laplacian 的多項式，同一運算能否只靠鄰居完成？比較兩種算法後，再把重複平滑連到訊息傳遞、GNN 與過度平滑。',
 signalHelp:'這裡沿用 Chapter I 的目前作圖；訊號是每個節點上的函數值，與邊權重不同。先選一個訊號範例，或點左圖節點修改 f(i)，再切換下方的「分解與重建」和「頻率濾波」。Chapter VII 與 Chapter VIII 共用這份訊號。',
 signalViews:'Chapter VII 的實驗步驟',reconstructionView:'1. 分解與重建',filteringView:'2. 頻率濾波',
 reconstructionTask:'先按「保留全部模態」，確認原訊號能被重建；再減少保留數量，比較訊號平方範數、Dirichlet 能量與逐點差異。平方範數衡量訊號大小，Dirichlet 能量衡量沿圖的變化；低頻近似會移除較高特徵值的成分。',
 filteringTask:'先選「未正規化」與熱擴散低通，再增加擴散時間，觀察右圖的相鄰節點值變得接近。再比較高通：它保留的是低通所移除的變化。正規化模式則衡量各自內積中的平滑程度。',
 modeTieHelp:'目前截斷位置落在重複特徵值之中，部分重建會依基底選擇而不同。切到「頻率濾波」並選理想低通，可以讓相同特徵值使用相同增益。',
 filterTransformHelp:'先用本節的投影方式，把節點函數分解成各個模態係數。',
 spectralEnergyLink:'回到 Chapter V 的能量：在未正規化模式下，每個係數的平方乘上對應特徵值，再加總，就是沿邊的 Dirichlet 能量。高特徵值模態會讓同樣大小的訊號帶來較多變化。',
 spectralEnergyNormalized:'正規化模式要分開解讀：隨機漫步的度數加權 Dirichlet 能量仍等於 Chapter V 的逐邊能量；對稱正規化則比較節點值除以度數平方根後的差異。',
 spectralEnergyUnnormalized:'未正規化模式直接比較相鄰節點值。係數平方乘上特徵值後加總，就是 Chapter V 的逐邊 Dirichlet 能量。它衡量變化程度，與衡量訊號大小的平方範數 Q(f) 不同。',
 spectralEnergySymmetric:'對稱正規化比較 fᵢ/√dᵢ 與 fⱼ/√dⱼ 的差異；這裡的 Dirichlet 能量不是原始節點值的逐邊差平方。有連線的連通圖，其零模態正比於 √d，因此度數不相同時，熱濾波不一定保留原始值相同的常數訊號。孤立節點的能量貢獻為 0。',
 spectralEnergyRandomwalk:'隨機漫步使用度數加權內積。因為 D*Lrw = L₀，以下的 Dirichlet 能量仍等於 Chapter V 的原始逐邊能量；平方範數 Q(f) 則使用同一組度數權重。D* 在孤立節點取 1，這些節點不貢獻 Dirichlet 能量。',
 fiedlerSpectrumHint:'一次查看一個特徵值；左右切換只改變這張數值卡，不會改變圖上的 v₂、分組或 λ₂。',
 miniSmoothGraph:'這是一條單位權重路徑 1—2—3—4—5。',
 miniSmoothDefinition:'圖上的「平滑」是指相連節點的函數值彼此接近。',
 miniSmoothDerivation:'先代入 L₀=D−A，再把度數項與鄰接項合併成差的平方。雙重求和把每條無向邊算兩次，所以乘上 1/2；改成對邊集合 E 求和後，每條邊只計一次。',
 miniSmoothLow:'能量小：大多數相鄰節點的值接近，訊號沿路徑緩慢變化。',
 miniSmoothZero:'能量等於 0：每條邊兩端都相同；在這條連通路徑上，函數必為常數。',
 miniSmoothHigh:'交錯訊號能量高：每條邊兩端都劇烈跳動，平方差會累積。'
});
Object.assign(window.LabCopy.en,{
 smoothness:'Graph Functions & Smoothness',variational:'Variational View of the Laplacian',fourier:'Graph Fourier & Filtering',convolution:'From Spectral Filters to Graph Convolution',
 sharedGraphLabel:'Drawing from Prologue',autoWeight:'Computed from distance; adjust coordinates or σ in Chapter I.',datasetScale:'Estimated from the current geometric data in Chapter III',geometrySettingsHelp:'These settings apply to Chapter III → Geometric dataset. They do not modify your manually drawn edges.',emptyShared:'There are no nodes. Draw a graph in Prologue before analyzing it.',foundationContinue:'Continue to Chapter I: inspect the spectrum →',
 smoothnessIntro:'Chapter IV left a question: low modes looked smoother, but appearance alone cannot prove or compare smoothness. Chapter V reads a vector as a function on vertices and sums its edgewise differences into a computable Dirichlet energy.',
 variationalIntro:'Chapter V can score a function by smoothness energy. Chapter VI reverses the problem: which unit-length function is smoothest after constants are excluded? Constrained minimization makes the Fiedler vector from Chapter II emerge as the answer.',
 fourierIntro:'Chapter VI found the smoothest nonconstant direction. Excluding each direction already found and minimizing again produces a complete orthonormal basis. Chapter VII uses that basis to decompose vertex signals, then changes modal contributions for reconstruction and filtering.',
 convolutionIntro:'Chapter VII filtered in spectral coordinates. Chapter VIII asks whether a Laplacian polynomial can perform the same operation using only neighbors. Comparing both computations connects repeated smoothing to message passing, GNNs, and over-smoothing.',
 signalHelp:'This experiment uses the current drawing from Chapter I. A signal is a function on vertices, distinct from edge weights. Select a preset or edit f(i) at a node, then switch between decomposition and frequency filtering. Chapters VII–VIII share this signal.',
 signalViews:'Experiments in Chapter VII',reconstructionView:'1. Decompose & reconstruct',filteringView:'2. Filter frequencies',
 reconstructionTask:'Keep all modes and check exact reconstruction. Then retain fewer modes and compare squared signal norm, Dirichlet energy, and node differences. Squared norm measures signal size; Dirichlet energy measures variation across the graph. Low-frequency approximation removes higher-eigenvalue components.',
 filteringTask:'Select Unnormalized and heat diffusion, then increase time to bring neighboring values closer together. Compare high-pass, which keeps the removed changes. Normalized modes measure smoothness in their respective inner products.',
 modeTieHelp:'This truncation splits a repeated eigenspace and depends on its chosen basis. In Frequency filtering, ideal low-pass treats equal eigenvalues with equal gain.',
 filterTransformHelp:'Project the vertex function onto the spectral basis introduced in this section.',
 spectralEnergyLink:'Return to Chapter V: for the unnormalized Laplacian, weight each squared coefficient by its eigenvalue and sum to recover edgewise Dirichlet energy. Higher-eigenvalue modes contribute more variation at equal amplitude.',
 spectralEnergyNormalized:'Read the normalized modes separately: degree-weighted random-walk Dirichlet energy still equals Chapter V’s edgewise energy; symmetric normalization compares values after division by the square root of degree.',
 spectralEnergyUnnormalized:'Unnormalized mode compares adjacent vertex values directly. Weight squared coefficients by eigenvalues and sum to recover Chapter V’s edgewise Dirichlet energy. This measures variation, whereas the squared signal norm Q(f) measures signal size.',
 spectralEnergySymmetric:'Symmetric normalization compares fᵢ/√dᵢ with fⱼ/√dⱼ. Its Dirichlet energy is not the edgewise squared difference of raw vertex values. On a connected graph with positive degrees its zero mode is proportional to √d, so heat filtering need not preserve a constant raw signal when degrees differ. Isolated vertices contribute zero energy.',
 spectralEnergyRandomwalk:'Random-walk mode uses the degree-weighted inner product. Since D*Lrw = L₀, its Dirichlet energy still equals Chapter V’s original edgewise energy. The squared norm Q(f) uses the same degree weights. D* assigns 1 to isolated vertices, which contribute no Dirichlet energy.',
 fiedlerSpectrumHint:'Browse one eigenvalue at a time. The arrows only change this readout; v₂, its partition, and λ₂ stay fixed.',
 miniSmoothGraph:'This is the unit-weight path 1—2—3—4—5.',
 miniSmoothDefinition:'A graph function is smooth when values at connected vertices are close.',
 miniSmoothDerivation:'Substitute L₀=D−A, then combine the degree and adjacency terms into squared differences. The double sum counts each undirected edge twice, so it has a factor of 1/2; the final edge-set sum counts each edge once.',
 miniSmoothLow:'Low energy: most neighboring values are close, so the signal changes slowly along the path.',
 miniSmoothZero:'Zero energy: both ends of every edge agree; on this connected path, the function must be constant.',
 miniSmoothHigh:'High alternating energy: every edge crosses a large jump, and the squared differences accumulate.'
});
Object.assign(window.LabCopy.zh,{
 playgroundIntro:'Prologue 已把圖翻成 A、D、L 與特徵對。Chapter I 讓你主動改變圖，分辨光譜真正讀取的是連線與權重，還是螢幕上的排版位置。',
 fiedlerIntro:'Chapter I 顯示光譜會回應連線。Chapter II 聚焦在第二小特徵值 λ₂ 與 Fiedler 向量 v₂，追問它們能否指出薄弱連接，並把節點排成可切分的一維座標。',
 clusteringIntro:'Chapter II 用一個特徵向量把圖分成兩側。Chapter III 將想法推廣到多個低階特徵向量：先把資料變成相似度圖，再到光譜座標中執行 K-Means，處理原座標中不容易切開的群組。',
 meshIntro:'Chapter III 把特徵向量當成座標；Chapter IV 把同一組數字畫回圖與曲面，視為離散空間上的模態，並比較低階平滑變化與高階振盪。'
});
Object.assign(window.LabCopy.en,{
 playgroundIntro:'Prologue translated a graph into A, D, L, and eigenpairs. Chapter I lets you change the graph and separate structure carried by edges and weights from screen layout.',
 fiedlerIntro:'Chapter I showed the spectrum responding to edges. Chapter II focuses on λ₂ and the Fiedler vector v₂, asking whether they reveal weak connectivity and place vertices on a coordinate that can be cut.',
 clusteringIntro:'Chapter II split a graph with one eigenvector. Chapter III extends the idea to several low eigenvectors: build a similarity graph, then run K-Means in spectral coordinates to handle groups that are hard to separate in the original plane.',
 meshIntro:'Chapter III treated eigenvectors as coordinates. Chapter IV draws the same values over graphs and surfaces as discrete modes, contrasting smooth low modes with oscillatory high modes.'
});
window.LabCopy.zh.foundationIntro='Prologue 從整個故事的第一個問題開始：怎麼把「誰和誰有關係」交給線性代數處理？畫一張小圖後，依序建立 A、D、L 與特徵對，讓每個新符號都有來由，也替 Chapter I–VIII 準備同一套語言。';
window.LabCopy.en.foundationIntro='Prologue begins with the course’s first question: how can linear algebra compute with relationships? Draw a small graph, then build A, D, L, and its eigenpairs in sequence so every symbol has a reason to appear and Chapters I–VIII share one language.';
function resolveRoute(route){return route==='filtering'?'fourier':modules.includes(route)?route:null;}
function enter(state,module){state.module=module;if(module==='foundations')state.setup.step=0;return state;}
function chapter(module){return chapterMeta[module]||{marker:'',label:''};}
function formatChapters(value){return String(value).replace(/\{\{chapter:([a-z]+)\}\}/g,(_,module)=>chapter(module).label);}
function clampSpectrumIndex(index,length){return length>0?Math.min(Math.max(0,Number.isInteger(index)?index:0),length-1):0;}
window.SpectralCourse={modules,chapterMeta,chapter,formatChapters,clampSpectrumIndex,resolveRoute,enter};
})();
