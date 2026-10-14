from PIL import Image
from pathlib import Path
import math,json
root=Path(__file__).resolve().parents[2]
out=root/'assets/objects/nature/trees/wood-animation'
sizes=[212,185,159,132,106]; heights=[317,273,229,185,141]
report=[]
for kind in range(5):
 im=Image.open(root/f'assets/objects/nature/trees/tree-{kind}.png').convert('RGBA')
 bbox=im.getchannel('A').point(lambda a:255 if a>=64 else 0).getbbox(); im=im.crop(bbox)
 scale=min(sizes[kind]/im.width,heights[kind]/im.height)/2
 im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST)
 wood=Image.new('RGBA',(im.width+4,im.height)); w,h=wood.size
 for y in range(h):
  for x in range(im.width):
   r,g,b,a=im.getpixel((x,y))
   if a<128 or (g>=r*.9 and g>b*1.1):continue
   if kind==3 and abs(r-g)<25 and r>100: color=(105,104,88) if r<145 else (125,124,106) if r<190 else (143,141,119)
   else:color=(49,39,30) if r<65 else (72,51,35) if r<105 else (94,67,44) if r<145 else (114,82,54)
   wood.putpixel((x+2,y),(*color,255))
 # Keep the lower body and central stem unchanged. Move whole upper branch components.
 movable={(x,y) for y in range(int(h*.68)) for x in range(w) if wood.getpixel((x,y))[3] and abs(x-w/2)>max(2,w*.055)}
 groups=[]
 while movable:
  seed=movable.pop(); group=[seed]; stack=[seed]
  while stack:
   x,y=stack.pop()
   for dy in (-1,0,1):
    for dx in (-1,0,1):
     p=(x+dx,y+dy)
     if p in movable:movable.remove(p);group.append(p);stack.append(p)
  if len(group)>=4:groups.append(group)
 changed=0
 resolution=4
 high_base=wood.resize((w*resolution,h*resolution),Image.Resampling.NEAREST)
 for frame in range(72):
  result=high_base.copy()
  for i,group in enumerate(groups):
   phase=frame/72*math.tau+(i%3-1)*.35
   offset=round(math.sin(phase)*resolution)
   if not offset:continue
   for x,y in group:
    for yy in range(y*resolution,(y+1)*resolution):
     for xx in range(x*resolution,(x+1)*resolution):result.putpixel((xx,yy),(0,0,0,0))
   for x,y in group:
    for yy in range(y*resolution,(y+1)*resolution):
     for xx in range(x*resolution,(x+1)*resolution):
      if 0<=xx+offset<w*resolution:result.putpixel((xx+offset,yy),wood.getpixel((x,y)))
   # One-pixel bridge at each original connection, using the exact bark palette.
   occupied=set(group)
   for x,y in group:
    if any(0<=x+dx<w and 0<=y+dy<h and (x+dx,y+dy) not in occupied and wood.getpixel((x+dx,y+dy))[3] for dx,dy in ((0,1),(0,-1),(1,0),(-1,0))):
     for yy in range(y*resolution,(y+1)*resolution):
      for xx in range(x*resolution,(x+1)*resolution):result.putpixel((xx,yy),wood.getpixel((x,y)))
  changed=max(changed,sum(a!=b for a,b in zip(high_base.get_flattened_data(),result.get_flattened_data())))
  result.save(out/f'tree-{kind}-wood-{frame}.png')
 high_base.save(out/f'tree-{kind}-wood-base.png')
 report.append(dict(kind=kind,width=w*resolution,height=h*resolution,branchGroups=len(groups),maxChangedPixels=changed,frames=72,resolution=resolution))
(out/'manifest.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))


