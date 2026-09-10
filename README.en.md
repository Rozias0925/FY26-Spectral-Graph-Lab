# Spectral Graph Lab

[繁體中文](README.md) · Royal navy theme · Rozias Mathematical Labs

A local interactive laboratory for graph Laplacians, Fiedler vectors, spectral clustering, and mesh modes, followed by graph functions, smoothness energy, variational principles, Fourier filtering, and graph convolution. It is a static site that can be published directly with GitHub Pages without a build step.

> Copyright © 2026 文君豪. All Rights Reserved. The source is publicly viewable, but no permission is granted to copy, modify, distribute, or sublicense it. Third-party materials remain under their respective terms.

## Open the site

Open **index.html** in a browser. Keep `styles.css`, `refinements.css`, `js/`, and `assets/` in their relative locations. KaTeX scripts and fonts are bundled for offline equations. No package installation, build, internet connection, or API keys are required.

Alternatively run `python -m http.server 8766 --bind 127.0.0.1` from this folder, then visit `http://127.0.0.1:8766/`. This starts a local server only; choose another port if necessary.

## Upload to GitHub

The project includes `.gitignore`, `.gitattributes`, `.nojekyll`, ownership terms, and third-party notices. To publish the current folder again, run:

```bash
git add .
git commit -m "Publish Spectral Graph Lab"
git branch -M main
git remote add origin https://github.com/Rozias0925/FY26-Spectral-Graph-Lab.git
git push -u origin main
```

If this remote is already configured, skip `git remote add origin`. For GitHub Pages, the site entry point is the root `index.html`; no compilation is required.

## Prologue through Chapter VIII: from spectral observations to variational principles

- **Prologue / Foundations & Parameters:** derive nodes, weights, A, D, L, eigenvalues, and eigenvectors step by step from the current drawing. Select matrix entries to see their calculations and configure shared parameters.
- **Chapter I / Graph Playground:** eight graph examples, editable nodes and edges, edge weights, three Laplacians, eigenvalues, eigenvectors, and an A/D/L matrix inspector. Select Connect and then two nodes to add an edge; select an existing edge to edit its weight. Up to 40 nodes.
- **Chapter II / Fiedler & Connectivity:** reuse the drawing and adjust the weight of any existing edge and partition threshold, switch between continuous and partition coloring, and manipulate a five-node signal to explore smoothness energy.
- **Chapter III / Spectral Clustering:** analyze the adjacency of the current drawing, or choose a geometric dataset: moons, concentric circles, and Gaussian blobs; kNN, epsilon, or Gaussian graphs; 2–6 clusters, graph parameters, seeds, and Laplacians. Compare original data, the similarity graph, the spectral embedding, original-space K-Means, and spectral clustering. Drag, add, or delete points in the original-data plot. Supports 8–120 points.
- **Chapter IV / Eigenfunctions & Mesh:** inspect the current drawing’s modes, or rotate and zoom a torus, sphere, grid, or public Stanford Bunny. Inspect the first 30 modes. Drag or use arrow keys to rotate; scroll to zoom.
- **Chapter V / Graph Functions & Smoothness** (`#smoothness`): edit values on a five-node teaching graph and compare each edge's contribution to make graph smoothness precise.
- **Chapter VI / Variational View of the Laplacian** (`#variational`): lower energy on a weak-bridge teaching graph while removing the mean and keeping unit norm. Follow the actual iterations toward a Fiedler mode, then compare the finite problem with continuous function spaces and the Neumann problem.
- **Chapter VII / Graph Fourier & Filtering** (`#fourier`): the former two pages are now Decomposition & Reconstruction and Filtering tabs. Edit a signal on the current drawing, interpret smoothness-ordered modes as graph frequencies, and compare truncation, heat diffusion, high-pass, and ideal low-pass responses.
- **Chapter VIII / From Spectral Filters to Graph Convolution** (`#convolution`): adjust local averaging strength and the number of steps, then compare polynomial spectral filtering with repeated local computation. Explore finite-hop support and the connection to graph learning; this is an operator experiment, with no GNN training pipeline.

