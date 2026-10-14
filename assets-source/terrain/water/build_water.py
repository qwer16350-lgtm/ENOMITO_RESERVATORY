from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parents[3]
im=Image.open(root/'assets-source/terrain/water/water-source.png').convert('RGB').resize((64,64),Image.Resampling.NEAREST)
# Coarse matte teal palette, periodic sampling in the runtime terrain renderer.
p=[]
for r,g,b in im.get_flattened_data():
 luminance=(r+g+b)/3
 p.append((35,68,70) if luminance<65 else (44,83,84) if luminance<95 else (57,100,99) if luminance<135 else (75,119,111))
im.putdata(p);im.save(root/'assets/terrain/water/water-surface.png')
