const files=import.meta.glob('../../assets/mito/pink-star/{breathe_*,blink_*,idle_2_*}.png',{eager:true,query:'?url&no-inline',import:'default'}) as Record<string,string>;
const smooth=import.meta.glob('../../assets/mito/pink-star/idle-smooth/*.png',{eager:true,query:'?url&no-inline',import:'default'}) as Record<string,string>;
export const IDLE_ASSETS=[...Object.entries(files).filter(([path])=>path.includes('/blink_')),...Object.entries(smooth)].map(([path,url])=>{
 const name=path.split('/').pop()!.replace('.png','');
 return {url,key:name.startsWith('breathe_')?`mito-${name.replaceAll('_','-')}`:name.startsWith('blink_')?`mito-${name.replace('_','-')}`:`mito-idle2-${name.split('_').pop()}`};
});

