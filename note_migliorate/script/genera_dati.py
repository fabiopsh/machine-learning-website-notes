# /// script
# requires-python = ">=3.12"
# dependencies = ["numpy==2.5.4", "scipy==1.18.1", "scikit-learn==1.9.1", "matplotlib==3.11.2"]
# ///
# Versioni fissate: con versioni diverse alcuni numeri (ad esempio la rete senza weight decay) cambiano di poco.
"""Genera i dati numerici delle figure di note_migliorate (cartella dati/).

Ogni figura calcolata (fit polinomiali, K-NN, SVM, bias-varianza, K-means, SOM, ...)
legge da qui le sue coordinate; i numeri citati nelle didascalie finiscono in
dati/valori.tex come macro LaTeX. Tutto è deterministico (semi fissi).

Uso (dalla cartella note_migliorate/):  uv run script/genera_dati.py
"""
from __future__ import annotations

import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from scipy.spatial import Voronoi  # noqa: E402
from sklearn.neural_network import MLPClassifier  # noqa: E402
from sklearn.svm import SVC  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "dati"
OUT.mkdir(exist_ok=True)
MACRO: dict[str, str] = {}


def save(name: str, rows, header: str):
    """Scrive una tabella per pgfplots; le righe None diventano righe vuote (salto)."""
    with open(OUT / name, "w", encoding="utf-8") as f:
        f.write(header + "\n")
        for r in rows:
            if r is None:
                f.write("\n")
            else:
                f.write(" ".join(f"{v:.6g}" if isinstance(v, (float, np.floating)) else str(v) for v in r) + "\n")


def segs(segments):
    """Lista di segmenti (array Nx2) -> righe con una riga vuota tra un segmento e l'altro."""
    rows = []
    for s in segments:
        for p in s:
            rows.append((float(p[0]), float(p[1])))
        rows.append(None)
    return rows


def contour_paths(xx, yy, zz, level):
    fig = plt.figure()
    cs = plt.contour(xx, yy, zz, levels=[level])
    out = [np.asarray(s) for s in cs.allsegs[0] if len(s) > 1]
    plt.close(fig)
    return out


def num(v, d=3):
    return f"{v:.{d}f}".replace(".", "{,}")


