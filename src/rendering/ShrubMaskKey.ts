let nextMaskId=0;
// Allocate when a pool slot is created, not when it first overlaps a character.
export function allocateShrubMaskKey(){return `shrub-overlap-${nextMaskId++}`;}
