from PIL import Image
from pathlib import Path
root=Path('assets/objects/nature/trees/wood-animation')
for kind in range(5):
 base=Image.open(root/f'tree-{kind}-wood-base.png').convert('RGBA'); w,h=base.size
 palette=set(base.get_flattened_data())
 for frame in range(72):
  im=Image.open(root/f'tree-{kind}-wood-{frame}.png').convert('RGBA')
  assert im.size==base.size
  assert set(im.get_flattened_data()).issubset(palette)
  assert im.crop((0,int(h*.68),w,h)).tobytes()==base.crop((0,int(h*.68),w,h)).tobytes()
print('360 frames: exact palette and unchanged lower trunk verified')