# --------------------------------------------------------------------------- 1. fitting polinomiale
def polinomi():
    target = lambda x: np.sin(2 * np.pi * x)  # noqa: E731
    xs = np.arange(10) / 9
    ts = np.array([0.35, 0.82, 1.0, 0.97, 0.12, 0.16, -0.85, -0.45, -0.57, 0.26])
    save("poly_tr10.dat", zip(xs, ts), "x t")
    grid = np.linspace(0, 1, 301)
    save("poly_vera.dat", zip(grid, target(grid)), "x y")

    def design(x, M):
        return np.vander(x, M + 1, increasing=True)

    def fit(x, t, M, lam=0.0):
        A = design(x, M)
        # E = 1/2 sum (t - Aw)^2 + lam/2 ||w||^2  ->  (A^T A + lam I) w = A^T t
        return np.linalg.solve(A.T @ A + lam * np.eye(M + 1), A.T @ t) if lam > 0 else np.linalg.lstsq(A, t, rcond=None)[0]

    coeff = {}
    for M in (0, 1, 3, 9):
        w = fit(xs, ts, M)
        coeff[M] = w
        save(f"poly_M{M}.dat", zip(grid, design(grid, M) @ w), "x y")
    # tabelle dei coefficienti (capitolo 5): righe w_0 ... w_9, una colonna per modello
    cella = lambda w, j: f"${num(w[j], 2)}$" if j < len(w) else ""  # noqa: E731
    def tabella(nome, intest, colonne, nota):
        with open(OUT / nome, "w", encoding="utf-8") as f:
            f.write(f"% generato da script/genera_dati.py: {nota}\n")
            f.write("\\begin{tabular}{l" + "r" * len(colonne) + "}\n\\toprule\n" + intest + " \\\\\n\\midrule\n")
            for j in range(10):
                f.write(f"$w_{j}^*$ & " + " & ".join(cella(w, j) for w in colonne) + " \\\\\n")
            f.write("\\bottomrule\n\\end{tabular}\n")

    tabella("poly_coeff_M.tex", " & $M=0$ & $M=1$ & $M=3$ & $M=9$", [coeff[M] for M in (0, 1, 3, 9)],
            "coefficienti dei polinomi della figura (M = 0, 1, 3, 9)")
    reg = [coeff[9]] + [fit(xs, ts, 9, np.exp(lnl)) for lnl in (-18, 0)]
    tabella("poly_coeff_lambda.tex",
            " & $\\ln\\lambda=-\\infty$ ($\\lambda=0$) & $\\ln\\lambda=-18$ & $\\ln\\lambda=0$", reg,
            "coefficienti del polinomio di grado 9 (lambda = 0, e^-18, 1)")

    rng = np.random.default_rng(7)
    xt = rng.random(1000)
    tt = target(xt) + 0.3 * rng.standard_normal(1000)
    rms = lambda w, x, t, M: np.sqrt(np.mean((t - design(x, M) @ w) ** 2))  # noqa: E731
    rows = []
    for M in range(10):
        w = fit(xs, ts, M)
        rows.append((M, rms(w, xs, ts, M), rms(w, xt, tt, M)))
    save("poly_rms_M.dat", rows, "M train test")

    for l in (15, 100):
        r = np.random.default_rng(100 + l)
        x = np.sort(r.random(l))
        t = target(x) + 0.3 * r.standard_normal(l)
        w = fit(x, t, 9)
        save(f"poly9_l{l}_pts.dat", zip(x, t), "x t")
        save(f"poly9_l{l}.dat", zip(grid, design(grid, 9) @ w), "x y")

    for lnl in (-18, 0):
        w = fit(xs, ts, 9, np.exp(lnl))
        save(f"poly9_reg{lnl}.dat", zip(grid, design(grid, 9) @ w), "x y")
    rows = []
    for lnl in np.linspace(-38, 0, 77):
        w = fit(xs, ts, 9, np.exp(lnl))
        rows.append((lnl, rms(w, xs, ts, 9), rms(w, xt, tt, 9)))
    save("poly_rms_lambda.dat", rows, "lnl train test")


# --------------------------------------------------------------------------- 2. il problema a due classi (HTF)
MIX_VAR = 0.2
# seme scelto perché l errore di Bayes (circa 0,21) sia vicino a quello dell esempio originale
_r = np.random.default_rng(8)
CENTERS = {1: np.array([1, 0]) + _r.standard_normal((10, 2)), 0: np.array([0, 1]) + _r.standard_normal((10, 2))}


def campiona(n, seed):
    r = np.random.default_rng(seed)
    X, y = [], []
    for i in range(n):
        c = 1 if i < n // 2 else 0
        m = CENTERS[c][r.integers(10)]
        X.append(m + np.sqrt(MIX_VAR) * r.standard_normal(2))
        y.append(c)
    return np.array(X), np.array(y)


def densita(c, P):
    d = ((P[:, None, :] - CENTERS[c][None, :, :]) ** 2).sum(-1)
    return np.exp(-d / (2 * MIX_VAR)).mean(1)


def bayes(P):
    return (densita(1, P) > densita(0, P)).astype(int)


def knn_pred(Xtr, ytr, P, k):
    d = ((P[:, None, :] - Xtr[None, :, :]) ** 2).sum(-1)
    idx = np.argpartition(d, k - 1, axis=1)[:, :k] if k < len(Xtr) else np.tile(np.arange(len(Xtr)), (len(P), 1))
    return ytr[idx].mean(1)


