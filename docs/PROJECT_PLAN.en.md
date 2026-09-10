# Spectral Graph Lab — Website Proposal

Status: the user approved a royal navy direction and local website implementation. The first version now uses index.html; it has not been uploaded to GitHub or deployed. The original plan follows; see README.en.md for the implementation status.

## Confirmed requirements

- Work inside a dedicated `Spectral Graph Lab` folder in the shared workspace.
- Deliver an interactive website.
- Support Traditional Chinese and English. “Two versions” is provisionally interpreted as two language versions of the same website.
- Include the user's Rozias logo.
- Confirm the direction before implementation. Deployment requires a later instruction from the user.

The attached proposal is reference material. The user's direct instructions take precedence over its implementation or deployment recommendations.

## Positioning and homepage copy

**Name:** Spectral Graph Lab

**Field:** Mathematical ML

**Chinese headline:** 從一條邊的改變，看見整張圖的結構。

**Chinese description:** 透過互動操作，探索圖拉普拉斯矩陣、Fiedler 向量與光譜分群，理解光譜如何反映圖的連通性、幾何與平滑性。

**English headline:** Change an edge. Discover the structure.

**English description:** Explore graph Laplacians, Fiedler vectors, and spectral clustering through interactive experiments that connect the spectrum to connectivity, geometry, and smoothness.

## Proposed website structure

| Module | Chinese name | Main interactions | Learning focus |
| --- | --- | --- | --- |
| Graph Playground | 圖形實驗場 | Load examples, edit nodes and edges, adjust weights, select a Laplacian | Graph → A, D, L → Spectrum |
| Fiedler & Connectivity | Fiedler 與連通性 | Adjust bridge weights, partition thresholds, and node function values | Second-smallest eigenvalue, bottlenecks, Fiedler vector, and smoothness energy |
| Spectral Clustering | 光譜分群 | Select datasets, graph construction, cluster count, and parameters | Original coordinates, similarity graph, spectral embedding, and K-Means comparison |
| Eigenfunctions & Mesh | 特徵函數與網格 | Select graphs or meshes and eigenvector indices; rotate a 3D model | Smooth modes and higher-frequency oscillations; discrete and continuous viewpoints |

The homepage provides four entry points and a short guided path. Each module connects definitions, intuition, interaction, observations, and further connections.

## Layout and branding proposal

- Put the Rozias logo, project name, module navigation, and Traditional Chinese / EN switch in the header.
- Use the navy and gold logo as the provisional brand reference, with clear spacing, readable formulas, and prominent graph visuals. Keep the red logo as an alternative; the final palette remains open.
- On desktop, arrange controls, the main interactive view, and spectral information together, with matrices and mathematical explanations below.
- Stack sections on small screens and allow controls to collapse.
- Translate navigation, controls, legends, tooltips, mathematical explanations, and status messages. Preserve experiment state when switching languages.
- Share experiments and computation between languages, keeping formulas and notation consistent.

## Planned scope

- Unnormalized, symmetric normalized, and random-walk Laplacians.
- A, D, L, eigenvalue spectrum, connected component count, second-smallest eigenvalue, and selected eigenvectors.
- Linked Fiedler node coloring, one-dimensional coordinates, value plots, and threshold partitioning.
- Toy graphs: path, cycle, complete, star, barbell, two clusters with a bridge, disconnected, and grid.
- Separate Free Graph Mode from Geometric Graph Mode: visual dragging alone preserves graph structure in the former; coordinates participate in graph construction in the latter.
- Two Moons, Concentric Circles, and Gaussian Blobs for comparing original-space K-Means with spectral clustering.
- kNN, epsilon neighborhood, and Gaussian similarity graphs, with separate labels for neighbor count and cluster count.
- An eigenvector gallery, toy meshes, and at least one public 3D mesh, with verified source, license, and attribution.
- Traditional Chinese and English READMEs covering mathematics, observations, local setup, and numerical limitations.
- Graph Fourier transforms, low-pass filtering, cotangent Laplacians, and mass matrices remain proposed extensions requiring scope confirmation.

## Mathematical and interaction acceptance criteria

- Moving nodes without editing graph structure in Free Graph Mode preserves A, D, L, and the spectrum.
- For undirected graphs with nonnegative weights, zero-eigenvalue multiplicity agrees with connected component count; normalized Laplacians need an explicit isolated-vertex convention.
- Label which Laplacian each second-eigenvalue and variational explanation applies to. Do not apply unnormalized formulas unchanged to all modes.
- Use an appropriate method for the random-walk Laplacian and explain its relationship to the symmetric normalized form.
- Handle disconnected graphs without imposing a unique connected-graph Fiedler interpretation.
- Account for floating-point tolerance, eigenvector sign ambiguity, and nonunique bases for repeated eigenvalues.
- Bridge weight changes update the connectivity and Fiedler views together.
- Show graph construction, embedding, and clustering as a connected sequence on the same dataset.
- Provide mathematical explanations in both languages and verify all interactions locally.

## Implementation and approval sequence

1. **Completed:** organize the source proposal, branding assets, and bilingual plan; the user approved implementation.
2. **After confirmation:** build a local homepage, language switch, and Graph Playground as the first reviewable interactive version.
3. Add Fiedler/connectivity experiments, clustering comparison, eigenvectors, and mesh modules in sequence.
4. Verify mathematics, interactions, language coverage, and layout; complete both READMEs.
5. Deploy only after local review and a subsequent instruction from the user.

The source proposal suggests Python, NumPy, SciPy, NetworkX, Plotly, and Streamlit. Following the user’s preference for index.html, the first implementation uses native HTML, CSS, and JavaScript for direct, offline use.

## Organized reference files

- `docs/Spectral Graph Lab.pdf`: an unchanged copy of the user's 35-page proposal.
- `assets/brand/rozias-logo.png`: a copy of the existing navy and gold logo.
- `assets/brand/rozias-logo-red.png`: a copy of the existing alternate logo file.
- `docs/PROJECT_PLAN.zh-TW.md`: the corresponding Traditional Chinese proposal.

The logos came from `Optimization Visual Lab/public` in the shared workspace. They are preserved unchanged; the final variant will be chosen when the visual direction is confirmed.

> 2026-09-09 update: added module 00, a shared graph across all five modules, local persistence, numeric eigenvalue lists, and scalable matrices with entry calculations. Removed the footer and decorative labels; Researcher Profile now links to the personal website. See the root README for current behavior.
