from pathlib import Path
from PIL import Image
script=Path(__file__).parent/'build_pink_star.py'
ns={'__file__':str(script.resolve())}
exec(script.read_text(encoding='utf-8-sig').split('idle=cells')[0],ns)
frames=ns['cells']('idle-animation-sheet.png',4,4)
base=Image.open(ns['out']/'idle_S.png').getbbox()
scale=min((base[2]-base[0]+2)/max(t.width for t in frames),(base[3]-base[1]+2)/max(t.height for t in frames))
preview=Image.new('RGBA',(256,256))
for row,prefix in enumerate(['breathe_S','breathe_N','blink','idle_2']):
 for frame in range(4):
  bounce=[0,-1,-2,-1][frame] if row in (0,1,3) else 0
  im=ns['render'](frames[row*4+frame],scale,bounce)
  im.save(ns['out']/f'{prefix}_{frame}.png')
  preview.alpha_composite(im,(frame*64,row*64))
preview.save(ns['out']/'idle-preview.png')
print('16 idle animation frames exported')
