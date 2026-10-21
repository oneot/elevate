#!/usr/bin/env python3
"""Render the v3 stage's fluid forms per app: a folded sheet, a twisted ribbon, a sphere and bubbles.

  python3 make_fluid.py                    -> assets/fluid/<app>/<shape>.webp for every app
  python3 make_fluid.py excel word         -> only these apps
  python3 make_fluid.py --shapes fold,ribbon -> only these shapes
  python3 make_fluid.py --sheet            -> also review/_fluid.png (contact sheet on the stage colours)

The look follows the 2025 Microsoft 365 icon refresh ("Fluid forms, vibrant colors"): soft folds and
curves instead of hard solids, rich analogous gradients, soft studio light with gentle shadows.
Geometry is sphere-traced once per shape with numpy (orthographic camera, supersampled) and cached as a
G-buffer in .cache/fluid; every app is then shaded with its own palette, so all apps share the same forms.
Modelled on make_glass.py of the original thumbnail concept kit (assets/glass).
"""
import argparse
import hashlib
import json
import inspect
import pathlib
import time

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "assets" / "fluid"
CACHE = ROOT / ".cache" / "fluid"

# Analogous ramps per app, light -> deep (Copilot and M365 use the multi-colour Copilot palette).
# kit.js uses the same file for the stage colours (--f1..--f4), so the forms and the stage always match.
PAL = json.loads((OUT / "palette.json").read_text())

LOOK = {"lift": 0.3, "deep": 0.86, "box": 0.4, "rim": 0.4, "spec": 0.5}


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64) / 255.0


def ramp(stops, t):
    """Smooth, non-cyclic colour ramp, t in [0, 1]."""
    cols = np.stack([hexrgb(h) for h in stops])
    n = len(cols)
    t = np.clip(t, 0.0, 1.0) * (n - 1)
    i0 = np.minimum(np.floor(t).astype(int), n - 2)
    f = t - i0
    f = f * f * (3 - 2 * f)
    return cols[i0] * (1 - f)[:, None] + cols[i0 + 1] * f[:, None]


def norm(v):
    v = np.asarray(v, dtype=np.float64)
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def rot(ax, ay, az):
    ax, ay, az = np.radians([ax, ay, az])
    rx = np.array([[1, 0, 0], [0, np.cos(ax), -np.sin(ax)], [0, np.sin(ax), np.cos(ax)]])
    ry = np.array([[np.cos(ay), 0, np.sin(ay)], [0, 1, 0], [-np.sin(ay), 0, np.cos(ay)]])
    rz = np.array([[np.cos(az), -np.sin(az), 0], [np.sin(az), np.cos(az), 0], [0, 0, 1]])
    return rz @ ry @ rx


def sheet(a2, inplane, th, rr):
    """A thin sheet: a2 = signed distance to the mid-surface, inplane = 2D distance inside the sheet outline."""
    a = np.abs(a2) - (th - rr)
    b = inplane + rr
    return np.minimum(np.maximum(a, b), 0) + np.hypot(np.maximum(a, 0), np.maximum(b, 0)) - rr


def round_rect(x, z, hx, hz, r):
    qx, qz = np.abs(x) - (hx - r), np.abs(z) - (hz - r)
    return np.minimum(np.maximum(qx, qz), 0) + np.hypot(np.maximum(qx, 0), np.maximum(qz, 0)) - r