def due_classi():
    Xtr, ytr = campiona(200, 1)
    Xts, yts = campiona(10000, 2)
    save("htf_punti.dat", [(a, b, c) for (a, b), c in zip(Xtr, ytr)], "x y c")
    for c in (0, 1):
        save(f"htf_centri{c}.dat", CENTERS[c].tolist(), "x y")
    gx, gy = np.meshgrid(np.linspace(-3, 3.8, 260), np.linspace(-2.6, 3.4, 230))
    G = np.c_[gx.ravel(), gy.ravel()]

    # modello lineare ai minimi quadrati, classi 0/1, confine x^T w = 0,5
    A = np.c_[np.ones(len(Xtr)), Xtr]
    w = np.linalg.lstsq(A, ytr, rcond=None)[0]
    xl = np.array([-3, 3.8])
    save("htf_lineare.dat", zip(xl, (0.5 - w[0] - w[1] * xl) / w[2]), "x y")
    lin = lambda X: (np.c_[np.ones(len(X)), X] @ w > 0.5).astype(int)  # noqa: E731
    MACRO["linTrain"] = num(np.mean(lin(Xtr) != ytr))
    MACRO["linTest"] = num(np.mean(lin(Xts) != yts))

    for k in (1, 15):
        z = knn_pred(Xtr, ytr, G, k).reshape(gx.shape)
        save(f"htf_knn{k}.dat", segs(contour_paths(gx, gy, z, 0.5)), "x y")
    zb = (densita(1, G) - densita(0, G)).reshape(gx.shape)
    save("htf_bayes.dat", segs(contour_paths(gx, gy, zb, 0.0)), "x y")
    MACRO["bayesErr"] = num(np.mean(bayes(Xts) != yts))

    rows = []
    for k in (1, 3, 5, 7, 9, 11, 15, 21, 31, 45, 69, 101, 151, 200):
        tr = np.mean((knn_pred(Xtr, ytr, Xtr, k) > 0.5) != ytr)
        ts = np.mean((knn_pred(Xtr, ytr, Xts, k) > 0.5) != yts)
        rows.append((k, 200 / k, tr, ts))
    save("knn_errori.dat", rows, "k dof train test")
    MACRO["knnBestK"] = str(min(rows, key=lambda r: r[3])[0])

    # SVM con kernel polinomiale (grado 4) e RBF sullo stesso problema
    for nome, svm in (("poly", SVC(kernel="poly", degree=4, coef0=1, gamma=1, C=1)), ("rbf", SVC(kernel="rbf", gamma=1, C=1))):
        svm.fit(Xtr, ytr)
        z = svm.decision_function(G).reshape(gx.shape)
        save(f"svm_{nome}_conf.dat", segs(contour_paths(gx, gy, z, 0)), "x y")
        save(f"svm_{nome}_marg.dat", segs(contour_paths(gx, gy, z, 1) + contour_paths(gx, gy, z, -1)), "x y")
        save(f"svm_{nome}_sv.dat", Xtr[svm.support_].tolist(), "x y")
        MACRO[f"svm{nome}Train"] = num(np.mean(svm.predict(Xtr) != ytr))
        MACRO[f"svm{nome}Test"] = num(np.mean(svm.predict(Xts) != yts))
        MACRO[f"svm{nome}SV"] = str(round(100 * len(svm.support_) / len(Xtr)))
    # errore di test in funzione di C per vari gamma
    rows = []
    Cs = np.logspace(-2, 3, 16)
    for C in Cs:
        row = [C]
        for g in (5, 1, 0.5, 0.1):
            s = SVC(kernel="rbf", gamma=g, C=C).fit(Xtr, ytr)
            row.append(np.mean(s.predict(Xts[:4000]) != yts[:4000]))
        rows.append(tuple(row))
    save("svm_C_gamma.dat", rows, "C g5 g1 g05 g01")

    # rete con 10 unità nascoste, senza e con weight decay
    for nome, alpha in (("senza", 1e-6), ("wd", 0.1)):
        net = MLPClassifier(hidden_layer_sizes=(10,), activation="logistic", alpha=alpha, solver="lbfgs", max_iter=5000, random_state=3)
        net.fit(Xtr, ytr)
        z = net.predict_proba(G)[:, 1].reshape(gx.shape)
        save(f"nn_{nome}.dat", segs(contour_paths(gx, gy, z, 0.5)), "x y")
        MACRO[f"nn{nome}Test"] = num(np.mean(net.predict(Xts) != yts))


