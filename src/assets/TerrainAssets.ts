import Phaser from 'phaser';
import plain from '../../assets/terrain/grass-native-plain.png?url';
import tuft from '../../assets/terrain/grass-native-tuft.png?url';
import flowers from '../../assets/terrain/grass-native-flowers.png?url';
import shrub from '../../assets/terrain/grass-native-shrub.png?url';
import tall from '../../assets/terrain/grass-native-tall.png?url';

export const GRASS_URLS = [plain, tuft, flowers, shrub, tall];


export function prepareGrassTextures(scene:Phaser.Scene){
    // Grade shared grass textures once so dry tiles and shoreline composites match.
    GRASS_URLS.forEach((_url,i)=>{
      const key=`terrain-grass-${i}`,source=scene.textures.get(key).getSourceImage();
      if(source instanceof HTMLCanvasElement)return;
      const canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
      const context=canvas.getContext('2d')!;context.drawImage(source as HTMLImageElement,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height);
      for(let p=0;p<pixels.data.length;p+=4){
        if(!pixels.data[p+3])continue;
        const r=pixels.data[p]!,g=pixels.data[p+1]!,b=pixels.data[p+2]!;
        // Apply to foliage tones; retain flowers and other colored details.
        if(g>=r*.95&&g>b*1.12){
          pixels.data[p]=Math.min(255,Math.round(r*1.12+5));
          pixels.data[p+1]=Math.min(255,Math.round(g*1.10+4));
          pixels.data[p+2]=Math.min(255,Math.round(b*1.04+1));
        }
      }
      context.putImageData(pixels,0,0);scene.textures.remove(key);scene.textures.addCanvas(key,canvas);
    });
}
