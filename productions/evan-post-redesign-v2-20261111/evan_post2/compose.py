"""把时间轴变成画面：scene.items(t) 是唯一的真相来源，预览静帧、整片渲染和检查都走它。"""
from PIL import Image

from . import draw
from .draw import M, LayoutError
from .timeline import face_at, zoom_at


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


class Scene:
    def __init__(self, plan, P, vocab, ref_frame=None):
        self.plan, self.P, self.vocab = plan, P, vocab
        self.W, self.H = P["canvas"]
        self.total_cards = len(vocab)
        C = P["card"]
        self.chip = draw.chip(P, plan["header"]) if P["chip"]["show"] else None
        self.chip_xy = ((self.W - self.chip.w) // 2, P["chip"]["y"]) if self.chip else None
        self.lane_top = C["top_y"]
        face_cx = (plan["face"][0] + plan["face"][2]) / 2
        self.hook = None
        if plan["hook"]:
            probe = draw.hook(P, plan["hook"]["text"])
            x = (self.W - probe.w) // 2
            self.hook = draw.hook(P, plan["hook"]["text"], (face_cx - x) / probe.w)
            self.hook_xy = (x, self.lane_top)
        self.q = draw.question(P, plan["header"], self.chip.w if self.chip else 520)
        self.q_xy = ((self.W - self.q.w) // 2, self.lane_top - 8)
        self.lays = [draw.layout_cue(P, c) for c in plan["cues"]]
        self._cue_cache, self._state_cache = {}, {}
        if ref_frame is not None:
            for lay in self.lays:
                lay["contrast"] = self.backdrop_contrast(ref_frame, lay, adapt=True)
        S = P["sub"]
        self.sub_top_max = S["divider_y"] - S["gap"] / 2 - S["max_en_lines"] * round(S["en_sizes"][0] * S["en_lh"])
        # ---- 表达卡定位 ----
        self.cards = {}
        cards = plan["cards"]
        by_vi = {c["vi"]: c for c in cards}
        for g in plan["groups"]:
            members = [cards[k] for k in g["members"]]
            if C["lane"] == "dock":
                sprites = [draw.card_compact(P, c, self.total_cards) for c in members]
                y = self.sub_top_max - C["dock_gap"] - (16 if S["mode"] == "panel" else 0)
                for c, s in zip(members, sprites):
                    y -= s.h
                    self.cards[c["vi"]] = (s, (self.W - s.w) // 2, int(y))
                    y -= C["gap"]
                g["style"] = "dock"
                continue
            limit = face_at(plan, g["t1"])[1] - C["face_margin"]
            sprites = [draw.card(P, c, self.total_cards, by_vi.get(c["pair_with"])) for c in members]
            style = "standard"
            if self.lane_top + sum(s.h for s in sprites) + C["gap"] * (len(sprites) - 1) > limit:
                sprites = [draw.card_compact(P, c, self.total_cards) for c in members]
                style = "compact"
                if self.lane_top + sum(s.h for s in sprites) + C["gap"] * (len(sprites) - 1) > limit:
                    raise LayoutError("上方栏放不下这组表达卡（脸太靠上）：请改用 card.lane=dock")
            y = self.lane_top
            for c, s in zip(members, sprites):
                self.cards[c["vi"]] = (s, (self.W - s.w) // 2, int(y))
                y += s.h + C["gap"]
            g["style"] = style

    def backdrop_contrast(self, frame, lay, adapt=False):
        """白字对“画面+字幕底”的对比度 (最差5%分位, 中位)。adapt=True 时顺便选定本句暗晕强度。"""
        from . import checks
        S = self.P["sub"]
        y, h = draw.cue_origin(lay)
        ladder = S["scrim_ladder"] if (adapt and S["mode"] == "scrim" and S["scrim_adaptive"]) else [lay.get("scrim_alpha", S["scrim_alpha"])]
        for alpha in ladder:
            lay["scrim_alpha"] = alpha
            back = draw.cue_back(self.P, lay, 1, y, h)
            region = frame.crop((0, y, self.W, y + h)).convert("RGB")
            region.paste(back, (0, 0), back)
            b = lay["bbox"]
            res = checks.contrast_of_region(region, (b[0], b[1] - y, b[2], b[3] - y))
            if res[0] >= S["contrast_target"]:
                break
        return res

    # ---- 字幕（带短语擦入）----
    def _cue(self, i, t):
        if i not in self._cue_cache:
            self._cue_cache[i] = draw.cue_sprites(self.P, self.plan["cues"][i], self.lays[i])
        off, on, y, rects = self._cue_cache[i]
        cue = self.plan["cues"][i]
        prog = tuple(round(ease_out((t - m["onset"]) / self.P["sub"]["wipe"]) * 8) for m in cue["marks"])
        key = (i, prog)
        if key not in self._state_cache:
            img = off
            if any(prog):
                img = off.copy()
                for mi, p in enumerate(prog):
                    for x0, y0, x1, y1 in rects.get(mi, []) if p else []:
                        x1c = x0 + int((x1 - x0) * p / 8)
                        box = (max(0, x0), max(0, y0), min(img.width, x1c), min(img.height, y1))
                        if box[2] > box[0]:
                            img.paste(on.crop(box), box[:2])
            self._state_cache[key] = img
            if len(self._state_cache) > 64:
                self._state_cache.pop(next(iter(self._state_cache)))
        return self._state_cache[key], y

    def items(self, t):
        """返回 [(名字, 图, x, y, 不透明度, 内容矩形)]，按从下到上的叠放顺序。"""
        P, plan, out = self.P, self.plan, []
        cues, S = plan["cues"], P["sub"]
        for i, c in enumerate(cues):
            if c["show"] <= t < c["hide"]:
                a = 1.0
                if i == 0 and c["show"] > 0 or i > 0 and c["show"] - cues[i - 1]["hide"] > 0.02:
                    a = min(a, (t - c["show"]) / S["fade_in"] + 0.34)
                if i + 1 == len(cues) and c["hide"] < plan["total"] - 0.02 or i + 1 < len(cues) and cues[i + 1]["show"] - c["hide"] > 0.02:
                    a = min(a, (c["hide"] - t) / S["fade_out"])
                img, y = self._cue(i, t)
                out.append((f"cue{i + 1:02d}", img, 0, y, a, list(self.lays[i]["bbox"])))
        if self.chip:
            x, y = self.chip_xy
            out.append(("chip", self.chip.img, x - M, y - M, 1.0, [x, y, x + self.chip.w, y + self.chip.h]))
        q = plan["question"]
        if q and q["t0"] <= t < q["t1"]:
            f = P["question"]["fade"]
            a = min(1.0, (t - q["t0"]) / f + 0.2, (q["t1"] - t) / f)
            dy = -10 * (1 - ease_out((t - q["t0"]) / f))
            x, y = self.q_xy
            out.append(("question", self.q.img, x - M, y - M + dy, a, [x, y, x + self.q.w, y + self.q.h]))
        for name, ev in (("hook", plan["hook"]), ("bookend", plan["bookend"])):
            if ev and self.hook and ev["t0"] <= t < ev["t1"]:
                a, dy = 1.0, 0.0
                if name == "hook":
                    f = P["hook"]["fade_out"]
                    a = min(1.0, (ev["t1"] - t) / f)
                    dy = -12 * (1 - min(1.0, (ev["t1"] - t) / f))
                else:
                    f = P["bookend"]["fade"]
                    a = min(1.0, (t - ev["t0"]) / f + 0.2)
                    dy = 12 * (1 - ease_out((t - ev["t0"]) / f))
                x, y = self.hook_xy
                out.append((name, self.hook.img, x - M, y - M + dy, a, [x, y, x + self.hook.w, y + self.hook.h]))
        C = P["card"]
        sign = 1 if C["lane"] == "dock" else -1
        for c in plan["cards"]:
            if c["t0"] <= t < c["t1"]:
                s, x, y = self.cards[c["vi"]]
                p = ease_out((t - c["t0"]) / C["fade_in"])
                a = min(1.0, 0.25 + 0.75 * p, (c["t1"] - t) / C["fade_out"])
                out.append((f"card{c['vi'] + 1}", s.img, x - M, y - M + sign * C["rise"] * (1 - p), a, [x, y, x + s.w, y + s.h]))
        return out

    @staticmethod
    def _faded(img, a):
        if a >= 0.995:
            return img
        img = img.copy()
        img.putalpha(img.getchannel("A").point(lambda v: int(v * max(0.0, a))))
        return img

    def paste(self, frame, t):
        """直接叠到 RGB 视频帧上。"""
        for _, img, x, y, a, _ in self.items(t):
            if a <= 0.01:
                continue
            spr = self._faded(img, a)
            frame.paste(spr, (int(round(x)), int(round(y))), spr)
        return frame

    def overlay(self, t):
        canvas = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0))
        for _, img, x, y, a, _ in self.items(t):
            if a > 0.01:
                tmp = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
                tmp.paste(self._faded(img, a), (int(round(x)), int(round(y))))
                canvas.alpha_composite(tmp)
        return canvas

    def zoom(self, frame, t):
        z = zoom_at(self.plan, t)
        if z <= 1.0005:
            return frame
        cx, cy = self.plan["twist"]["center"]
        return frame.transform(frame.size, Image.AFFINE, (1 / z, 0, cx * (1 - 1 / z), 0, 1 / z, cy * (1 - 1 / z)),
                               resample=Image.BICUBIC)