# --------------------------------------------------------------------------- 3. Voronoi e 1-NN
def voronoi():
    r = np.random.default_rng(11)
    P = r.random((22, 2))
    c = (P[:, 0] + 0.35 * np.sin(6 * P[:, 1]) + 0.15 * r.standard_normal(22) > 0.55).astype(int)
    vor = Voronoi(np.r_[P, [[-5, -5], [-5, 6], [6, -5], [6, 6]]])
    tutti, confine = [], []
    for (i, j), rv in zip(vor.ridge_points, vor.ridge_vertices):
        if -1 in rv or i >= len(P) or j >= len(P):
            if -1 in rv or (i >= len(P) and j >= len(P)):
                continue
        a, b = vor.vertices[rv[0]], vor.vertices[rv[1]]
        seg = clip(a, b)
        if seg is None:
            continue
        if i < len(P) and j < len(P) and c[i] != c[j]:
            confine.append(seg)
        else:
            tutti.append(seg)
    save("vor_punti.dat", [(x, y, k) for (x, y), k in zip(P, c)], "x y c")
    save("vor_celle.dat", segs(tutti), "x y")
    save("vor_confine.dat", segs(confine), "x y")


def clip(a, b, lo=0.0, hi=1.0):
    """Ritaglia il segmento ab al quadrato [lo,hi]^2 (Liang-Barsky)."""
    t0, t1 = 0.0, 1.0
    d = b - a
    for p, q in ((-d[0], a[0] - lo), (d[0], hi - a[0]), (-d[1], a[1] - lo), (d[1], hi - a[1])):
        if p == 0:
            if q < 0:
                return None
        else:
            t = q / p
            if p < 0:
                t0 = max(t0, t)
            else:
                t1 = min(t1, t)
    if t0 > t1:
        return None
    return np.array([a + t0 * d, a + t1 * d])


# --------------------------------------------------------------------------- 4. bias-varianza
def bias_varianza():
    f = lambda x: x + 2 * np.sin(1.5 * x)  # noqa: E731
    grid = np.linspace(0, 10, 201)
    save("bv_vera.dat", zip(grid, f(grid)), "x y")
    W = []
    for s in range(50):
        r = np.random.default_rng(1500 + s)
        x = r.random(20) * 10
        y = f(x) + np.sqrt(0.2) * r.standard_normal(20)
        w = np.polyfit(x, y, 1)
        W.append(w)
        if s == 0:
            save("bv_punti.dat", zip(x, y), "x y")
    rows = []
    for w in W:
        rows += [(0.0, w[1]), (10.0, w[0] * 10 + w[1]), None]
    save("bv_rette.dat", rows, "x y")
    wm = np.mean(W, axis=0)
    save("bv_media.dat", [(0.0, wm[1]), (10.0, wm[0] * 10 + wm[1])], "x y")
    save("bv_prima.dat", [(0.0, W[0][1]), (10.0, W[0][0] * 10 + W[0][1])], "x y")

    # esempio di Bishop: 25 dataset da 25 punti, 24 gaussiane + bias, regressione ridge
    target = lambda x: np.sin(2 * np.pi * x)  # noqa: E731
    mu = np.linspace(0, 1, 24)
    phi = lambda x: np.c_[np.ones(len(x)), np.exp(-((x[:, None] - mu[None, :]) ** 2) / (2 * 0.1**2))]  # noqa: E731
    g = np.linspace(0, 1, 151)
    data = []
    for s in range(100):
        r = np.random.default_rng(900 + s)
        x = r.random(25)
        data.append((x, target(x) + 0.3 * r.standard_normal(25)))

    def fits(lnl, n):
        out = []
        for x, t in data[:n]:
            A = phi(x)
            I = np.eye(A.shape[1])
            I[0, 0] = 0  # intercetta non penalizzata
            w = np.linalg.solve(A.T @ A + np.exp(lnl) * I, A.T @ t)
            out.append(phi(g) @ w)
        return np.array(out)

    for k, lnl in enumerate((2.6, -0.31, -2.4)):
        F = fits(lnl, 25)
        rows = []
        for fi in F[:20]:
            rows += list(zip(g, fi)) + [None]
        save(f"bv_lam{k}_fit.dat", rows, "x y")
        save(f"bv_lam{k}_media.dat", zip(g, F.mean(0)), "x y")
    save("bv_sin.dat", zip(g, target(g)), "x y")
    rr = np.random.default_rng(5)
    xt = rr.random(1000)
    tt = target(xt) + 0.3 * rr.standard_normal(1000)
    rows = []
    for lnl in np.linspace(-3, 2, 41):
        F = fits(lnl, 100)
        bias2 = np.mean((F.mean(0) - target(g)) ** 2)
        var = np.mean(F.var(0))
        test = []
        for x, t in data[:100]:
            A = phi(x)
            I = np.eye(A.shape[1])
            I[0, 0] = 0
            w = np.linalg.solve(A.T @ A + np.exp(lnl) * I, A.T @ t)
            test.append(np.mean((phi(xt) @ w - tt) ** 2))
        rows.append((lnl, bias2, var, bias2 + var, np.mean(test)))
    save("bv_tradeoff.dat", rows, "lnl bias2 var somma test")


