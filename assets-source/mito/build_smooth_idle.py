from PIL import Image
from pathlib import Path
import math
root=Path(__file__).resolve().parents[2];base=root/'assets/mito/pink-star';out=base/'idle-smooth'
def frames(source,prefix,count,resolution=4):
 im=Image.open(base/source).convert('RGBA');tile=im.crop(im.getbbox())
 for frame in range(count):
  phase=frame/count*math.tau
  lift=(1-math.cos(phase))/2
  width=round((tile.width+lift*.6)*resolution);height=round((tile.height+lift*1.4)*resolution)
  canvas=Image.new('RGBA',(64*resolution,64*resolution))
  body=tile.resize((width,height),Image.Resampling.NEAREST)
  canvas.alpha_composite(body,((64*resolution-width)//2,56*resolution-height))
  canvas.save(out/f'{prefix}_{frame}.png')
frames('breathe_S_0.png','breathe_S',48,8)
frames('breathe_N_0.png','breathe_N',48,8)
frames('idle_2_1.png','idle_2',24)
print('96 breathing + 24 smiling frames generated; RGB palette unchanged')
