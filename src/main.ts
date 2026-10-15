import {loadingProgress,failLoading} from './ui/LoadingScreen';
import './style.css';
import { createGame } from './core/Game';

// Canvas text must be created after the bundled web fonts are available.
async function startGame(): Promise<void> {
  await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  loadingProgress(2,'관측 장치를 켜는 중');
  await Promise.all([
    document.fonts.load('12px Galmuri11', '미토 이동 휴식'),
    document.fonts.load('16px NeoDunggeunmo', '미토 관측소'),
  ]);
  createGame('game');
}

void startGame().catch((error: unknown) => {
  console.error('관측소 시작 실패', error);
  failLoading();
  const status = document.querySelector('#status');
  if (status) status.textContent = '화면을 불러오지 못했습니다. 새로고침해 주세요.';
});