# --------------------------------------------------------------------------- 5. Perceptron contro LMS
def perceptron_lms():
    r = np.random.default_rng(4)
    A = np.r_[r.normal([1.2, 1.2], 0.35, (14, 2)), r.normal([5.5, 5.0], 0.4, (10, 2))]
    B = r.normal([0.0, -0.2], 0.35, (16, 2))
    X = np.r_[A, B]
    d = np.r_[np.ones(len(A)), -np.ones(len(B))]
    Xb = np.c_[np.ones(len(X)), X]
    w_ls = np.linalg.lstsq(Xb, d, rcond=None)[0]
    err_ls = int(np.sum(np.sign(Xb @ w_ls) != d))
    sols = []
    for seed in (0, 1):
        rs = np.random.default_rng(seed)
        w = rs.normal(0, 1, 3)
        for _ in range(1000):
            changed = False
            for i in rs.permutation(len(X)):
                if np.sign(Xb[i] @ w) != d[i]:
                    w = w + d[i] * Xb[i]
                    changed = True
            if not changed:
                break
        sols.append(w)
    save("pl_punti.dat", [(x, y, int(c)) for (x, y), c in zip(X, d)], "x y c")
    xl = np.array([-1.5, 7])
    line = lambda w: list(zip(xl, -(w[0] + w[1] * xl) / w[2]))  # noqa: E731
    save("pl_lms.dat", line(w_ls), "x y")
    for i, w in enumerate(sols):
        save(f"pl_perc{i}.dat", line(w), "x y")
    MACRO["plErrLS"] = str(err_ls)


# --------------------------------------------------------------------------- 6. SVM lineare (margine, slack)
def svm_lineare():
    r = np.random.default_rng(21)
    X = np.r_[r.normal([1.0, 1.0], 0.45, (12, 2)), r.normal([3.3, 3.0], 0.45, (12, 2))]
    y = np.r_[-np.ones(12), np.ones(12)]
    s = SVC(kernel="linear", C=1e6).fit(X, y)
    w, b = s.coef_[0], s.intercept_[0]
    save("svmh_punti.dat", [(a, c, int(k)) for (a, c), k in zip(X, y)], "x y c")
    save("svmh_sv.dat", X[s.support_].tolist(), "x y")
    MACRO["svmhW"] = f"{w[0]:.4f},{w[1]:.4f},{b:.4f}"
    with open(OUT / "svm_lineare.tex", "w", encoding="utf-8") as f:
        f.write(f"\\def\\svmwA{{{w[0]:.5f}}}\\def\\svmwB{{{w[1]:.5f}}}\\def\\svmb{{{b:.5f}}}\n")
    # soft margin: classi sovrapposte
    r = np.random.default_rng(8)
    X = np.r_[r.normal([1.2, 1.2], 0.6, (15, 2)), r.normal([3.0, 2.9], 0.6, (15, 2))]
    y = np.r_[-np.ones(15), np.ones(15)]
    s = SVC(kernel="linear", C=1.0).fit(X, y)
    w, b = s.coef_[0], s.intercept_[0]
    g = X @ w + b
    xi = np.maximum(0, 1 - y * g)
    save("svms_punti.dat", [(a, c, int(k), x) for (a, c), k, x in zip(X, y, xi)], "x y c xi")
    with open(OUT / "svm_soft.tex", "w", encoding="utf-8") as f:
        f.write(f"\\def\\svmswA{{{w[0]:.5f}}}\\def\\svmswB{{{w[1]:.5f}}}\\def\\svmsb{{{b:.5f}}}\n")


