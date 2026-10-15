let failed=false;
const panel=()=>document.querySelector<HTMLElement>('#loading-screen');
export function loadingProgress(percent:number,message:string){
 const element=panel();if(!element||failed)return;
 const value=Math.max(0,Math.min(100,percent));
 element.style.setProperty('--progress',`${value}%`);
 element.querySelector('[role="progressbar"]')?.setAttribute('aria-valuenow',String(Math.round(value)));
 element.querySelector('#loading-stage')!.textContent=message;
}
export function finishLoading(){
 if(failed)return;
 loadingProgress(100,'관측 준비 완료');
 const element=panel();if(!element||failed)return;
 element.querySelector('.boot-live')!.textContent='● LIVE';
 element.classList.add('connected');
 const remove=()=>element.remove();
 element.addEventListener('transitionend',remove,{once:true});
 // Fallback for reduced motion or a background tab where transitions do not run.
 setTimeout(remove,450);
}
export function failLoading(){
 const element=panel();if(!element||failed)return;
 element.classList.remove('connected');
 loadingProgress(0,'연결하지 못했습니다. 다시 시도해 주세요.');
 failed=true;
 const button=element.querySelector<HTMLButtonElement>('#loading-retry')!;
 button.hidden=false;button.onclick=()=>location.reload();
}
