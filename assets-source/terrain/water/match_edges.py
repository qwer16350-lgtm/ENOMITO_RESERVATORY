from PIL import Image
p='assets/terrain/water/water-surface.png';im=Image.open(p).convert('RGB');original=im.copy()
for y in range(64):
 for x in range(64):
  xs=[x,63-x] if x<4 or x>=60 else [x]
  ys=[y,63-y] if y<4 or y>=60 else [y]
  colors=[original.getpixel((xx,yy)) for xx in xs for yy in ys]
  im.putpixel((x,y),tuple(round(sum(c[k] for c in colors)/len(colors)) for k in range(3)))
im.save(p)
assert all(im.getpixel((0,y))==im.getpixel((63,y)) for y in range(64))
assert all(im.getpixel((x,0))==im.getpixel((x,63)) for x in range(64))
print('Both periodic texture edges verified')
