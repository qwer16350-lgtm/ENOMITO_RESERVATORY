import { groundFootprint, projectShadowPoint, type GroundFootprint } from './ShadowAnchor';
import Phaser from 'phaser';
import rockUrl from '../../assets/objects/nature/rocks/boulder.png?url&no-inline';
import { NatureWorld } from '../world/NatureWorld';
import { ROCK_SIZES, ROCK_HEIGHTS } from '../world/Rocks';
import { isoToWorld, worldToIso } from '../world/Projection';
import type { ViewBounds } from '../world/TileMap';
import { WORLD_LIGHT, createTreeShadow, createContactShadow } from './WorldLighting';
export class RockRenderer {
  private footprints:GroundFootprint[]=[];
  private images:Phaser.GameObjects.Image[]=[];
  private shadows:Phaser.GameObjects.Image[]=[];
  private contacts:Phaser.GameObjects.Image[]=[];
  static preload(scene:Phaser.Scene){scene.load.image('rock-source',rockUrl);}
  constructor(private scene:Phaser.Scene,private world:NatureWorld){
    createContactShadow(scene);
    const source=scene.textures.get('rock-source').getSourceImage() as HTMLImageElement;
    const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(source,0,0);
    const rgba=context.getImageData(0,0,canvas.width,canvas.height).data;
    let left=canvas.width,top=canvas.height,right=0,bottom=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(rgba[(y*canvas.width+x)*4+3]>=200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    for(let kind=0;kind<3;kind++){
      const width=right-left+1,height=bottom-top+1;
      const scale=Math.min(ROCK_SIZES[kind]/width,ROCK_HEIGHTS[kind]/height)/2;
      const sprite=document.createElement('canvas');sprite.width=Math.round(width*scale);const fullHeight=Math.round(height*scale);sprite.height=Math.max(1,Math.round(fullHeight*.88));
      const output=sprite.getContext('2d')!;output.imageSmoothingEnabled=false;
      output.drawImage(source,left,top,width,height,0,0,sprite.width,fullHeight);
      const data=output.getImageData(0,0,sprite.width,fullHeight);
      for(let p=0;p<data.data.length;p+=4){data.data[p+3]=data.data[p+3]>=200?255:0;for(let c=0;c<3;c++)data.data[p+c]=Math.min(144,Math.round(data.data[p+c]/8)*8);}
      output.putImageData(data,0,0);
      this.footprints[kind]={...groundFootprint(data.data,sprite.width,sprite.height),y:sprite.height};
      scene.textures.addCanvas(`rock-pixel-${kind}`,sprite)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
      createTreeShadow(scene,sprite,100+kind);
      createTreeShadow(scene,sprite,100+kind,undefined,true);
    }
  }
  draw(view:ViewBounds){
    const corners=[isoToWorld(view.left-240,view.top-100),isoToWorld(view.right+240,view.top-100),isoToWorld(view.left-240,view.bottom+150),isoToWorld(view.right+240,view.bottom+150)];
    const rocks=this.world.queryRocks(Math.min(...corners.map(p=>p.x)),Math.min(...corners.map(p=>p.y)),Math.max(...corners.map(p=>p.x)),Math.max(...corners.map(p=>p.y)));
    rocks.forEach((rock,i)=>{
      const p=worldToIso(rock.x,rock.y);
      const image=this.images[i]??(this.images[i]=this.scene.add.image(0,0,`rock-pixel-${rock.kind}`).setOrigin(.5,1));
      image.setTexture(`rock-pixel-${rock.kind}`).setFlipX(rock.mirror).setTint(WORLD_LIGHT.tint).setScale(2).setPosition(p.x,p.y+16).setDepth(p.y+16).setVisible(true);
      const shadow=this.shadows[i]??(this.shadows[i]=this.scene.add.image(0,0,`tree-ground-shadow-${100+rock.kind}`).setDepth(-99999));
      const footprint=this.footprints[rock.kind];
      const footX=rock.mirror?footprint.width-footprint.x:footprint.x;
      const anchorX=p.x+(footX-footprint.width/2)*2,anchorY=p.y+14;
      const projected=projectShadowPoint(footX,footprint.y,footprint.height);
      shadow.setTexture(`tree-ground-shadow-${100+rock.kind}${rock.mirror?"-mirror":""}`).setOrigin(projected.x/shadow.width,projected.y/shadow.height).setScale(2).setPosition(anchorX,anchorY).setAlpha(WORLD_LIGHT.castAlpha).setVisible(true);
      const contact=this.contacts[i]??(this.contacts[i]=this.scene.add.image(0,0,'ground-contact-shadow').setDepth(-99998));
      contact.setPosition(anchorX,anchorY).setDisplaySize(ROCK_SIZES[rock.kind]*.85,ROCK_SIZES[rock.kind]*.16).setVisible(true);
    });
    for(let i=rocks.length;i<this.images.length;i++){this.images[i].setVisible(false);this.shadows[i].setVisible(false);this.contacts[i].setVisible(false);}
    this.scene.game.canvas.dataset.visibleRocks=String(rocks.length);
  }
}



