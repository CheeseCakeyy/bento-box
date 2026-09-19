"""Extract supplied artwork unchanged; pack centered, floor-aligned web frames."""
from pathlib import Path
from PIL import Image
import sys

root = Path(__file__).resolve().parents[2]
source = Image.open(sys.argv[1])
frames = root / "art/cat/frames"
frames.mkdir(parents=True, exist_ok=True)
atlas = Image.new("RGBA", (256 * 8, 192 * 8))
for index in range(source.n_frames):
    source.seek(index)
    frame = source.convert("RGBA")
    frame.save(frames / f"cat-{index:02}.png")
    crop = frame.crop(frame.getbbox())
    atlas.alpha_composite(crop, ((index % 8) * 256 + (256 - crop.width) // 2,
                                 (index // 8) * 192 + 192 - crop.height))
atlas.save(root / "public/cat/menu-cat.png", optimize=True)
print(f"Extracted {source.n_frames} frames and packed web atlas.")
