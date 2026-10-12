#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build HD execution-style videos for the Data Science Digital Library.

For every experiment section it runs the exact code from assets/js/data.js,
captures stdout plus every matplotlib figure, then renders a 1920x1080
"code + run + output" video (minimum 15 s) and encodes it with ffmpeg.
Experiment previews are built the same way from the same captured output.

    python tools/make_videos.py                    # everything
    python tools/make_videos.py exp3-b exp5-a      # selected sections
    python tools/make_videos.py --previews         # only previews
    python tools/make_videos.py --exec-only        # run the code, no render
"""

from __future__ import annotations

import argparse
import ast
import builtins
import io
import json
import keyword
import math
import os
import re
import shutil
import subprocess
import sys
import time
import tokenize
import traceback

from PIL import Image, ImageDraw, ImageFont

try:
    import imageio_ffmpeg
except ImportError:  # pragma: no cover
    imageio_ffmpeg = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "assets", "js", "data.js")
VIDEO_DIR = os.path.join(ROOT, "assets", "video")
DATA_DIR = os.path.join(ROOT, "assets", "data")
BUILD = os.path.join(ROOT, "tools", "_build")
BACKUP_DIR = os.path.join(VIDEO_DIR, "_original_samples")

W, H = 1920, 1080
FPS = 30
CRF = 20
MIN_SECONDS = 15.0

HDR_H = 92
FTR_H = 46
TAB_H = 46
CODE_X1 = 1180
BODY_Y0 = HDR_H + TAB_H
BODY_Y1 = H - FTR_H
BODY_H = BODY_Y1 - BODY_Y0

GUTTER_W = 64
CODE_TEXT_X = GUTTER_W + 24
CODE_TEXT_W = CODE_X1 - CODE_TEXT_X - 28
CODE_LH = 30
CODE_ROWS = BODY_H // CODE_LH

TERM_TEXT_X = CODE_X1 + 22
TERM_TEXT_W = W - TERM_TEXT_X - 26
TERM_LH = 27
TERM_ROWS = BODY_H // TERM_LH

FONT_DIR = "C:\\Windows\\Fonts"
FONTS = {}


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    key = (name, size)
    if key not in FONTS:
        FONTS[key] = ImageFont.truetype(os.path.join(FONT_DIR, name), size)
    return FONTS[key]


MONO = "consola.ttf"
MONO_B = "consolab.ttf"
UI = "segoeui.ttf"
UI_B = "segoeuib.ttf"

BG = "#070a14"
HDR_BG = "#0e1533"
HDR_BG2 = "#141d45"
GOLD = "#e8b73a"
CODE_BG = "#0f1326"
GUTTER_BG = "#0b0e1d"
TAB_BG = "#0a0d1c"
TAB_FG = "#8fa2d4"
TERM_BG = "#070a16"
LINE_BG = "#161b33"
BORDER = "#1c2447"

COL_TEXT = "#d7def0"
COL_NUM = "#f78c6c"
COL_STR = "#8fd98f"
COL_KW = "#ff9e64"
COL_BI = "#7aa2f7"
COL_CMT = "#5d6a90"
COL_OP = "#9dd0ff"
COL_DIM = "#4a557a"
COL_OUT = "#c7f0c7"
COL_ERR = "#ff7b7b"
COL_OK = "#7ee787"

BUILTIN_NAMES = set(dir(builtins)) | {
    "pd", "np", "plt", "sns", "display", "open", "print", "range", "len",
    "round", "str", "int", "float", "list", "dict", "set", "tuple", "type",
}

# --------------------------------------------------------------------------
# data
# --------------------------------------------------------------------------


def load_lab() -> dict:
    text = open(DATA_JS, encoding="utf-8").read()
    m = re.search(r"var\s+LAB\s*=\s*", text)
    if not m:
        raise SystemExit("could not find `var LAB =` in data.js")
    text = text[m.end():]
    text = re.sub(r";\s*$", "", text.strip())
    return json.loads(text)


def ensure_dataset() -> str:
    """The experiment-1A code reads this file; create it when missing."""
    path = os.path.join(DATA_DIR, "car_dataset_40x20.csv")
    if os.path.exists(path):
        return path
    import csv
    import random

    random.seed(7)
    makers = ["Maruti", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra", "Ford"]
    fuels = ["Petrol", "Diesel", "CNG"]
    trans = ["Manual", "Automatic"]
    headers = [
        "Car_Name", "Year", "Selling_Price", "Present_Price", "Kms_Driven",
        "Fuel_Type", "Seller_Type", "Transmission", "Owner", "Make",
        "Mileage", "Engine", "BHP", "Seats", "Color", "Insurance_Year",
        "Service_Record", "RTO", "Condition", "Resale_Value",
    ]
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        wr = csv.writer(fh)
        wr.writerow(headers)
        for i in range(40):
            price = round(random.uniform(1.2, 24.5), 2)
            wr.writerow([
                "%s %s" % (random.choice(makers), random.choice(["Swift", "i20", "City", "Innova", "Nexon", "Thar", "Ecosport"])),
                random.randint(2012, 2023),
                price,
                round(price * random.uniform(1.1, 1.7), 2),
                random.randint(8000, 96000),
                random.choice(fuels),
                random.choice(["Dealer", "Individual"]),
                random.choice(trans),
                random.randint(0, 2),
                random.choice(makers),
                round(random.uniform(12.5, 24.8), 1),
                random.randint(796, 2143),
                round(random.uniform(68, 168), 1),
                random.choice([4, 5, 5, 7]),
                random.choice(["White", "Silver", "Grey", "Red", "Black", "Blue"]),
                random.randint(2018, 2026),
                random.choice(["Full", "Partial", "Expired"]),
                random.choice(["AP", "TS", "KA", "TN"]),
                random.choice(["Excellent", "Good", "Fair"]),
                round(price * random.uniform(0.4, 0.8), 2),
            ])
    return path


# --------------------------------------------------------------------------
# execution
# --------------------------------------------------------------------------

_RUN = {"buf": None, "events": None, "figdir": None, "figs": []}


def _flush():
    buf = _RUN["buf"]
    if buf and buf[-1]:
        _RUN["events"].append(("out", "".join(buf)))
        buf[-1] = ""


def _write(text: str) -> int:
    if _RUN["buf"] is not None and text:
        _RUN["buf"][-1] += text
    return len(text)


class _Tee(io.TextIOBase):
    """sys.stdout/stderr stand-in so print() lands in the same event stream."""

    encoding = "utf-8"

    @property
    def buffer(self):
        return None

    def writable(self):
        return True

    def isatty(self):
        return False

    def write(self, s):
        if isinstance(s, bytes):
            s = s.decode("utf-8", "replace")
        return _write(s)

    def flush(self):
        pass


def _show_hook(*_a, **_k):
    import matplotlib.pyplot as plt

    for num in list(plt.get_fignums()):
        fig = plt.figure(num)
        path = os.path.join(_RUN["figdir"], "fig%d.png" % (len(_RUN["figs"]) + 1))
        try:
            fig.savefig(path, dpi=100, facecolor="white")
        except Exception:
            plt.close(fig)
            continue
        _flush()
        _RUN["events"].append(("fig", path))
        _RUN["figs"].append(path)
        plt.close(fig)
    plt.close("all")


def _install_hooks():
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.show = _show_hook


class _ExprDisplay(ast.NodeTransformer):
    """Turn bare expressions into print(repr(x)) the way a notebook does."""

    def visit_Expr(self, node):  # noqa: N802
        self.generic_visit(node)
        value = node.value
        if isinstance(value, ast.Constant):
            return None
        target = ast.Name(id="__disp_r", ctx=ast.Store())
        assign = ast.Assign(targets=[target], value=value)
        call = ast.Expr(
            value=ast.Call(
                func=ast.Name(id="__show", ctx=ast.Load()),
                args=[ast.Name(id="__disp_r", ctx=ast.Load())],
                keywords=[],
            )
        )
        guard = ast.If(
            test=ast.Compare(
                left=ast.Name(id="__disp_r", ctx=ast.Load()),
                ops=[ast.IsNot()],
                comparators=[ast.Constant(value=None)],
            ),
            body=[call],
            orelse=[],
        )
        return [assign, guard]


def _make_show():
    import pandas as pd

    def show(value):
        if value is None:
            return
        text = repr(value)
        if re.search(r"object at 0x[0-9a-f]+>", text):
            return
        _write(text.rstrip() + "\n")

    show._pd = pd
    return show


def execute_section(code: str, key: str, inputs: list[str]) -> dict:
    """Run one section's code, return ordered ('out'|'fig') events."""
    work = os.path.join(BUILD, "work", key)
    figdir = os.path.join(BUILD, "figs", key)
    for d in (work, figdir):
        shutil.rmtree(d, ignore_errors=True)
        os.makedirs(d, exist_ok=True)
    for src in inputs:
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(work, os.path.basename(src)))

    events, figs = [], []
    buf = [""]
    _RUN.update(buf=buf, events=events, figdir=figdir, figs=figs)

    src = code if code.endswith("\n") else code + "\n"
    try:
        tree = ast.parse(src)
        tree = _ExprDisplay().visit(tree)
        ast.fix_missing_locations(tree)
        compiled = compile(tree, "exp.py", "exec")
    except SyntaxError:
        events.append(("out", traceback.format_exc()))
        return {"events": events, "exit": 2, "figs": [], "cwd": work}

    ns = {
        "__name__": "__main__",
        "__builtins__": __builtins__,
        "__show": _make_show(),
        "__file__": "exp.py",
    }

    err_cap = io.StringIO()
    old_out, old_err, old_cwd = sys.stdout, sys.stderr, os.getcwd()
    sys.stdout, sys.stderr = _Tee(), err_cap
    os.chdir(work)
    code_state = 0
    try:
        exec(compiled, ns)
    except SystemExit:
        pass
    except BaseException:
        _flush()
        events.append(("out", traceback.format_exc()))
        code_state = 1
    finally:
        os.chdir(old_cwd)
        sys.stdout, sys.stderr = old_out, old_err

    _flush()
    err = "\n".join(
        ln for ln in err_cap.getvalue().splitlines()
        if "Warning" not in ln and "warnings.warn" not in ln and ln.strip()
    )
    if err.strip():
        events.append(("out", err.strip() + "\n"))

    _RUN["buf"], _RUN["events"], _RUN["figdir"] = None, None, None
    return {"events": events, "exit": code_state, "figs": figs, "cwd": work}


