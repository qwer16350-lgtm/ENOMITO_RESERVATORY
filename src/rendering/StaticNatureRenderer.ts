import { groundFootprint, groundAnchor, projectShadowPoint, type GroundFootprint } from './ShadowAnchor';
import Phaser from 'phaser';



import { isoToWorld, worldToIso } from '../world/Projection';
import type { ViewBounds } from '../world/TileMap';
import { WORLD_LIGHT, createTreeShadow, createContactShadow } from './WorldLighting';
interface StaticObject {kind:number;x:number;y:number;scale:number;mirror:boolean}
export interface StaticNatureAssets {prefix:string;urls:string[];sizes:number[];heights:number[];shadowOffset:number;trim:number}
export class StaticNatureRenderer {
  private footprints:GroundFootprint[]=[];
  protected images:Phaser.GameObjects.Image[]=[];
  private shadows:Phaser.GameObjects.Image[]=[];
  private contacts:Phaser.GameObjects.Image[]=[];
  static preload(scene:Phaser.Scene,assets:StaticNatureAssets){assets.urls.forEach((url,kind)=>scene.load.image(`${assets.prefix}-source-${kind}`,url));}
  constructor(protected scene:Phaser.Scene,private assets:StaticNatureAssets,private query:(left:number,top:number,right:number,bottom:number)=>StaticObject[]){
    createContactShadow(scene);
    for(let kind=0;kind<assets.urls.length;kind++){
    const source=scene.textures.get(`${assets.prefix}-source-${kind}`).getSourceImage() as HTMLImageElement;
    const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(source,0,0);
    const rgba=context.getImageData(0,0,canvas.width,canvas.height).data;
    let left=canvas.width,top=canvas.height,right=0,bottom=0;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(rgba[(y*canvas.width+x)*4+3]>=200){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}

      const width=right-left+1,height=bottom-top+1;
      const scale=Math.min(assets.sizes[kind]/width,assets.heights[kind]/height)/2;
      const sprite=document.createElement('canvas');sprite.width=Math.round(width*scale);const fullHeight=Math.round(height*scale);sprite.height=Math.max(1,Math.round(fullHeight*assets.trim));
      const output=sprite.getContext('2d')!;output.imageSmoothingEnabled=false;
      output.drawImage(source,left,top,width,height,0,0,sprite.width,fullHeight);
      const data=output.getImageData(0,0,sprite.width,sprite.height);
      for(let p=0;p<data.data.length;p+=4){data.data[p+3]=data.data[p+3]>=200?255:0;for(let c=0;c<3;c++)data.data[p+c]=Math.min(144,Math.round(data.data[p+c]/8)*8);}
      output.putImageData(data,0,0);
      this.footprints[kind]=groundFootprint(data.data,sprite.width,sprite.height);
      scene.textures.addCanvas(`${assets.prefix}-pixel-${kind}`,sprite)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
      // Match the actual lower silhouette instead of placing a generic ellipse below it.
      const contactCanvas=document.createElement('canvas');contactCanvas.width=sprite.width;contactCanvas.height=sprite.height+3;
      const contactContext=contactCanvas.getContext('2d')!;
      contactContext.fillStyle='#142b28';
      for(let x=0;x<sprite.width;x++){
        for(let y=sprite.height-1;y>=Math.floor(sprite.height*.55);y--){
          if(data.data[(y*sprite.width+x)*4+3]!<128)continue;
          contactContext.globalAlpha=.48;contactContext.fillRect(x,y,1,2);
          contactContext.globalAlpha=.22;contactContext.fillRect(x,y+2,1,1);
          break;
        }
      }
      scene.textures.addCanvas(`${assets.prefix}-contact-${kind}`,contactCanvas)!.setFilter(Phaser.Textures.FilterMode.NEAREST);
      createTreeShadow(scene,sprite,assets.shadowOffset+kind);
      createTreeShadow(scene,sprite,assets.shadowOffset+kind,undefined,true);
    }
  }
  draw(view:ViewBounds){
    const corners=[isoToWorld(view.left-240,view.top-100),isoToWorld(view.right+240,view.top-100),isoToWorld(view.left-240,view.bottom+150),isoToWorld(view.right+240,view.bottom+150)];
    const rocks=this.query(Math.min(...corners.map(p=>p.x)),Math.min(...corners.map(p=>p.y)),Math.max(...corners.map(p=>p.x)),Math.max(...corners.map(p=>p.y)));
    rocks.forEach((rock,i)=>{
      const p=worldToIso(rock.x,rock.y);
      const image=this.images[i]??(this.images[i]=this.scene.add.image(0,0,`${this.assets.prefix}-pixel-${rock.kind}`).setOrigin(.5,1));
      image.setTexture(`${this.assets.prefix}-pixel-${rock.kind}`).setFlipX(rock.mirror).setTint(WORLD_LIGHT.tint).setScale(2*rock.scale).setPosition(p.x,p.y+16).setDepth(p.y+16).setVisible(true);
      const shadow=this.shadows[i]??(this.shadows[i]=this.scene.add.image(0,0,`tree-ground-shadow-${this.assets.shadowOffset+rock.kind}`).setDepth(-99999));
      const footprint=this.footprints[rock.kind];
      const anchor=groundAnchor(footprint,p.x,p.y+16,2*rock.scale,rock.mirror);
      const footX=anchor.localX,anchorX=anchor.x,anchorY=anchor.y;
      const projected=projectShadowPoint(footX,footprint.y,footprint.height);
      shadow.setTexture(`tree-ground-shadow-${this.assets.shadowOffset+rock.kind}${rock.mirror?"-mirror":""}`).setOrigin(projected.x/shadow.width,projected.y/shadow.height).setScale(2*rock.scale).setPosition(anchorX,anchorY).setAlpha(WORLD_LIGHT.castAlpha).setVisible(true);
      const contact=this.contacts[i]??(this.contacts[i]=this.scene.add.image(0,0,`${this.assets.prefix}-contact-${rock.kind}`).setDepth(-99998));
      contact.setTexture(`${this.assets.prefix}-contact-${rock.kind}`).setFlipX(rock.mirror)
        .setOrigin(.5,footprint.height/(footprint.height+3)).setScale(2*rock.scale)
        .setPosition(p.x,p.y+16).setVisible(true);
    });
    for(let i=rocks.length;i<this.images.length;i++){this.images[i].setVisible(false);this.shadows[i].setVisible(false);this.contacts[i].setVisible(false);}
    this.scene.game.canvas.dataset[this.assets.prefix+'Count']=String(rocks.length);
  }
}
