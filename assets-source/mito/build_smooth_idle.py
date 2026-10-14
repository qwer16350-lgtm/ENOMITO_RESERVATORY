from PIL import Image
from pathlib import Path
import math
root=Path(__file__).resolve().parents[2];base=root/'assets/mito/pink-star';out=base/'idle-smooth'
def frames(source,prefix,count):
 im=Image.open(base/source).convert('RGBA');tile=im.crop(im.getbbox());resolution=4
 for frame in range(count):
  phase=frame/count*math.tau
  lift=(1-math.cos(phase))/2
  width=round((tile.width+lift*.6)*resolution);height=round((tile.height+lift*1.4)*resolution)
  canvas=Image.new('RGBA',(256,256))
  body=tile.resize((width,height),Image.Resampling.NEAREST)
  canvas.alpha_composite(body,((256-width)//2,224-height))
  canvas.save(out/f'{prefix}_{frame}.png')
frames('breathe_S_0.png','breathe_S',24)
frames('breathe_N_0.png','breathe_N',24)
frames('idle_2_1.png','idle_2',8)
print('48 breathing + 8 smiling frames generated; RGB palette unchanged')
