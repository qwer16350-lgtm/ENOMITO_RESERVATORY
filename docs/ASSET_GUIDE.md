# Asset Guide v0.1

- 원본: assets-source/mito, terrain, objects, effects, ui
- 런타임: assets/mito, terrain, objects, effects, ui
- 초기 투영: 논리 타일 1×1, 화면 다이아몬드 64×32 픽셀
- 방향: N, NE, E, SE, S, SW, W, NW
- 애니메이션 이름: idle_NE, walk_NE, rest_NE 형식
- 미토 캔버스 크기, 피벗, 프레임 속도는 에셋 제작 전에 확정합니다.
- 런타임 에셋은 src에서 import하거나 public의 정적 파일로 제공해야 합니다. assets 폴더에 넣기만 해서는 빌드에 포함되지 않습니다.

## 임시 캐릭터 8방향

assets/mito/placeholder/idle_N.svg 등 방향별 독립 파일 8개를 사용합니다. 임시 규격은 64×64, 발 기준점은 (32,56)이며 실제 규격 확정 전 교체 가능한 기본값입니다. src/rendering/CharacterAssets.ts에서 방향별 URL, 표시 크기, origin을 관리합니다.

SVG는 같은 파일을 교체하면 됩니다. PNG를 사용하려면 해당 방향 import를 PNG 파일의 ?url import로 변경합니다. 스프라이트 시트/애니메이션은 아직 지원하지 않으며 별도 로더와 프레임 규격을 추가해야 합니다.

방향은 화면 기준 N=위, NE=오른쪽 위, E=오른쪽, SE=오른쪽 아래, S=아래, SW=왼쪽 아래, W=왼쪽, NW=왼쪽 위입니다. 월드 축 방향과 혼동하지 않습니다. 맵 중앙에서 생성된 캐릭터 하나가 8방향 이미지를 공유하며 다마고치 시드가 아닙니다. 이동 중에는 현재 방향 이미지에 작은 흔들림을 주고 휴식 시 직전 N/NE/NW 이동은 N, S/SE/SW 이동은 S 이미지로 정지합니다. E/W 이동 시에는 마지막 정면·후면 계열을 유지합니다. 실제 걷기 프레임 애니메이션은 추후 추가합니다. Entity는 WORLD 좌표와 방향만 가지고, Renderer에서 발 위치 투영과 표시를 담당합니다.

## 폰트 하이어아키

- 큰 제목(h1~h6), 강조(strong/b/.text-emphasis), 프로필 이름과 강조값: Neo둥근모. 기본 제목 32px, 프로필 이름 16px.
- 본문, 버튼, 작은 라벨, 미니맵, Canvas 캐릭터 상태: 갈무리11. 작은 라벨은 12px.
- 두 폰트는 Regular 원본을 사용하며 인위적인 굵기 합성은 비활성화합니다. 굵은 강조는 Neo둥근모로 표현합니다.
- assets/fonts의 WOFF2를 CSS에서 참조하여 빌드에 포함합니다. 게임 시작 전에 폰트를 로드해 Canvas 텍스트에도 적용합니다.
- 공식 출처: https://github.com/neodgm/neodgm-webfont 및 https://github.com/quiple/galmuri (2026-10-03 다운로드).
- 두 폰트의 SIL OFL 1.1 라이선스 전문은 assets/fonts/NeoDunggeunmo-LICENSE.txt와 Galmuri-LICENSE.md에 보존합니다. 배포 시 폰트와 함께 유지합니다.
- 배포용 라이선스는 public/licenses에도 포함하여 dist/licenses로 복사되도록 합니다.
