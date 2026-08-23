from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "geohab-data" / "Data"
OUTPUT_DIR = ROOT / "portfolio_ui" / "public" / "work" / "geohab"

RASTER_NODATA = -9999.0
TARGET_WIDTH = 1200
CLASS_COLORS = {
    "ALG": "#e46d55",
    "FMAT": "#d2ab61",
    "NVB": "#8793a1",
    "SGAM": "#55a58f",
    "SGZ": "#78a95f",
}


def read_georeference(image: Image.Image) -> tuple[float, float, float, float]:
    scale = image.tag_v2.get(33550)
    tiepoint = image.tag_v2.get(33922)
    if not scale or not tiepoint:
        raise ValueError("GeoTIFF is missing pixel-scale or tiepoint metadata")

    pixel_width, pixel_height = float(scale[0]), float(scale[1])
    raster_x, raster_y = float(tiepoint[0]), float(tiepoint[1])
    map_x, map_y = float(tiepoint[3]), float(tiepoint[4])
    origin_x = map_x - raster_x * pixel_width
    origin_y = map_y + raster_y * pixel_height
    return origin_x, origin_y, pixel_width, pixel_height


def normalize(values: np.ndarray, mask: np.ndarray, low: float, high: float) -> np.ndarray:
    result = np.zeros_like(values, dtype=np.float32)
    result[mask] = np.clip((values[mask] - low) / (high - low), 0.0, 1.0)
    return result


def add_points(
    base: Image.Image,
    rows: pd.DataFrame,
    origin_x: float,
    origin_y: float,
    pixel_width: float,
    pixel_height: float,
    crop_x: int,
    crop_y: int,
    crop_width: int,
    crop_height: int,
    colorized: bool,
) -> Image.Image:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    scale_x = base.width / crop_width
    scale_y = base.height / crop_height

    for habitat, x_value, y_value in rows[["class", "x", "y"]].itertuples(index=False, name=None):
        raster_x = (float(x_value) - origin_x) / pixel_width
        raster_y = (origin_y - float(y_value)) / pixel_height
        x = (raster_x - crop_x) * scale_x
        y = (raster_y - crop_y) * scale_y

        if not (0 <= x < base.width and 0 <= y < base.height):
            continue

        if colorized:
            color = CLASS_COLORS[str(habitat)]
            draw.ellipse((x - 1.15, y - 1.15, x + 1.15, y + 1.15), fill=color + "f0")
        else:
            draw.ellipse((x - 0.72, y - 0.72, x + 0.72, y + 0.72), fill=(199, 201, 197, 112))

    return Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")


def main() -> None:
    backscatter_image = Image.open(DATA_DIR / "backscatter.tif")
    bathymetry_image = Image.open(DATA_DIR / "bathymetry.tif")

    if backscatter_image.size != bathymetry_image.size:
        raise ValueError("Bathymetry and backscatter rasters do not share a grid")

    backscatter = np.asarray(backscatter_image, dtype=np.float32)
    bathymetry = np.asarray(bathymetry_image, dtype=np.float32)
    valid = (backscatter > RASTER_NODATA) & (bathymetry > RASTER_NODATA)
    valid_y, valid_x = np.where(valid)

    margin = 18
    x0 = max(0, int(valid_x.min()) - margin)
    x1 = min(backscatter.shape[1], int(valid_x.max()) + margin + 1)
    y0 = max(0, int(valid_y.min()) - margin)
    y1 = min(backscatter.shape[0], int(valid_y.max()) + margin + 1)

    backscatter = backscatter[y0:y1, x0:x1]
    bathymetry = bathymetry[y0:y1, x0:x1]
    valid = valid[y0:y1, x0:x1]
    depth = -bathymetry

    backscatter_normalized = normalize(backscatter, valid, -31.58, -15.20)
    depth_normalized = normalize(depth, valid, 2.0, 21.0)
    luminance = np.clip(0.78 * backscatter_normalized + 0.22 * (1.0 - depth_normalized), 0.0, 1.0)
    luminance = np.power(luminance, 0.92)

    depth_zones = np.digitize(np.where(valid, depth, -999.0), [2.0, 5.0, 10.0, 15.0, 20.0])
    contours = np.zeros_like(valid)
    contours[:, 1:] |= (depth_zones[:, 1:] != depth_zones[:, :-1]) & valid[:, 1:] & valid[:, :-1]
    contours[1:, :] |= (depth_zones[1:, :] != depth_zones[:-1, :]) & valid[1:, :] & valid[:-1, :]

    pixels = np.zeros((*luminance.shape, 3), dtype=np.uint8)
    gray = (24 + luminance * 186).astype(np.uint8)
    pixels[valid] = np.stack([gray[valid], gray[valid], gray[valid]], axis=-1)
    pixels[contours] = np.array([181, 183, 179], dtype=np.uint8)

    base = Image.fromarray(pixels, "RGB")
    target_height = round(TARGET_WIDTH * base.height / base.width)
    base = base.resize((TARGET_WIDTH, target_height), Image.Resampling.LANCZOS)

    origin_x, origin_y, pixel_width, pixel_height = read_georeference(backscatter_image)
    training = pd.read_csv(DATA_DIR / "train data.csv")
    missing_classes = set(training["class"].unique()) - set(CLASS_COLORS)
    if missing_classes:
        raise ValueError(f"Missing colors for classes: {sorted(missing_classes)}")

    neutral = add_points(
        base,
        training,
        origin_x,
        origin_y,
        pixel_width,
        pixel_height,
        x0,
        y0,
        x1 - x0,
        y1 - y0,
        colorized=False,
    )
    color = add_points(
        base,
        training,
        origin_x,
        origin_y,
        pixel_width,
        pixel_height,
        x0,
        y0,
        x1 - x0,
        y1 - y0,
        colorized=True,
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    neutral_path = OUTPUT_DIR / "training-map-neutral.webp"
    color_path = OUTPUT_DIR / "training-map-color.webp"
    neutral.save(neutral_path, "WEBP", quality=90, method=6)
    color.save(color_path, "WEBP", quality=90, method=6)

    summary = {
        "image_size": list(base.size),
        "training_points": int(len(training)),
        "classes": training["class"].value_counts().sort_index().to_dict(),
        "raster_crop": [x0, y0, x1, y1],
        "neutral_bytes": neutral_path.stat().st_size,
        "color_bytes": color_path.stat().st_size,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