# --------------------------------------------------------------------------- 7. mappa Phi (ellisse -> piano)
def mappa_phi():
    r = np.random.default_rng(3)
    P = r.uniform(-1.6, 1.6, (170, 2))
    dentro = (P[:, 0] / 1.0) ** 2 + (P[:, 1] / 0.7) ** 2 < 0.75
    lontano = (P[:, 0] / 1.0) ** 2 + (P[:, 1] / 0.7) ** 2 > 1.1
    keep = dentro | lontano
    P, c = P[keep], dentro[keep].astype(int)
    save("phi_2d.dat", [(a, b, k) for (a, b), k in zip(P, c)], "x y c")
    Z = np.c_[P[:, 0] ** 2, np.sqrt(2) * P[:, 0] * P[:, 1], P[:, 1] ** 2]
    save("phi_3d.dat", [(a, b, z, k) for (a, b, z), k in zip(Z, c)], "z1 z2 z3 c")


# --------------------------------------------------------------------------- 8. K-means
def kmeans():
    r = np.random.default_rng(12)
    X = np.r_[r.normal([1, 1], 0.35, (25, 2)), r.normal([3, 1.4], 0.35, (25, 2)), r.normal([2, 3], 0.35, (25, 2))]
    C = np.array([[0.6, 2.6], [1.2, 2.9], [3.4, 3.2]])
    fasi = []
    assign = None
    for _ in range(2):
        assign = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), 1)
        fasi.append((C.copy(), assign.copy()))
        C = np.array([X[assign == k].mean(0) for k in range(3)])
    save("km_punti.dat", X.tolist(), "x y")
    for i, (Ck, a) in enumerate(fasi):
        save(f"km_centri{i}.dat", Ck.tolist(), "x y")
        save(f"km_ass{i}.dat", [(x, y, int(k)) for (x, y), k in zip(X, a)], "x y c")
    save("km_centri2.dat", C.tolist(), "x y")


# --------------------------------------------------------------------------- 9. SOM su dati uniformi
def som():
    r = np.random.default_rng(2)
    n = 10
    coords = np.array([(i, j) for i in range(n) for j in range(n)], dtype=float)
    W = 0.5 + 0.02 * r.standard_normal((n * n, 2))
    T = 20000
    snaps = {0, 20, 100, 1000, 5000, 20000}
    for t in range(T + 1):
        if t in snaps:
            Wg = W.reshape(n, n, 2)
            rows = []
            for i in range(n):
                rows += [tuple(p) for p in Wg[i]] + [None]
            for j in range(n):
                rows += [tuple(p) for p in Wg[:, j]] + [None]
            save(f"som_{t}.dat", rows, "x y")
        if t == T:
            break
        x = r.random(2)
        win = np.argmin(((W - x) ** 2).sum(1))
        frac = t / T
        eta = 0.5 * (0.01 / 0.5) ** frac
        sigma = 5.0 * (0.3 / 5.0) ** frac
        h = np.exp(-((coords - coords[win]) ** 2).sum(1) / (2 * sigma**2))
        W += eta * h[:, None] * (x - W)


# --------------------------------------------------------------------------- 10. grid search e random search
def ricerca():
    r = np.random.default_rng(9)
    g = (np.arange(10) + 0.5) / 10
    save("grid_griglia.dat", [(a, b) for a in g for b in g], "x y")
    save("grid_random.dat", r.random((100, 2)).tolist(), "x y")


def main():
    polinomi()
    due_classi()
    voronoi()
    bias_varianza()
    perceptron_lms()
    svm_lineare()
    mappa_phi()
    kmeans()
    som()
    ricerca()
    with open(OUT / "valori.tex", "w", encoding="utf-8") as f:
        f.write("% generato da script/genera_dati.py: non modificare a mano\n")
        for k, v in MACRO.items():
            f.write(f"\\newcommand{{\\val{k}}}{{{v}}}\n")
    print("dati scritti in", OUT)
    for k, v in MACRO.items():
        print(f"  {k} = {v}")


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent.parent)
    main()