def seg_dist(x, y, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = np.clip(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(x - ax - t * dx, y - ay - t * dy), t


class Fold:
    """A wide sheet folding over itself (the refreshed Word/Excel icon gesture).

    Mid-curve in the xy-plane: a straight run, an arc of radius R sweeping `sweep` degrees, and a second run
    leaving along the arc's tangent. The sheet is W wide along z; the ramp runs along the curve and a little
    across the width, so every face carries a diagonal gradient.
    """
    R, L0, L1, sweep, W, th = 0.5, 1.3, 1.0, 170.0, 1.5, 0.07
    size, ext, rotation = (640, 640), 1.62, rot(55, 15, 25)

    def __init__(self):
        self.sw = np.radians(self.sweep)
        a1 = -np.pi / 2 + self.sw
        self.ex, self.ey = self.R * np.cos(a1), self.R + self.R * np.sin(a1)
        self.tx, self.ty = -np.sin(a1), np.cos(a1)
        self.fx, self.fy = self.ex + self.L1 * self.tx, self.ey + self.L1 * self.ty

    def parts(self, p):
        x, y = p[:, 0], p[:, 1]
        d0, t0 = seg_dist(x, y, -self.L0, 0.0, 0.0, 0.0)
        d1, t1 = seg_dist(x, y, self.ex, self.ey, self.fx, self.fy)
        phi = np.mod(np.arctan2(y - self.R, x) + np.pi / 2, 2 * np.pi)
        r = np.hypot(x, y - self.R)
        da = np.where(phi <= self.sw, np.abs(r - self.R), np.inf)
        return d0, t0, d1, t1, da, phi, r

    def sdf(self, p):
        d0, _, d1, _, da, _, _ = self.parts(p)
        return sheet(np.minimum(np.minimum(d0, d1), da), np.abs(p[:, 2]) - self.W / 2, self.th, 0.03)

    def attrs(self, p):
        d0, t0, d1, t1, da, phi, r = self.parts(p)
        x, y = p[:, 0], p[:, 1]
        part = np.argmin(np.stack([d0, da, d1]), axis=0)
        total = self.L0 + self.sw * self.R + self.L1
        along = np.where(part == 0, t0 * self.L0, np.where(part == 1, self.L0 + phi * self.R, self.L0 + self.sw * self.R + t1 * self.L1))
        across = np.clip(p[:, 2] / self.W + 0.5, 0, 1)
        side = self.tx * (y - self.ey) - self.ty * (x - self.ex)
        inner = np.where(part == 0, y > 0, np.where(part == 1, r < self.R, side > 0))
        return 0.72 * along / total + 0.28 * across, inner


class Ribbon:
    """A silky ribbon with a soft S and a full twist, so both faces show (the Copilot ribbon gesture)."""
    L, A, k, phase, twist, th, W = 1.6, 0.22, 2.0, 0.5, 1.6, 0.06, 0.9
    size, ext, rotation = (800, 600), 1.78, rot(40, -10, 20)

    def warp(self, p):
        x, y, z = p[:, 0], p[:, 1], p[:, 2]
        ang = self.twist * x
        c, s = np.cos(ang), np.sin(ang)
        return x, c * y - s * z, s * y + c * z

    def sdf(self, p):
        x, y, z = self.warp(p)
        f = self.A * np.sin(self.k * x + self.phase)
        fp = self.A * self.k * np.cos(self.k * x + self.phase)
        mid = (y - f) / np.sqrt(1 + fp * fp)
        inplane = round_rect(x, z, self.L, self.W / 2, self.W / 2 * 0.96)
        return sheet(mid, inplane, self.th, 0.03) * 0.55

    def attrs(self, p):
        x, y, z = self.warp(p)
        across = np.clip(z / self.W + 0.5, 0, 1)
        inner = y < self.A * np.sin(self.k * x + self.phase)
        return 0.75 * (x + self.L) / (2 * self.L) + 0.25 * across, inner


class Sphere:
    """A glossy sphere with part of the ramp running across it."""
    size, ext, rotation = (520, 520), 1.06, rot(0, 0, 0)
    axis = norm([-0.62, 0.66, 0.42])

    def sdf(self, p):
        return np.linalg.norm(p, axis=-1) - 1.0

    def attrs(self, p):
        n = p / np.linalg.norm(p, axis=-1, keepdims=True)
        return 0.42 - 0.36 * (n @ self.axis), np.zeros(len(p), bool)


class Bubbles:
    """Three spheres floating together (the refreshed Teams card gesture)."""
    size, ext, rotation = (640, 640), 1.32, rot(0, 0, 0)
    balls = [((-0.32, 0.12, 0.0), 0.78, 0.12), ((0.74, 0.62, -0.4), 0.38, 0.0), ((0.62, -0.72, 0.5), 0.3, 0.4)]
    axis = norm([-0.62, 0.66, 0.42])

    def sdf(self, p):
        return np.min([np.linalg.norm(p - np.asarray(c), axis=-1) - r for c, r, _ in self.balls], axis=0)

    def attrs(self, p):
        d = np.stack([np.linalg.norm(p - np.asarray(c), axis=-1) - r for c, r, _ in self.balls])
        which = np.argmin(d, axis=0)
        s = np.zeros(len(p))
        for i, (c, r, shift) in enumerate(self.balls):
            m = which == i
            n = (p[m] - np.asarray(c)) / r
            s[m] = 0.36 - 0.3 * (n @ self.axis) + shift
        return np.clip(s, 0, 1), np.zeros(len(p), bool)


SHAPES = {"fold": Fold(), "ribbon": Ribbon(), "sphere": Sphere(), "bubbles": Bubbles()}


def trace(shape, size, ss):
    """Sphere-trace a shape. Returns the G-buffer (hit pixels, normals, AO, soft shadow, ramp position, inner face)."""
    w, h = size
    nw, nh = w * ss, h * ss
    xs = ((np.arange(nw) + 0.5) / nw * 2 - 1) * shape.ext
    ys = ((np.arange(nh) + 0.5) / nh * 2 - 1) * shape.ext * nh / nw
    X, Y = np.meshgrid(xs, -ys)
    count = nw * nh
    ro = np.stack([X.ravel(), Y.ravel(), np.full(count, 4.0)], -1)
    rd = np.array([0.0, 0.0, -1.0])
    R = shape.rotation

    def f(p):
        return shape.sdf(p @ R)

    t = np.zeros(count)
    hit = np.zeros(count, bool)
    active = np.ones(count, bool)
    for _ in range(260):
        idx = np.nonzero(active)[0]
        if idx.size == 0:
            break
        d = f(ro[idx] + t[idx, None] * rd)
        t[idx] += d
        done = d < 2e-4
        hit[idx[done]] = True
        active[idx[done | (t[idx] > 8.0)]] = False

    idx = np.nonzero(hit)[0]
    p = ro[idx] + t[idx, None] * rd
    e = 8e-4
    n = np.stack([f(p + [e, 0, 0]) - f(p - [e, 0, 0]),
                  f(p + [0, e, 0]) - f(p - [0, e, 0]),
                  f(p + [0, 0, e]) - f(p - [0, 0, e])], -1)
    n = norm(n)
    # Faces seen from behind (thin sheets): flip so lighting treats the visible side.
    n = np.where((n @ -rd)[:, None] < 0, -n, n)

    ao = np.ones(len(idx))
    for i, step in enumerate((0.03, 0.07, 0.13, 0.22, 0.34)):
        ao -= np.clip(step - f(p + n * step), 0, None) * (1.25 / (i + 1))
    ao = np.clip(ao, 0.3, 1.0)

    # Soft shadow toward the key light (folds shade the sheet under them).
    light = norm([-0.5, 0.8, 0.55])
    shadow = np.ones(len(idx))
    ts = np.full(len(idx), 0.04)
    live = np.ones(len(idx), bool)
    for _ in range(90):
        j = np.nonzero(live)[0]
        if j.size == 0:
            break
        d = f(p[j] + n[j] * 0.006 + light * ts[j, None])
        shadow[j] = np.minimum(shadow[j], np.clip(9.0 * d / ts[j], 0, 1))
        ts[j] += np.clip(d, 0.012, 0.25)
        live[j[(d < 1e-4) | (ts[j] > 3.5)]] = False
    shadow = smoothstep(0.0, 1.0, shadow)

    po = p @ R
    s, inner = shape.attrs(po)
    return {"nw": nw, "nh": nh, "ss": ss, "idx": idx, "n": n.astype(np.float32), "ao": ao.astype(np.float32),
            "shadow": shadow.astype(np.float32), "s": np.asarray(s, np.float32), "inner": np.asarray(inner, bool)}


def gbuffer(name, size, ss, rebuild=False):
    CACHE.mkdir(parents=True, exist_ok=True)
    # The cache key includes the shape's source, so editing a shape traces it again.
    digest = hashlib.sha1(inspect.getsource(type(SHAPES[name])).encode() + inspect.getsource(trace).encode()).hexdigest()[:10]
    file = CACHE / f"{name}-{size[0]}x{size[1]}x{ss}-{digest}.npz"
    if file.exists() and not rebuild:
        data = np.load(file)
        return {k: (data[k].item() if data[k].shape == () else data[k]) for k in data.files}
    started = time.time()
    gb = trace(SHAPES[name], size, ss)
    np.savez_compressed(file, **gb)
    print(f"  traced {name} {size[0]}x{size[1]} ss{ss} in {time.time() - started:.0f}s")
    return gb


def shade(gb, stops, look=LOOK):
    n = gb["n"].astype(np.float64)
    s = gb["s"].astype(np.float64)
    inner = gb["inner"]
    ao = gb["ao"].astype(np.float64)
    sh = gb["shadow"].astype(np.float64)
    v = np.array([0.0, 0.0, 1.0])
    ndv = np.clip(n @ v, 0, 1)
    fres = (1 - ndv) ** 3

    # Inner faces of a fold run further along the ramp (richer), like the back of the refreshed icons' sheets.
    s_face = np.where(inner, np.clip(s + 0.14, 0, 1), s)
    base = ramp(stops, s_face)
    light = norm([-0.5, 0.8, 0.55])
    wrap = np.clip((n @ light + 0.42) / 1.42, 0, 1) ** 1.15
    wrap = wrap * (0.38 + 0.62 * sh)
    # Lit side: lighter and toward the previous analogous colour. Shade side: further along the ramp and deepened
    # by a gamma curve, which keeps it saturated instead of greying it (no olive yellows, no muddy reds).
    lit = base * (1 - look["lift"]) + ramp(stops, np.clip(s_face - 0.2, 0, 1)) * (look["lift"] * 0.6) + look["lift"] * 0.4
    deep = ramp(stops, np.clip(s_face + 0.28, 0, 1)) ** 1.55 * look["deep"]
    col = deep + (lit - deep) * wrap[:, None]

    # Studio reflections: bright sky above, a soft box upper-left, a coloured floor bounce.
    r = 2 * ndv[:, None] * n - v
    sky = smoothstep(0.35, 0.95, r[:, 1])
    env = lit * (1 - sky[:, None]) + sky[:, None]
    col = col * (1 - look["rim"] * fres[:, None]) + env * (look["rim"] * fres[:, None])
    box = np.clip(1 - (((r[:, 0] + 0.42) / 0.34) ** 2 + ((r[:, 1] - 0.5) / 0.26) ** 2), 0, 1) ** 1.5
    col = col + (box * look["box"] * (0.4 + 0.6 * sh))[:, None]
    bounce = smoothstep(0.15, -0.9, n[:, 1])
    col = col + ramp(stops, np.clip(s_face - 0.35, 0, 1)) * (0.16 * bounce)[:, None]

    half = norm(light + v)
    nh = np.clip(n @ half, 0, 1)
    spec = (nh ** 140 * 0.8 + nh ** 14 * 0.12) * look["spec"] * (0.25 + 0.75 * sh)
    col = col * ao[:, None] + spec[:, None]
    return np.clip(col, 0, 1)


def compose(gb, rgb):
    nw, nh, ss = int(gb["nw"]), int(gb["nh"]), int(gb["ss"])
    img = np.zeros((nw * nh, 4), np.float64)
    img[gb["idx"], :3] = rgb
    img[gb["idx"], 3] = 1.0
    img = img.reshape(nh, nw, 4)
    pm = img.copy()
    pm[..., :3] *= pm[..., 3:4]
    pm = pm.reshape(nh // ss, ss, nw // ss, ss, 4).mean(axis=(1, 3))
    a = pm[..., 3:4]
    out = np.concatenate([np.where(a > 0, pm[..., :3] / np.maximum(a, 1e-6), 0), a], -1)
    im = Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA")
    # Crop to the form with a small margin so the kit's width (w) means the width of the form itself.
    left, top, right, bottom = im.getchannel("A").point(lambda v: 255 if v > 3 else 0).getbbox()
    pad = round(max(right - left, bottom - top) * 0.02)
    return im.crop((max(left - pad, 0), max(top - pad, 0), min(right + pad, im.width), min(bottom + pad, im.height)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("apps", nargs="*")
    ap.add_argument("--shapes", default=",".join(SHAPES))
    ap.add_argument("--ss", type=int, default=3)
    ap.add_argument("--scale", type=float, default=1.0, help="draft size, e.g. 0.5")
    ap.add_argument("--quality", type=int, default=90)
    ap.add_argument("--out", default=str(OUT))
    ap.add_argument("--rebuild", action="store_true", help="trace the geometry again")
    ap.add_argument("--sheet", action="store_true")
    args = ap.parse_args()
    apps = args.apps or list(PAL)
    shapes = args.shapes.split(",")
    out = pathlib.Path(args.out)
    rows = []
    for name in shapes:
        size = tuple(int(round(v * args.scale)) for v in SHAPES[name].size)
        gb = gbuffer(name, size, args.ss, args.rebuild)
        row = []
        for app in apps:
            im = compose(gb, shade(gb, PAL[app]))
            (out / app).mkdir(parents=True, exist_ok=True)
            im.save(out / app / f"{name}.webp", "WEBP", quality=args.quality, method=6)
            row.append(im)
        rows.append(row)
        print(name, "→", ", ".join(apps))
    if args.sheet:
        cell = 180
        sheet = Image.new("RGBA", (cell * len(apps), cell * len(shapes)), (246, 246, 248, 255))
        for y, row in enumerate(rows):
            for x, im in enumerate(row):
                im = im.copy()
                im.thumbnail((cell - 8, cell - 8), Image.LANCZOS)
                sheet.alpha_composite(im, (x * cell + (cell - im.width) // 2, y * cell + (cell - im.height) // 2))
        (ROOT / "review").mkdir(exist_ok=True)
        sheet.convert("RGB").save(ROOT / "review" / "_fluid.png")
        print(ROOT / "review" / "_fluid.png")


if __name__ == "__main__":
    main()
