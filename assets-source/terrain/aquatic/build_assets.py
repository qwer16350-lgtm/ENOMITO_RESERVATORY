from PIL import Image
from pathlib import Path
root=Path(__file__).resolve().parents[3]
im=Image.open(root/'assets-source/terrain/aquatic/source-sheet.png').convert('RGBA')
names=['lily-pads','lotus','duckweed','cattails','pebbles','sedge']
sizes=[(48,28),(48,42),(36,22),(40,64),(32,22),(32,40)]
for i,name in enumerate(names):
 row,col=divmod(i,2);tile=im.crop((round(col*im.width/2),round(row*im.height/3),round((col+1)*im.width/2),round((row+1)*im.height/3)))
 if i==3:tile=im.crop((round(im.width/2),round(im.height*.28),im.width,round(im.height*.66)))
 if i==5:tile=im.crop((round(im.width/2),round(im.height*.65),im.width,im.height))
 bbox=tile.getchannel('A').point(lambda a:255 if a>=170 else 0).getbbox();tile=tile.crop(bbox)
 width,height=sizes[i];scale=min(width/tile.width,height/tile.height)/2
 tile=tile.resize((max(1,round(tile.width*scale)),max(1,round(tile.height*scale))),Image.Resampling.NEAREST)
 data=[]
 for r,g,b,a in tile.get_flattened_data():data.append((min(170,round(r/8)*8),min(170,round(g/8)*8),min(160,round(b/8)*8),255 if a>=170 else 0))
 tile.putdata(data);tile.save(root/f'assets/terrain/{"aquatic" if i<4 else "shore"}/{name}.png')
print('4 aquatic plants + 2 shore decoration sprites exported')

