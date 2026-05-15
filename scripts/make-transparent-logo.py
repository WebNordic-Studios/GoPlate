"""Strip near-black background from the raster logo for web use."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def main() -> None:
    src = Path(sys.argv[1]).resolve()
    dst = Path(sys.argv[2]).resolve()
    threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 42

    img = Image.open(src).convert("RGBA")
    px = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # Drop solid black / near-black backdrop; keep teal edges (still bright in at least one channel).
            if r <= threshold and g <= threshold and b <= threshold:
                px[x, y] = (0, 0, 0, 0)

    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, optimize=True)


if __name__ == "__main__":
    main()