Switch Traditional Chinese / English in the header. Prologue through Chapter II edit the same graph; the Current drawing source in Chapters III–IV and Chapters VII–VIII uses those same nodes and edges. Chapters V–VI use separate small teaching graphs with the unnormalized Laplacian. Their functions, energies, and constraints can be examined step by step without overwriting the current drawing or inheriting its normalization setting. Layout, weights, signals, and shared settings survive navigation, language changes, and reloads through browser-local storage. If storage is unavailable, the page reports that limitation.

## Mathematics

For an undirected graph with nonnegative weights, `A[i,j] = w[i,j]`, `D[i,i] = Σj A[i,j]`, and `L₀ = D − A`.

- Zero-eigenvalue multiplicity counts connected components. For a connected graph with at least two vertices, the unnormalized λ₂ is positive and is called algebraic connectivity.
- Smoothness energy is `fᵀL₀f = Σ{i,j}∈E w[i,j](f[i]−f[j])²`, counting each undirected edge once.
- The unnormalized Fiedler vector minimizes this energy subject to unit Euclidean norm and orthogonality to the constant vector. Thresholding explores spectral cuts without guaranteeing an optimal graph cut.
- Clustering uses eigenvectors for the k smallest eigenvalues; symmetric normalized mode additionally normalizes embedding rows. K-Means then operates on these coordinates. Results depend on graph construction.
- For a unit eigenvector of L₀, its energy equals its eigenvalue, linking eigenvalues to variation across the graph.

## Numerical conventions and limits

`Lsym = D^(-1/2) L₀ D^(-1/2)` and `Lrw = D^(-1) L₀`. Inverse degrees are set to zero at isolated vertices. Their normalized rows and columns are zero, so each isolate contributes a zero eigenvalue. Other definitions may instead set the normalized diagonal of an isolate to one.

A real symmetric Jacobi eigensolver computes eigenpairs. Random-walk eigenvectors are obtained from the symmetric normalized problem using D^(-1/2), followed by Euclidean normalization. The nonsymmetric matrix is not passed directly to a symmetric solver. Eigenpairs are sorted by eigenvalue.

Zero tests use a scale-dependent tolerance; extremely small positive connections may be numerically indistinguishable from zero. Foundational smoothness energy and Chapters V–VI use L₀; the L₀ energy of a normalized mode need not equal its normalized eigenvalue. Chapter VII instead computes spectral energy using the selected operator and its inner product. The `f ⟂ 1` variational formula applies to L₀; normalized variants have different weighted constraints.

Eigenvector signs are fixed by making a largest-magnitude component positive. Signs are mathematically arbitrary, and bases within repeated eigenspaces are also nonunique. The UI reports repeated eigenvalues and disables ordinary Fiedler threshold partitioning on disconnected graphs.

kNN uses union symmetrization. Selected edges receive Gaussian weights, with no self loops. K-Means uses seeded K-Means++ initialization and multiple restarts. Cluster IDs and colors have no fixed semantic correspondence across methods.

Mesh triangles supply unit-weight graph edges. Cotangent Laplacians and mass matrices remain future extensions. The rendered modes are discrete graph modes, not claimed to be accurate Laplace–Beltrami eigenfunctions.

## Reproducible observations

- Increasing a bridge from zero joins two components and increases unnormalized λ₂.
- Dragging Free Graph Mode nodes changes the layout alone; dragging clustering points reconstructs the similarity graph.
- The path signal `[1, 1.1, 1.2, 1.3, 1.4]` has energy 0.04; `[1, −1, 1, −1, 1]` has energy 16.
- Default moon parameters separate the moon shapes in spectral coordinates. Different graph choices can degrade that result.

## Files and validation

`index.html` is the entry point; `styles.css` and `refinements.css` define the theme and readable numerical views; `js/math.js` contains the numerical core; `js/app.js` handles interactions and rendering; `js/content.js` and `js/learning.js` contain translations and beginner definitions; `js/session.js` manages the shared graph and local persistence; `js/mesh-data.js` bundles the public mesh.