# --------------------------------------------------------------------------
# text helpers
# --------------------------------------------------------------------------


def highlight(code: str):
    """-> list of lines, each a list of (text, colour) segments."""
    lines = code.split("\n")
    colours = [[None] * len(line) for line in lines]
    try:
        toks = list(tokenize.generate_tokens(io.StringIO(code).readline))
    except (tokenize.TokenError, IndentationError):
        toks = []

    skip = {tokenize.NEWLINE, tokenize.NL, tokenize.INDENT,
            tokenize.DEDENT, tokenize.ENDMARKER, tokenize.ENCODING}
    for t in toks:
        if t.type in skip or not t.string:
            continue
        colour = None
        if t.type == tokenize.COMMENT:
            colour = COL_CMT
        elif t.type == tokenize.STRING:
            colour = COL_STR
        elif t.type == tokenize.NUMBER:
            colour = COL_NUM
        elif t.type == tokenize.NAME:
            if keyword.iskeyword(t.string):
                colour = COL_KW
            elif t.string in BUILTIN_NAMES:
                colour = COL_BI
        elif t.type == tokenize.OP:
            colour = COL_OP
        if colour is None:
            continue
        (sr, sc), (er, ec) = t.start, t.end
        if sr == er and sc == ec:
            continue
        for row in range(sr, er + 1):
            r = row - 1
            if r >= len(colours):
                break
            a = sc if row == sr else 0
            b = ec if row == er else len(colours[r])
            for i in range(a, min(b, len(colours[r]))):
                colours[r][i] = colour

    styled = []
    for li, line in enumerate(lines):
        segs, i = [], 0
        while i < len(line):
            c = colours[li][i]
            j = i
            while j < len(line) and colours[li][j] == c:
                j += 1
            segs.append((line[i:j], c or COL_TEXT))
            i = j
        if not segs:
            segs = [("", COL_TEXT)]
        styled.append(segs)
    return styled


