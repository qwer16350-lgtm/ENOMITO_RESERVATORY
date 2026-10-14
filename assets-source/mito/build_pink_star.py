from PIL import Image,ImageDraw
from pathlib import Path
import statistics,json
root=Path(__file__).resolve().parents[2]
source=root/'assets-source/mito/pink-star'
out=root/'assets/mito/pink-star'
directions=['N','NE','E','SE','S','SW','W','NW']
def cells(name,cols,rows):
 import numpy as np
 from collections import deque
 im=Image.open(source/name).convert('RGBA');pixels=np.array(im);mask=pixels[:,:,3]>=160
 height,width=mask.shape;labels=np.zeros(mask.shape,dtype=np.int32);components=[];identity=0
 for y,x in zip(*np.nonzero(mask)):
  if labels[y,x]:continue
  identity+=1;labels[y,x]=identity;queue=deque([(int(x),int(y))]);area=0;left=right=int(x);top=bottom=int(y)
  while queue:
   xx,yy=queue.popleft();area+=1;left=min(left,xx);right=max(right,xx);top=min(top,yy);bottom=max(bottom,yy)
   for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
    if 0<=nx<width and 0<=ny<height and mask[ny,nx] and not labels[ny,nx]:labels[ny,nx]=identity;queue.append((nx,ny))
  components.append((area,identity,left,top,right+1,bottom+1))
 chosen=sorted(components,reverse=True)[:cols*rows]
 if len(chosen)!=cols*rows:raise ValueError('Sprite count mismatch')
 chosen.sort(key=lambda c:(c[3]+c[5])/2)
 ordered=[]
 for row in range(rows):ordered.extend(sorted(chosen[row*cols:(row+1)*cols],key=lambda c:c[2]))
 result=[]
 for area,identity,left,top,right,bottom in ordered:
  tile=pixels[top:bottom,left:right].copy();tile[labels[top:bottom,left:right]!=identity]=0
  result.append(Image.fromarray(tile))
 return result
def render(tile,scale,bounce=0):
 canvas=Image.new('RGBA',(64,64));w=max(1,round(tile.width*scale));h=max(1,round(tile.height*scale))
 tile=tile.resize((w,h),Image.Resampling.NEAREST)
 # Keep only the crisp sprite silhouette; transparent source sheets remain archived.
 rgba=list(tile.get_flattened_data());tile.putdata([(r,g,b,255 if a>=160 else 0) for r,g,b,a in rgba])
 canvas.alpha_composite(tile,((64-w)//2,56-h+bounce))
 return canvas
idle=cells('idle-sheet.png',4,2)
scale=min(52/max(t.width for t in idle),50/max(t.height for t in idle))
for direction,tile in zip(directions,idle):render(tile,scale).save(out/f'idle_{direction}.png')
run=cells('run-sheet.png',4,8)
scale=min(56/max(t.width for t in run),50/max(t.height for t in run))
for row,direction in enumerate(directions):
 for frame in range(4):render(run[row*4+frame],scale,[0,-2,-4,-2][frame]).save(out/f'run_{direction}_{frame}.png')
preview=Image.new('RGBA',(64*8,64*5))
for col,d in enumerate(directions):
 preview.alpha_composite(Image.open(out/f'idle_{d}.png'),(col*64,0))
 for f in range(4):preview.alpha_composite(Image.open(out/f'run_{d}_{f}.png'),(col*64,(f+1)*64))
preview.save(out/'preview.png')
(out/'manifest.json').write_text(json.dumps({'directions':directions,'canvas':[64,64],'foot':[32,56],'idleFrames':8,'runFramesPerDirection':4,'source':'user supplied pink star mascot'},indent=2),encoding='utf-8')
print('8 idle + 32 running frames exported')