With Node.js, run `node --test tests/*.test.cjs`. Checks cover analytic spectra, eigenpair residuals, orthogonality, components, energy, clustering, mesh data, translations, LaTeX parsing, coordinate weights, undo, and persistence.

## Coordinate drawing and clustering scale

In Chapter I, choose manual weights or the coordinate plane. One grid interval is one unit (100 internal drawing units). Only selected edges receive Gaussian weights; unconnected pairs stay at zero. Moving nodes changes the spectrum only in coordinate mode. Switching back restores original manual weights. Undo retains the last 40 drawing operations across modules for this page session; reload clears undo history while preserving the current graph.

The suggested geometric σ is the median distance to each point’s nearest distinct neighbor. It is a scale-aware starting point, not a universal optimum. Apply local graph selects union 4-NN and this σ; switching example datasets also uses these defaults. Coordinate drawing instead recommends the median positive selected edge length, falling back to nearest-neighbor distance when no edges exist.

The reproduced 48-point example (40 outer points and 8 inner points) splits sideways with a full Gaussian graph and σ = 0.77. Using its estimated σ ≈ 0.115 separates inner and outer groups for all three Laplacians. Regression tests also cover 80-point circles and moons across seeds. No dataset-specific labels are hardcoded. The UI reports whether recomputation changes membership, ignoring mere cluster ID permutations.

