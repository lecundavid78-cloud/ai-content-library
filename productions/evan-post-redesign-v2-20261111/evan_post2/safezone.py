"""口播头部安全框的自动估计：底片是一张静图 + 口型/眨眼微动，
所以“全片逐帧差分最大的区域”就是眼睛和嘴；按比例外扩得到头部框。纯标准库 + FFmpeg。
结果必须用 `still --debug` 人工看一眼，再写进字幕配置的 safe.face 固定下来。"""
import subprocess

W, H = 135, 240


def detect(raw_path, fps=5):
    p = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", str(raw_path), "-vf",
                        f"fps={fps},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                       capture_output=True, check=True)
    data, n = p.stdout, len(p.stdout) // (W * H)
    if n < 10:
        raise ValueError("原片太短，无法估计脸部位置")
    acc = [0] * (W * H)
    prev = data[:W * H]
    for i in range(1, n):
        cur = data[i * W * H:(i + 1) * W * H]
        acc = [a + abs(x - y) for a, x, y in zip(acc, cur, prev)]
        prev = cur
    vals = [a / (n - 1) for a in acc]
    mean = sum(vals) / len(vals)
    sd = (sum((v - mean) ** 2 for v in vals) / len(vals)) ** .5

    def bbox(th):
        xs = [i % W for i, v in enumerate(vals) if v > th]
        ys = [i // W for i, v in enumerate(vals) if v > th]
        return (min(xs), min(ys), max(xs) + 1, max(ys) + 1) if xs else None

    motion = bbox(mean + 2.5 * sd)
    core = bbox(mean + 7 * sd) or motion          # 眼睛 + 嘴
    s = 1080 / W
    cw, ch = core[2] - core[0], core[3] - core[1]
    head = [core[0] - .45 * cw, core[1] - 1.05 * ch, core[2] + .45 * cw, core[3] + .40 * ch]
    head = [max(head[0], motion[0] - 2), max(head[1], motion[1] - 2), min(head[2], motion[2] + 2), min(head[3], motion[3] + 2)]
    r = lambda b: [int(round(v * s)) for v in b]
    return {"face": r(head), "eyes_mouth": r(core), "motion": r(motion), "frames": n,
            "method": "frame-difference heatmap; head = eyes/mouth core expanded, clipped to motion area"}
