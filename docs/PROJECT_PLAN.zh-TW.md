# Spectral Graph Lab — 網頁規劃草案

狀態：使用者已確認皇家深藍方向，並已授權建立本機網頁。第一版以 index.html 完成；尚未傳到 GitHub，也未部署。以下保留原規劃，實作現況請見根目錄 README.md。

## 已確認的需求

- 專題在工作區的獨立 `Spectral Graph Lab` 資料夾內進行。
- 最終呈現為可以操作的網頁。
- 提供繁體中文與英文切換；「兩個版本」暫按同一網站的兩種語言版本理解。
- 加入使用者的 Rozias LOGO。
- 先確認方向再開始製作；上架須等使用者另行指示。

計劃書是設計參考。當計劃書的交付或部署要求與上述指示不同時，以使用者的直接指示為準。

## 定位與首頁文案

**名稱：** Spectral Graph Lab

**領域：** Mathematical ML

**中文主張：** 從一條邊的改變，看見整張圖的結構。

**中文說明：** 透過互動操作，探索圖拉普拉斯矩陣、Fiedler 向量與光譜分群，理解光譜如何反映圖的連通性、幾何與平滑性。

**英文主張：** Change an edge. Discover the structure.

**英文說明：** Explore graph Laplacians, Fiedler vectors, and spectral clustering through interactive experiments that connect the spectrum to connectivity, geometry, and smoothness.

## 建議的網站架構

| 模組 | 英文名稱 | 主要操作 | 學習重點 |
| --- | --- | --- | --- |
| 圖形實驗場 | Graph Playground | 載入範例、增刪節點與邊、調整權重、切換 Laplacian | Graph → A、D、L → Spectrum |
| Fiedler 與連通性 | Fiedler & Connectivity | 調整橋接邊權重、分割閾值與節點函數值 | 第二小特徵值、瓶頸、Fiedler 向量與平滑能量 |
| 光譜分群 | Spectral Clustering | 選取資料集、建圖方法、群數與參數 | 原始座標、相似度圖、光譜嵌入及 K-Means 比較 |
| 特徵函數與網格 | Eigenfunctions & Mesh | 切換圖或網格、特徵向量序號、旋轉 3D 模型 | 從平滑模式到高頻振盪，連結離散與連續觀點 |

首頁提供四個入口與簡短體驗路徑。各模組包含「定義 → 直覺 → 操作 → 觀察 → 延伸」的說明層，讓畫面結果與數學原因相互對照。

## 版面與品牌提案

- 頁首放置 Rozias LOGO、專題名稱、模組導覽及「繁中 / EN」切換。
- 暫以深藍與金色 LOGO 作為品牌參考，採清楚留白、可讀公式及醒目圖形的研究實驗室風格。紅色 LOGO 保留為備選，尚未決定正式用色。
- 桌面畫面以參數面板、主要互動區及光譜資訊區呈現，下方安排矩陣與數學解說。
- 小螢幕改成垂直排列，控制項可收合。
- 語言切換涵蓋導覽、控制項、圖例、提示、數學解說及狀態訊息；切換時保留實驗狀態。
- 兩種語言使用相同實驗與計算邏輯，公式與符號一致。

## 預計功能範圍

- 支援 unnormalized、symmetric normalized 與 random-walk Laplacian。
- 顯示 A、D、L、特徵值光譜、連通分量數、第二小特徵值及選取的特徵向量。
- Fiedler 向量以節點顏色、一維座標與數值圖連動顯示，提供 threshold 分割。
- 提供 path、cycle、complete、star、barbell、橋接雙群、disconnected 與 grid 等 toy graphs。
- 區分 Free Graph Mode 與 Geometric Graph Mode：前者拖動位置不改變圖結構；後者座標參與建圖。
- 使用 Two Moons、Concentric Circles、Gaussian Blobs 等範例，比較原始空間 K-Means 與光譜分群。
- 建圖方式包含 kNN、epsilon neighborhood 與 Gaussian similarity；分開標示鄰居數與分群數。
- 提供 eigenvector gallery、toy mesh 與至少一個公開 3D mesh；公開素材須確認來源、授權與署名方式。
- 提供繁中與英文 README，說明原理、觀察結果、執行方式與數值限制。
- Graph Fourier transform、low-pass filtering、cotangent Laplacian 與 mass matrix 列為進階延伸，另行確認。

## 數學與互動驗收重點

- Free Graph Mode 只改節點畫面位置時，A、D、L 與光譜保持一致。
- 無向、非負權重圖的零特徵值重數應符合連通分量數；normalized Laplacian 的孤立點需明確定義處理慣例。
- 第二小特徵值與變分解釋須標示適用的 Laplacian；不能把 unnormalized 公式直接套用於所有模式。
- Random-walk Laplacian 的計算應使用適當方法，並說明與 symmetric normalized 形式的關係。
- 斷開圖不強套連通圖的唯一 Fiedler 二分解釋。
- 處理浮點誤差、特徵向量正負號不唯一及重複特徵值的基底不唯一。
- 同一圖改變橋接權重時，能同步觀察連通性與 Fiedler 向量的變化。
- 使用者能從同一組資料看到建圖、嵌入與分群的連續過程。
- 每個主要結果都有繁中／英文數學解說；所有交互操作在本機可用。

## 製作與確認順序

1. **已完成：** 整理參考計劃書、品牌素材與雙語規劃，使用者已確認並授權製作。
2. **確認後：** 製作本機版首頁、雙語切換與 Graph Playground，完成第一個可檢視的互動版本。
3. 依序加入 Fiedler／連通性、分群比較、特徵向量與 Mesh 模組。
4. 檢查數學計算、互動流程、語言完整性與版面，補齊雙語 README。
5. 本機驗收後，只有收到使用者的上架指示才進行部署。

原計劃書建議 Python、NumPy、SciPy、NetworkX、Plotly 與 Streamlit。依使用者後續希望使用 index.html 的指示，第一版改採原生 HTML、CSS、JavaScript，以便直接開啟並離線操作。

## 已整理的參考檔案

- `docs/Spectral Graph Lab.pdf`：使用者提供的 35 頁計劃書原檔副本。
- `assets/brand/rozias-logo.png`：工作區既有深藍金色 LOGO 副本。
- `assets/brand/rozias-logo-red.png`：工作區既有紅色 LOGO 參考檔副本。
- `docs/PROJECT_PLAN.en.md`：對應英文規劃草案。

來源 LOGO 位於同一工作區的 `Optimization Visual Lab/public`。檔案保留原樣；正式採用哪個版本待視覺方向確認。

> 2026-09-09 更新：依使用者回饋增加 00 基礎與參數、五模組共用作圖、本機保存、數字列表與可逐格查看的縮放矩陣。移除頁尾與裝飾標籤，Researcher Profile 連結已設定。現況以根目錄 README 為準。