Local [KaTeX](https://katex.org/docs/autorender) assets and the MIT license are in `assets/vendor/katex/`. Prologue retains worked calculations, with full matrix and vector views in Chapter I. The sidebar scrolls independently. Implemented chapters are Prologue through Chapter VIII.

Public model: [Stanford 3D Scanning Repository](https://graphics.stanford.edu/data/3Dscanrep/). See [attribution and terms](assets/mesh/SOURCE.md). The Rozias logo, original interface, source code, and teaching text belong to 文君豪.

The fixed Bunny topology bundles 31 precomputed eigenvectors for responsive offline use. The first 30 modes use these actual computed results; other graphs are solved interactively. Run `node scripts/build-bunny-modes.cjs` to regenerate them with the same numerical solver.

## Ownership and third-party material

Unless identified as third-party material, the original source code, visual design, teaching text, and `assets/brand/` material in this repository are **Copyright © 2026 文君豪. All Rights Reserved.** See [LICENSE](LICENSE) for the complete notice. Public access to this source repository does not make it open-source software.

KaTeX is used under the MIT License. The Stanford Bunny remains subject to the source repository's research-use, attribution, redistribution, and commercial-use conditions. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the complete list and links.

## The teaching sequence in Chapters V–VIII

Chapter IV shows that lower mesh modes look smoother. Chapter V defines that smoothness, Chapter VI explains why eigenvectors arise, Chapter VII uses those modes to decompose and filter signals, and Chapter VIII connects spectral operators to computations between neighbors.

### Chapter V: a vector is also a function

A function on a finite graph is $f:V\to\mathbb R$, equivalently $f\in\mathbb R^n$. For the unnormalized Laplacian,

$$
E[f]=f^\top L_0 f
=\sum_{\{i,j\}\in E}w_{ij}(f_i-f_j)^2
=\frac12\sum_{i,j}w_{ij}(f_i-f_j)^2.
$$

The edge table counts each undirected edge once; the factor $1/2$ applies only to the sum over all ordered pairs. Greater differences across an edge contribute more energy. Adding a constant leaves energy unchanged, while multiplying a function by $c$ multiplies energy by $c^2$. Comparing functions of different amplitudes therefore motivates normalization in Chapter VI.

### Chapter VI: eigenvectors emerge from energy minimization

Minimizing energy alone permits the zero vector. Unit norm rules it out but still allows the constant minimizer. For a connected graph with at least two vertices, excluding the constant direction gives

$$
\lambda_2=\min_{\substack{f\perp\mathbf1\\\lVert f\rVert_2=1}}f^\top L_0f.
$$

The experiment performs actual energy-reduction, mean-removal, and normalization steps. Energy gaps, constraint residuals, and eigen-equation residuals distinguish visual resemblance from proximity to a stationary point. For a repeated lowest permitted eigenvalue, every unit vector in its eigenspace minimizes the energy. Even a simple eigenvalue permits either sign. Reaching the lowest permitted mode also depends on the initial vector having a component in that eigenspace.

Here $E:\mathbb R^n\to\mathbb R$ is a finite-dimensional energy functional. The continuous comparison introduces $H^1(\Omega)$: square-integrable functions with square-integrable first weak derivatives, and energy $\int_\Omega|\nabla f|^2\,dx$. The constant zero mode and mean-zero minimization correspond to a Neumann problem on a bounded connected Lipschitz domain. Homogeneous Dirichlet conditions instead use $H_0^1(\Omega)$ and have a different first-eigenvalue statement. This illustrates a variational connection; it does not identify an arbitrary graph with an exact discretization of a continuous PDE. See [Gantumur's notes on Laplacian spectra](https://math.mcgill.ca/gantumur/math580f13/laplacian.pdf).

### Chapter VII: smoothness-ordered modes become graph frequencies

Unnormalized and symmetric normalized Laplacians have orthonormal eigenbases. With $L=U\Lambda U^\top$, the transform $\hat x=U^\top x$ changes coordinates and $x=U\hat x$ reconstructs the signal. Spectral energy is $\sum_k\lambda_k\hat x_k^2$, so a larger eigenvalue means a larger variation cost.

Switch between decomposition and filtering on the same page. Edit node values, use impulse/constant/alternating/seeded-noise presets, and compare partial and full reconstruction. Filters include heat diffusion $e^{-\tau\lambda}$, complementary high-pass $1-e^{-\tau\lambda}$, and ideal low-pass $\mathbf1_{\lambda\leq\lambda_c}$. Input/output plots use a common color scale. A cutoff by eigenvalue includes the entire eigenspace; retaining only some modes of a repeated eigenvalue instead prompts a basis-dependence warning.

Random-walk mode uses a degree-weighted inner product and dual basis, assigning isolates an inner-product weight of 1. Its coefficients cannot generally use the Euclidean orthogonal formula $\hat x=U^\top x$. Signals belong to nodes of the current drawing and survive movement, deletion of other nodes, undo, and reloads. Chapters VII–VIII do not process the large Bunny mesh.

### Chapter VIII: rewrite spectral filtering as local computation

For a symmetric Laplacian, $g(L)x=Ug(\Lambda)U^\top x$. If $g$ is a degree-$K$ polynomial,

$$
g(L)x=\sum_{r=0}^{K}\theta_rL^r x.
$$

Spectral decomposition and repeated application of $L$ then produce the same operator. Each step accesses a node and its neighbors, so the output depends only on inputs within at most $K$ hops. General spectral responses need not have finite support; arbitrary polynomial coefficients also need not be low-pass or energy reducing. Learnable coefficients, multiple channels, and nonlinearities provide further steps toward a graph neural network. This experiment stops at inspectable filter operators and local computations: it does not train a GNN or equate every message-passing model with spectral filtering. See [the original paper by Defferrard, Bresson, and Vandergheynst](https://arxiv.org/abs/1606.09375) for polynomial localized filtering.

The interaction uses the fixed unnormalized operator $(I-\alpha L_0)^K$, with 0–3 steps and $0\leq\alpha\leq1/d_{\max}$. Each step is a nonnegative weighted average of a node and its neighbors; an edgeless graph uses $\alpha=0$. The selected node's own and neighbor contributions are listed separately, and the local and spectral outputs are compared point by point. The general polynomial formula explains the extension; arbitrary coefficients are not independently editable here.

`js/variational-math.js` supplies edge energy, projection, and iteration; `js/signal-math.js` supplies signal decomposition and filtering; `js/convolution-math.js` compares spectral and local algorithms; `js/course.js` manages the Chapters V–VIII route sequence and connecting explanations.
