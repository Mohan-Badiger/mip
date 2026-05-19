"""
Remove white matte / white fringing from a transparent PNG.

Algorithm: "Remove White Matte" (inverse of alpha compositing over white)
  For a pixel composited over white:  result = color * alpha + 255 * (1 - alpha)
  So the true color is:               color  = (result - 255 * (1 - alpha)) / alpha

This mathematically reverses white-background blending, producing clean RGBA
edges with no halo on any coloured background.
"""

import sys
import numpy as np
from PIL import Image

INPUT  = "public/images/purchase_plan_model.png"
OUTPUT = "public/images/purchase_plan_model.png"   # overwrite in place

print(f"Loading: {INPUT}")
img = Image.open(INPUT).convert("RGBA")
data = np.array(img, dtype=np.float64)

r = data[:, :, 0]
g = data[:, :, 1]
b = data[:, :, 2]
a = data[:, :, 3]

# Normalised alpha 0-1
alpha = a / 255.0

# Only operate where alpha > 0 to avoid division by zero
valid = alpha > 0

def defringe_channel(c, alpha, valid):
    out = c.copy()
    # Remove white contribution: true_color = (composited - 255*(1-alpha)) / alpha
    decontaminated = (c - 255.0 * (1.0 - alpha)) / np.where(valid, alpha, 1.0)
    out[valid] = np.clip(decontaminated[valid], 0, 255)
    return out

data[:, :, 0] = defringe_channel(r, alpha, valid)
data[:, :, 1] = defringe_channel(g, alpha, valid)
data[:, :, 2] = defringe_channel(b, alpha, valid)
# Alpha channel is untouched — preserve original transparency mask exactly

result = Image.fromarray(data.astype(np.uint8), "RGBA")
result.save(OUTPUT, "PNG", optimize=False, compress_level=1)

print(f"Saved clean transparent PNG → {OUTPUT}")
print(f"Image size: {result.size}, mode: {result.mode}")