def wrap_segments(segs, fnt, max_px: int):
    """Soft-wrap styled segments to a pixel width -> list of display lines."""
    out, cur, cur_px = [], [], 0.0
    adv = fnt.getlength("0")
    for text, colour in segs:
        i = 0
        while i < len(text):
            room = int((max_px - cur_px) // adv)
            if room <= 0:
                out.append(cur)
                cur, cur_px = [], 0.0
                room = int(max_px // adv)
            take = min(room, len(text) - i)
            if take <= 0:
                take = 1
            cur.append((text[i:i + take], colour))
            cur_px += fnt.getlength(text[i:i + take])
            i += take
    out.append(cur)
    return out


def soft_wrap(text: str, fnt, max_px: int):
    adv = fnt.getlength("0")
    width = max(4, int(max_px // adv))
    lines = []
    for raw in text.split("\n"):
        if not raw:
            lines.append("")
        else:
            for i in range(0, len(raw), width):
                lines.append(raw[i:i + width])
    return lines


def wrap_words(text: str, fnt, max_px: int):
    words, lines, cur = text.split(), [], ""
    for w in words:
        cand = (cur + " " + w).strip()
        if fnt.getlength(cand) <= max_px:
            cur = cand
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit_font(text: str, path_size, max_px: int, start: int, minimum: int = 14):
    name, size = path_size
    while size > minimum and font(name, size).getlength(text) > max_px:
        size -= 2
    return font(name, size)


# --------------------------------------------------------------------------
# drawing: chrome
# --------------------------------------------------------------------------


def new_base() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    # header
    for y in range(HDR_H):
        k = y / max(1, HDR_H - 1)
        c = _lerp(HDR_BG, HDR_BG2, k)
        d.line([(0, y), (W, y)], fill=c)
    d.rectangle([0, HDR_H - 3, W, HDR_H], fill=GOLD)
    d.rectangle([0, HDR_H, CODE_X1, H - FTR_H], fill=CODE_BG)
    d.rectangle([CODE_X1, HDR_H, W, H - FTR_H], fill=TERM_BG)
    d.line([(CODE_X1, HDR_H), (CODE_X1, H - FTR_H)], fill=BORDER, width=2)
    # footer
    d.rectangle([0, H - FTR_H, W, H], fill="#0b1128")
    d.line([(0, H - FTR_H), (W, H - FTR_H)], fill=BORDER, width=1)
    return img


def _lerp(a: str, b: str, k: float) -> tuple:
    ar, ag, ab = int(a[1:3], 16), int(a[3:5], 16), int(a[5:7], 16)
    br, bg, bb = int(b[1:3], 16), int(b[3:5], 16), int(b[5:7], 16)
    return (int(ar + (br - ar) * k), int(ag + (bg - ag) * k), int(ab + (bb - ab) * k))


def draw_tabs(img: Image.Image, file_name: str, right_label: str):
    d = ImageDraw.Draw(img)
    y0, y1 = HDR_H, HDR_H + TAB_H
    d.rectangle([0, y0, CODE_X1, y1], fill=TAB_BG)
    d.rectangle([CODE_X1, y0, W, y1], fill=TAB_BG)
    d.line([(0, y1), (CODE_X1, y1)], fill=BORDER, width=1)
    d.line([(CODE_X1, y1), (W, y1)], fill=BORDER, width=1)
    # active file tab
    f = font(MONO_B, 19)
    tw = f.getlength(file_name) + 46
    d.rectangle([GUTTER_W, y0, GUTTER_W + tw, y1], fill=CODE_BG)
    d.rectangle([GUTTER_W, y0, GUTTER_W + 4, y1], fill=GOLD)
    d.text((GUTTER_W + 20, y0 + 12), file_name, font=f, fill="#e6ecff")
    f2 = font(UI, 17)
    d.text((CODE_X1 + 22, y0 + 13), right_label, font=f2, fill=COL_DIM)


def draw_header(d: ImageDraw.ImageDraw, left1: str, left2: str, centre1: str, centre2: str, right: str):
    d.text((34, 20), left1, font=font(UI_B, 21), fill="#ffffff")
    d.text((34, 52), left2, font=font(UI, 15), fill="#93a4d0")
    f1 = font(UI_B, 22)
    f2 = font(UI, 16)
    cx = W // 2
    d.text((cx - f1.getlength(centre1) // 2, 16), centre1, font=f1, fill=GOLD)
    d.text((cx - f2.getlength(centre2) // 2, 50), centre2, font=f2, fill="#d9e2ff")
    fr = font(MONO, 17)
    tw = fr.getlength(right) + 30
    d.rounded_rectangle([W - tw - 30, 28, W - 30, 64], radius=8, fill="#101a3d", outline="#2a3768")
    d.text((W - tw - 15, 36), right, font=fr, fill="#9fb4ee")


def draw_footer(d: ImageDraw.ImageDraw, left: str, timecode: str, progress: float):
    d.rectangle([0, H - FTR_H, W, H], fill="#0b1128")
    d.text((34, H - 34), left, font=font(UI, 15), fill="#8ea3d6")
    f = font(MONO, 16)
    d.text((W - 34 - f.getlength(timecode), H - 35), timecode, font=f, fill="#9fb4ee")
    d.rectangle([0, H - FTR_H, W, H - FTR_H + 3], fill="#141c3c")
    pw = int(W * max(0.0, min(1.0, progress)))
    if pw > 0:
        d.rectangle([0, H - FTR_H, pw, H - FTR_H + 3], fill=GOLD)


def draw_code(img: Image.Image, disp_lines, src_no, reveal: int, scroll: int, cursor):
    d = ImageDraw.Draw(img)
    d.rectangle([0, BODY_Y0, GUTTER_W, BODY_Y1], fill=GUTTER_BG)
    d.line([(GUTTER_W, BODY_Y0), (GUTTER_W, BODY_Y1)], fill="#141a35", width=1)
    fnum = font(MONO, 17)
    fcode = font(MONO, 21)
    budget = reveal
    cursor_px = None
    for i in range(scroll, min(len(disp_lines), scroll + CODE_ROWS)):
        y = BODY_Y0 + (i - scroll) * CODE_LH
        segs = disp_lines[i]
        line_len = sum(len(t) for t, _ in segs)
        if budget <= 0:
            break
        if src_no[i]:
            d.text((GUTTER_W - 14, y + 4), str(src_no[i]), font=fnum,
                   fill=COL_DIM, anchor="ra")
        if budget >= line_len:
            x = CODE_TEXT_X
            for text, colour in segs:
                if text:
                    d.text((x, y + 3), text, font=fcode, fill=colour)
                    x += fcode.getlength(text)
            budget -= line_len
            if budget == 0:
                cursor_px = (x, y)
        else:
            x, left = CODE_TEXT_X, budget
            for text, colour in segs:
                if left <= 0:
                    break
                part = text[:left]
                if part:
                    d.text((x, y + 3), part, font=fcode, fill=colour)
                    x += fcode.getlength(part)
                left -= len(part)
            cursor_px = (x, y)
            budget = 0
    if cursor_px and int(time.time() * 2) % 2 == 0:
        d.rectangle([cursor_px[0] + 1, cursor_px[1] + 3,
                     cursor_px[0] + 11, cursor_px[1] + 27], fill=GOLD)


def draw_terminal(img: Image.Image, lines, visible: int, scrolling: int,
                  note: str = "", ended: bool = False, exit_code: int = 0):
    d = ImageDraw.Draw(img)
    f = font(MONO, 19)
    y = BODY_Y0 + 14
    shown = lines[:max(0, visible)]
    if len(shown) > TERM_ROWS - 1:
        scrolling = max(scrolling, len(shown) - (TERM_ROWS - 1))
    shown = shown[scrolling:]
    for text in shown[:TERM_ROWS]:
        if text.startswith("\x00"):
            d.text((TERM_TEXT_X, y), text[1:], font=f, fill=COL_OK)
        elif text.startswith("\x01"):
            d.text((TERM_TEXT_X, y), text[1:], font=font(MONO_B, 19), fill="#ffd88a")
        else:
            d.text((TERM_TEXT_X, y), text, font=f, fill=COL_OUT)
        y += TERM_LH
    if note and y < BODY_Y1 - 30:
        d.text((TERM_TEXT_X, y), note, font=f, fill=COL_DIM)
        y += TERM_LH
    if ended and y < BODY_Y1 - 10:
        d.text((TERM_TEXT_X, y + 6), ("%s" % ("process finished - exit code %d" % exit_code)),
               font=font(MONO_B, 19), fill=COL_OK if exit_code == 0 else COL_ERR)


def draw_figure(img: Image.Image, path: str, caption: str, prog: float):
    try:
        fig = Image.open(path).convert("RGB")
    except Exception:
        return
    max_w = TERM_TEXT_W
    max_h = BODY_H - 90
    k = min(max_w / fig.width, max_h / fig.height, 1.6)
    fig = fig.resize((max(1, int(fig.width * k)), max(1, int(fig.height * k))),
                     Image.LANCZOS)
    d = ImageDraw.Draw(img)
    x0 = CODE_X1 + (CODE_X1 + TERM_TEXT_W + 26 - CODE_X1 - fig.width) // 2
    x0 = CODE_X1 + max(14, (W - CODE_X1 - fig.width) // 2)
    y0 = BODY_Y0 + 30 + int((1 - min(1.0, prog * 6)) * 18)
    d.rectangle([x0 - 10, y0 - 10, x0 + fig.width + 10, y0 + fig.height + 10],
                fill="#ffffff", outline=GOLD, width=2)
    img.paste(fig, (x0, y0))
    f = font(UI, 17)
    d.text((x0, y0 + fig.height + 20), caption, font=f, fill="#9fb4ee")


# --------------------------------------------------------------------------
# section videos
# --------------------------------------------------------------------------


def build_steps(events, file_name: str, exit_code: int):
    fig_total = sum(1 for k, _ in events if k == "fig")
    cmd = "> python " + file_name
    steps = [{"k": "code", "dur": 6.0}]
    steps.append({"k": "cmd", "dur": 1.0, "text": cmd})
    fig_i = 0
    for kind, payload in events:
        if kind == "out":
            if not payload.strip():
                continue
            lines = soft_wrap(payload, font(MONO, 19), TERM_TEXT_W)
            if not any(l.strip() for l in lines):
                continue
            steps.append({"k": "out", "lines": lines,
                          "dur": max(1.1, min(7.0, 0.16 * len(lines) + 0.8))})
        else:
            fig_i += 1
            steps.append({"k": "fig", "path": payload, "index": fig_i,
                          "total": fig_total, "dur": 3.0})
    steps.append({"k": "end", "dur": 2.6, "exit": exit_code})
    t = 0.0
    for s in steps:
        s["start"] = t
        t += s["dur"]
    return steps, t


def prepare_section_video(exp, sec, res, code_disp):
    file_name = os.path.basename(sec["video"])
    steps, total = build_steps(res["events"], file_name, res["exit"])
    code_chars = sum(len(t) for line in code_disp for t, _ in line)
    code_step = steps[0]
    code_step["dur"] = max(4.0, min(12.0, code_chars / 95.0))
    t = 0.0
    for s in steps:
        s["start"] = t
        t += s["dur"]
    total = t
    if total < MIN_SECONDS:
        k = MIN_SECONDS / total
        for s in steps:
            s["dur"] *= k
        t = 0.0
        for s in steps:
            s["start"] = t
            t += s["dur"]
        total = t
    return steps, total


def state_at(steps, t):
    reveal = 1.0
    prompt_chars = 0
    out_acc = 0.0
    fig_step = None
    fig_prog = 0.0
    ended = False
    exit_code = 0
    cmd_text = ""
    for s in steps:
        if t < s["start"]:
            break
        p = (t - s["start"]) / max(1e-6, s["dur"])
        if s["k"] == "code":
            reveal = min(1.0, p)
        elif s["k"] == "cmd":
            cmd_text = s["text"]
            prompt_chars = min(len(s["text"]), int(math.ceil(p * len(s["text"]))))
        elif s["k"] == "out":
            out_acc += len(s["lines"]) * min(1.0, p)
        elif s["k"] == "fig":
            if p < 1.0:
                fig_step, fig_prog = s, p
        elif s["k"] == "end":
            ended, exit_code = True, s["exit"]
    return {
        "reveal": reveal,
        "cmd_text": cmd_text,
        "prompt_chars": prompt_chars,
        "out_lines": out_acc,
        "fig": fig_step,
        "fig_prog": fig_prog,
        "ended": ended,
        "exit": exit_code,
    }


def render_section_frame(base, disp_lines, src_no, steps, t, total, meta):
    st = state_at(steps, t)
    img = base.copy()
    d = ImageDraw.Draw(img)

    reveal_chars = int(st["reveal"] * sum(len(t_) for line in disp_lines for t_, _ in line))
    scroll = 0
    seen = 0
    for i, line in enumerate(disp_lines):
        ln = sum(len(t) for t, _ in line)
        if seen + ln >= reveal_chars:
            scroll = max(0, i - (CODE_ROWS - 4))
            break
        seen += ln
    else:
        scroll = max(0, len(disp_lines) - (CODE_ROWS - 2))
    draw_code(img, disp_lines, src_no, reveal_chars, scroll, True)

    term_lines = []
    if st["cmd_text"] and st["prompt_chars"] > 0:
        term_lines.append("\x01" + st["cmd_text"][:st["prompt_chars"]])
    n_out = int(st["out_lines"] + 0.999)
    for s in steps:
        if s["k"] != "out":
            continue
        for line in s["lines"][:max(0, n_out)]:
            term_lines.append(line)
        n_out -= len(s["lines"])
        if n_out <= 0:
            break
    note = ""
    if not term_lines:
        note = "waiting for the program to start" if st["reveal"] >= 1.0 else "typing exp source"
    ended = st["ended"] and st["fig"] is None
    draw_terminal(img, term_lines, len(term_lines), 0, note=note,
                  ended=ended, exit_code=st["exit"])
    if st["fig"]:
        caption = "matplotlib output - figure %d of %d" % (st["fig"]["index"], st["fig"]["total"])
        draw_figure(img, st["fig"]["path"], caption, st["fig_prog"])
    return img


# --------------------------------------------------------------------------
# preview videos
# --------------------------------------------------------------------------


def build_preview(exp, results):
    """Slides: intro, one per section, outro."""
    sections = exp["sections"]
    slides = [{"k": "intro", "dur": 3.0, "exp": exp}]
    for i, sec in enumerate(sections):
        res = results["exp%d-%s" % (exp["id"], sec["letter"].lower())]
        fig = next((p for k, p in res["events"] if k == "fig"), None)
        out_text = "".join(p for k, p in res["events"] if k == "out")
        slides.append({"k": "section", "dur": 2.7, "exp": exp, "sec": sec,
                       "fig": fig, "out": out_text, "idx": i + 1,
                       "total": len(sections)})
    slides.append({"k": "outro", "dur": 2.8, "exp": exp})
    total = sum(s["dur"] for s in slides)
    if total < MIN_SECONDS:
        k = MIN_SECONDS / total
        for s in slides:
            s["dur"] *= k
    t = 0.0
    for s in slides:
        s["start"] = t
        t += s["dur"]
    return slides, t


def draw_preview_frame(base, slides, t):
    slide = slides[0]
    for s in slides:
        if t >= s["start"]:
            slide = s
    p = (t - slide["start"]) / max(1e-6, slide["dur"])
    img = base.copy()
    d = ImageDraw.Draw(img)
    exp = slide["exp"]

    if slide["k"] == "intro":
        d.text((W // 2, 330), "EXPERIMENT %02d" % exp["id"], font=font(UI_B, 30),
               fill=GOLD, anchor="ma")
        name_font = fit_font(exp["name"], (UI_B, 54), W - 260, 54, 30)
        d.text((W // 2, 400), exp["name"], font=name_font, fill="#ffffff", anchor="ma")
        y = 490
        for line in wrap_words(exp.get("summary") or "", font(UI, 24), W - 420)[:3]:
            d.text((W // 2, y), line, font=font(UI, 24), fill="#aebbe4", anchor="ma")
            y += 36
        d.text((W // 2, y + 26), exp.get("subjectCode") or "", font=font(MONO, 18),
               fill=COL_DIM, anchor="ma")

    elif slide["k"] == "section":
        sec = slide["sec"]
        d.ellipse([60, BODY_Y0 + 26, 148, BODY_Y0 + 114], fill=GOLD)
        d.text((104, BODY_Y0 + 70), sec["letter"], font=font(UI_B, 46),
               fill="#0b1020", anchor="mm")
        d.text((172, BODY_Y0 + 40), "Section %s" % sec["letter"], font=font(UI_B, 20),
               fill=GOLD)
        title_font = fit_font(sec["title"], (UI_B, 34), 940, 34, 20)
        d.text((172, BODY_Y0 + 66), sec["title"], font=title_font, fill="#ffffff")
        d.text((172, BODY_Y0 + 112), "experiment %d - part %d of %d" % (
            exp["id"], slide["idx"], slide["total"]), font=font(UI, 17), fill=COL_DIM)

        # code block
        code_y = BODY_Y0 + 152
        d.rounded_rectangle([60, code_y, 1120, BODY_Y1 - 40], radius=12,
                            fill=CODE_BG, outline=BORDER)
        d.rectangle([60, code_y, 1120, code_y + 40], fill=TAB_BG)
        d.text((84, code_y + 10), os.path.basename(sec["video"]).replace(".mp4", ".py"),
               font=font(MONO_B, 18), fill="#e6ecff")
        styled = highlight(sec["code"])
        fcode = font(MONO, 19)
        fnum = font(MONO, 15)
        rows = (BODY_Y1 - 40 - code_y - 56) // 26
        lines = []
        for i, segs in enumerate(styled):
            lines.append((i + 1, segs))
        shown = lines[:rows]
        reveal = int(p * 1.4 * sum(len(t_) for _, segs in shown for t_, _ in segs))
        y = code_y + 52
        budget = reveal
        for no, segs in shown:
            if budget <= 0:
                break
            d.text((110, y), str(no), font=fnum, fill=COL_DIM, anchor="ra")
            x = 130
            line_len = sum(len(t) for t, _ in segs)
            for text, colour in segs:
                if budget <= 0:
                    break
                part = text[:budget]
                if part:
                    d.text((x, y), part, font=fcode, fill=colour)
                    x += fcode.getlength(part)
                budget -= len(text)
            y += 26

        # output / figure
        d.rounded_rectangle([1150, code_y, W - 60, BODY_Y1 - 40], radius=12,
                            fill=TERM_BG, outline=BORDER)
        d.rectangle([1150, code_y, W - 60, code_y + 40], fill=TAB_BG)
        d.text((1174, code_y + 10), "Output", font=font(MONO_B, 18), fill="#e6ecff")
        out_lines = []
        for chunk in [slide["out"]]:
            out_lines.extend(chunk.split("\n"))
        out_lines = [l for l in out_lines]
        y = code_y + 54
        fo = font(MONO, 17)
        for line in out_lines[:14]:
            if y > BODY_Y1 - 70:
                break
            d.text((1174, y), line[:60], font=fo, fill=COL_OUT)
            y += 24
        if slide["fig"]:
            try:
                figimg = Image.open(slide["fig"]).convert("RGB")
                max_w, max_h = W - 60 - 1174, BODY_Y1 - 40 - y - 24
                if max_h > 80:
                    k = min(max_w / figimg.width, max_h / figimg.height, 1.2)
                    figimg = figimg.resize((int(figimg.width * k), int(figimg.height * k)),
                                           Image.LANCZOS)
                    d.rectangle([1170, y - 6, 1170 + figimg.width + 8,
                                 y - 6 + figimg.height + 8], fill="#ffffff")
                    img.paste(figimg, (1174, y - 2))
            except Exception:
                pass

    else:  # outro
        d.text((W // 2, 430), "Experiment %d" % exp["id"], font=font(UI_B, 26),
               fill=GOLD, anchor="ma")
        d.text((W // 2, 490), exp["name"], font=fit_font(exp["name"], (UI_B, 46), W - 300, 46, 26),
               fill="#ffffff", anchor="ma")
        d.text((W // 2, 590), "open the experiment for the full code + output walkthrough",
               font=font(UI, 24), fill="#aebbe4", anchor="ma")
        d.text((W // 2, 650), "%d sections  -  python  -  pandas  -  matplotlib" % len(exp["sections"]),
               font=font(MONO, 19), fill=COL_DIM, anchor="ma")

    return img


# --------------------------------------------------------------------------
# encoding
# --------------------------------------------------------------------------


def ffmpeg_exe() -> str:
    if imageio_ffmpeg is None:
        raise SystemExit("imageio-ffmpeg is required: python -m pip install imageio-ffmpeg")
    return imageio_ffmpeg.get_ffmpeg_exe()


class Encoder:
    def __init__(self, path: str, crf: int = CRF):
        self.path = path
        tmp = path + ".part.mp4"
        self.tmp = tmp
        self.proc = subprocess.Popen(
            [ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
             "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H),
             "-framerate", str(FPS), "-i", "-",
             "-c:v", "libx264", "-preset", "medium", "-crf", str(crf),
             "-pix_fmt", "yuv420p", "-g", str(FPS * 2), "-movflags", "+faststart",
             tmp],
            stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        self.frames = 0

    def write(self, img: Image.Image):
        self.proc.stdin.write(img.tobytes())
        self.frames += 1

    def close(self):
        self.proc.stdin.close()
        err = self.proc.stderr.read().decode("utf-8", "replace")
        rc = self.proc.wait()
        if rc != 0:
            raise RuntimeError("ffmpeg failed (%s):\n%s" % (rc, err))
        os.replace(self.tmp, self.path)

    @property
    def seconds(self) -> float:
        return self.frames / FPS


def backup_originals():
    os.makedirs(VIDEO_DIR, exist_ok=True)
    for name in os.listdir(VIDEO_DIR):
        if not name.lower().endswith(".mp4"):
            continue
        src = os.path.join(VIDEO_DIR, name)
        if os.path.isdir(src):
            continue
        dst = os.path.join(BACKUP_DIR, name)
        if not os.path.exists(dst):
            os.makedirs(BACKUP_DIR, exist_ok=True)
            shutil.copy2(src, dst)


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------


def report(path: str) -> str:
    out = subprocess.run([ffmpeg_exe(), "-hide_banner", "-i", path],
                         capture_output=True, text=True).stderr
    m = re.search(r"\b(\d{2,5}x\d{2,5})\b.*?\b(\d+(?:\.\d+)?) fps", out)
    dur = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", out)
    res = m.group(1) if m else "?"
    seconds = (int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 +
               float(dur.group(3))) if dur else 0
    return "%-16s %s  %5.1fs  %6.1f MB" % (
        os.path.basename(path), res, seconds, os.path.getsize(path) / 1048576)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("targets", nargs="*", help="e.g. exp3-b exp5-a")
    ap.add_argument("--previews", action="store_true", help="only previews")
    ap.add_argument("--sections-only", action="store_true")
    ap.add_argument("--exec-only", action="store_true")
    ap.add_argument("--crf", type=int, default=CRF)
    args = ap.parse_args()

    if imageio_ffmpeg is None:
        raise SystemExit("python -m pip install imageio-ffmpeg")

    lab = load_lab()
    ensure_dataset()
    os.makedirs(BUILD, exist_ok=True)
    backup_originals()

    inputs = [os.path.join(DATA_DIR, n) for n in os.listdir(DATA_DIR)] \
        if os.path.isdir(DATA_DIR) else []
    _install_hooks()

    wanted = set(args.targets)
    results = {}
    t0 = time.time()
    for exp in lab["experiments"]:
        for sec in exp["sections"]:
            key = "exp%d-%s" % (exp["id"], sec["letter"].lower())
            if wanted and key not in wanted:
                continue
            if sec["video"] in wanted:
                pass
            print("running  %-10s %s" % (key, sec["title"]), flush=True)
            results[key] = execute_section(sec["code"], key, inputs)
    if args.exec_only:
        for key, res in results.items():
            n_out = sum(len(p.split("\n")) for k, p in res["events"] if k == "out")
            n_fig = sum(1 for k, _ in res["events"] if k == "fig")
            print("%-10s exit=%d lines=%-4d figures=%d" % (key, res["exit"], n_out, n_fig))
            if res["exit"]:
                for k, p in res["events"]:
                    if k == "out" and "Traceback" in p:
                        print(p[:900])
        print("exec %.1fs" % (time.time() - t0))
        return

    done = []
    if not args.previews:
        for exp in lab["experiments"]:
            for sec in exp["sections"]:
                key = "exp%d-%s" % (exp["id"], sec["letter"].lower())
                if wanted and key not in wanted and sec["video"] not in wanted:
                    continue
                if key not in results:
                    results[key] = execute_section(sec["code"], key, inputs)
                res = results[key]
                disp = []
                src_no = []
                for i, segs in enumerate(highlight(sec["code"])):
                    wrapped = wrap_segments(segs, font(MONO, 21), CODE_TEXT_W)
                    for j, w in enumerate(wrapped):
                        disp.append(w)
                        src_no.append(i + 1 if j == 0 else 0)
                steps, total = prepare_section_video(exp, sec, res, disp)
                out_path = os.path.join(VIDEO_DIR, os.path.basename(sec["video"]))
                base = new_base()
                draw_tabs(base, os.path.basename(sec["video"]).replace(".mp4", ".py"), "Output")
                enc = Encoder(out_path, args.crf)
                frames = int(math.ceil(total * FPS))
                for i in range(frames):
                    t = i / FPS
                    img = render_section_frame(base, disp, src_no, steps,
                                               t, total, res)
                    d = ImageDraw.Draw(img)
                    draw_header(d,
                                "MOHAN BABU UNIVERSITY",
                                "Data Science Digital Library - 22DS102006",
                                "Experiment %d - Section %s" % (exp["id"], sec["letter"]),
                                sec["title"],
                                "python exp%d-%s.py" % (exp["id"], sec["letter"].lower()))
                    draw_footer(d, "pandas - numpy - matplotlib - seaborn   |   recorded execution",
                                "%02d:%02d / %02d:%02d" % (t // 60, t % 60, total // 60, total % 60),
                                t / total)
                    enc.write(img)
                enc.close()
                done.append(out_path)
                print("wrote   %-10s %5.1fs" % (key, enc.seconds), flush=True)

    if not args.sections_only:
        for exp in lab["experiments"]:
            need = False
            for sec in exp["sections"]:
                key = "exp%d-%s" % (exp["id"], sec["letter"].lower())
                if wanted and key not in wanted:
                    continue
                need = True
            if wanted and not need:
                continue
            for sec in exp["sections"]:
                key = "exp%d-%s" % (exp["id"], sec["letter"].lower())
                if key not in results:
                    results[key] = execute_section(sec["code"], key, inputs)
            slides, total = build_preview(exp, results)
            base = new_base()
            draw_tabs(base, "preview - experiment %d" % exp["id"], "hover preview")
            d0 = ImageDraw.Draw(base)
            draw_header(d0, "MOHAN BABU UNIVERSITY", "Data Science Digital Library - 22DS102006",
                        "Experiment %d - preview" % exp["id"], exp["name"], "preview.mp4")
            out_path = os.path.join(VIDEO_DIR, os.path.basename(exp["previewVideo"]))
            enc = Encoder(out_path, args.crf)
            for i in range(int(math.ceil(total * FPS))):
                t = i / FPS
                img = draw_preview_frame(base, slides, t)
                d = ImageDraw.Draw(img)
                draw_footer(d, "hover preview - %d sections" % len(exp["sections"]),
                            "%02d:%02d / %02d:%02d" % (t // 60, t % 60, total // 60, total % 60),
                            t / total)
                enc.write(img)
            enc.close()
            done.append(out_path)
            print("wrote   %-16s %5.1fs" % (os.path.basename(exp["previewVideo"]), enc.seconds),
                  flush=True)

    print("\n%-18s %-10s %7s %9s" % ("file", "resolution", "length", "size"))
    for path in done:
        if os.path.exists(path):
            print(report(path))
    print("total %.1fs" % (time.time() - t0))


if __name__ == "__main__":
    main()
