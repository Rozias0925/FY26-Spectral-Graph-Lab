# Spectral Graph Lab

## At a glance for reviewers

**Project type:** original interactive mathematical software, not a trained-GNN benchmark. **What it demonstrates:** graph Laplacians, eigendecomposition, spectral clustering, variational energy, Fourier filtering, and their link to local graph operations. **Suggested first visit:** [open the lab](https://rozias0925.github.io/FY26-Spectral-Graph-Lab/), switch to **EN**, select **Chapter III / Spectral Clustering**, and compare original-space K-Means with a spectral partition on the two-moons example. **Inspect the implementation:** [mathematical core](js/math.js) and [tests](tests/). Numerical limits and normalization conventions are documented below and in the detailed guides.


An interactive laboratory connecting graph structure to spectral representations: edit a weighted graph, inspect its Laplacian and eigenvectors, and explore clustering, smoothness, signal filtering, and local graph operations. The aim is to make the relationship between linear algebra and graph-based computation directly inspectable. The complete browser implementation, numerical routines, and tests are included in this repository.

[Open the interactive lab](https://rozias0925.github.io/FY26-Spectral-Graph-Lab/) · [Detailed technical guide](README.en.md) · [繁體中文技術說明](README.zh-TW.md)

## Learning pathway

The bilingual lab progresses from an editable graph to the connection between spectral filters and local neighborhood operations.

| Modules | Focus |
| --- | --- |
| Prologue–II | Graph construction, adjacency and Laplacian matrices, connectivity, and the Fiedler vector. |
| III–IV | Spectral clustering on geometric datasets and eigenmodes on graphs and meshes. |
| V–VI | Dirichlet energy and the constrained minimization behind smooth eigenvectors. |
| VII–VIII | Graph Fourier decomposition, filtering, and the equivalence between selected polynomial filters and local computations. |

Graph edits and shared parameters carry across the linked modules. Experiments expose numerical values, matrix entries, energy contributions, and residuals so that the visual interpretation can be checked against the calculations.

## Mathematical and computational focus

The numerical core implements weighted graph Laplacians, symmetric eigendecomposition, spectral embeddings, and clustering. Later modules connect the unnormalized graph energy

$$
E(f)=f^\top L_0f=\sum_{\{i,j\}\in E}w_{ij}(f_i-f_j)^2
$$

to variational constraints, graph-frequency coordinates, and filtering. Each undirected edge is counted once in the displayed sum.

The detailed guides document normalization conventions, isolated vertices, repeated eigenvalues, numerical tolerances, and the differences between Euclidean and degree-weighted coordinates.

## Run and inspect

This is a static HTML/CSS/JavaScript application. No package installation, build step, API key, or backend is needed.

Open `index.html`, or run:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000/`. Bundled mathematical fonts and scripts support offline use.

With Node.js installed, run the test suite:

```bash
node --test tests/*.test.cjs
```

Key source locations are [js/math.js](js/math.js), [js/variational-math.js](js/variational-math.js), [js/signal-math.js](js/signal-math.js), and [js/convolution-math.js](js/convolution-math.js). The [tests/](tests/) cover numerical identities, solver behavior, filtering equivalence, shared state, and bilingual content.

## Boundaries

The lab is designed for small, inspectable problems rather than large-scale graph processing. Mesh examples use unit-weight graph Laplacians, not a cotangent Laplace–Beltrami discretization. Clustering depends on graph construction and parameters. The graph-convolution module demonstrates operators and neighborhood computations; it does **not** train a GNN.

## Attribution and permissions

Original code, interface, and teaching material are **Copyright © 2026 文君豪. All Rights Reserved.** Public source access does not grant an open-source license; see [LICENSE](LICENSE).

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [mesh attribution](assets/mesh/SOURCE.md) for KaTeX and Stanford Bunny terms. Citation metadata is provided in [CITATION.cff](CITATION.cff).
