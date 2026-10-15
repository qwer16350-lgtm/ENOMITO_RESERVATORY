const files=import.meta.glob('../../assets/objects/nature/shrubs/shrub-*.png',{eager:true,query:'?url&no-inline',import:'default'}) as Record<string,string>;
export const SHRUB_URLS=Array.from({length:5},(_,i)=>files[`../../assets/objects/nature/shrubs/shrub-${i}.png`]!);
