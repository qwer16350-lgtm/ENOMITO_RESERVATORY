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

## 잔디 타일 5종

현재 런타임은 assets/terrain/grass-native-{plain,tuft,flowers,shrub,tall}.png를 사용합니다. 각 PNG의 실제 해상도는 64×32이고 상단 중앙 기준으로 표시합니다. 풀잎은 연결된 픽셀 묶음, 꽃은 꽃잎/중심/줄기, 관목은 음영이 있는 작은 덩어리로 원본 격자에서 직접 제작했습니다. 런타임 축소, 색상 치환, 디테일 제거는 하지 않습니다.
모든 타일은 #526d32 바탕과 동일한 투명 다이아몬드 경계로 제작되며 장식은 경계 안에 머뭅니다. 화면 보간과 텍스처 필터는 nearest/pixelated입니다. WORLD 주소 기반 선택 비율은 기본 68%, 작은 풀 16%, 꽃 7%, 관목 3%, 키 큰 풀 6%입니다. 기존 고해상도 grass*.png는 참고용이며 게임에서 사용하지 않습니다.
기본 잔디 밀도는 모든 5종에 촘촘한 엇갈린 풀잎 묶음을 추가하여 높였습니다. 기존 꽃/관목 픽셀과 공통 경계는 보존합니다. 꽃/관목 타일 선택 비율은 그대로 유지합니다.
외곽의 빈 잔디 띠를 제거했습니다. 외곽 풀 무늬는 8×4 픽셀 주기를 공유하며 아이소메트릭 인접 오프셋 (±32,16)에서 같은 위상으로 이어집니다. 투명 다이아몬드 밖은 유지합니다.

## 자연물 · 나무
assets/objects/nature/trees/tree-0.svg~tree-4.svg는 크기별 픽셀 스타일 나무입니다. 표시 크기는 96×144, 84×124, 72×104, 60×84, 48×64이며 밑동 중심 기준입니다. 자연물은 바닥 타일과 별도 에셋입니다. 가장 큰 나무는 단독, 나머지는 크기가 작을수록 군집 개체 수와 밀도가 증가합니다. 밑동 WORLD 충돌 반경은 0.85/0.65/0.5/0.38/0.28, 캐릭터 반경은 0.22입니다. 수관은 통과 불가 영역이 아닌 시각적 가림 영역입니다.

나무 비주얼은 줄무늬 블록에서 겹치는 수관 덩어리, 잎 하이라이트, 가지, 껍질 및 밑동 그림자를 갖는 픽셀 스타일로 개선했습니다. 크기/피벗/충돌 반경과 군집 배치는 유지합니다. tree-1은 침엽수, tree-3은 밝은 껍질과 밝은 잎의 변형입니다.

### 나무 비주얼 v2

현재 사용 파일은 tree-0.png~tree-4.png입니다. 기본 이미지 생성 도구로 큰 고목, 침엽수, 작은 단풍형 나무, 자작나무, 어린 묘목을 각각 제작합니다. 공통 프롬프트: "Polished isometric pixel-art tree sprite, organic silhouette, overlapping foliage clusters, upper-left lighting, shaded underside, visible branches and textured bark, transparent background, no ground tile or text."
SVG는 이전 참고 에셋입니다. PNG의 투명 여백만 프레임에서 제외하고 원본 비율을 유지해 각 크기 상자 안에 맞춥니다. 잎 색상을 치환하거나 픽셀을 삭제하지 않습니다. 군집/충돌/깊이 정렬 규칙은 유지합니다.
나무 비주얼 v2의 과도한 세밀함은 런타임 픽셀 격자를 게임 기준 2px 간격으로 맞춰 조정했습니다. 실루엣/가지/입체 음영은 보존하며 RGB를 16단계 간격으로 가볍게 묶고 반투명 외곽은 선명하게 처리합니다. 원본 PNG는 보존합니다.
나무 크기를 이전 대비 약 2.2배로 확대했습니다. 햇빛 하이라이트는 런타임에서 제거하고 잎은 차분한 중간 녹색/어두운 가림색, 껍질은 무광 중간색으로 표시합니다. 밑동 충돌 반경은 2배, 군집 반경은 70%로 줄였습니다. 화면 밖 큰 수관도 잘리지 않도록 조회 여백을 확대했습니다.
나무의 무광 녹색을 기준으로 잔디 팔레트를 낮췄습니다. 바탕 #3e512f, 어두운 풀 #2d3f28, 중간 풀 #536b3d, 밝은 풀 #728853입니다. 꽃도 같은 분위기로 채도를 낮췄고 모양/밀도/외곽 연결은 유지합니다.

줄기는 원본의 껍질 결/가지 접합부/뿌리 틈을 구분하기 위해 무광 갈색 4단계(#31271e, #483323, #5e432c, #725236)를 사용합니다. 가장 밝은 단계도 중간 갈색으로 제한하며 햇빛 하이라이트는 복원하지 않습니다. 자작나무 껍질은 별도의 차분한 3단계입니다.
달리기: run_{NE,E,SE,SW,W,NW}_{0..3}.svg, 64×64, 기존 피벗, 75ms 프레임. N/S는 기존 에셋 유지.
접촉 표시: assets/ui/tree-bubble.svg (40×32), tree-axe.svg (20×22). 각진 픽셀 윤곽, nearest 필터, 머리 위 밑중앙 피벗. 도끼는 110ms마다 4단계 자세를 반복합니다.
접촉 말풍선은 원래 이미지 중심 위치를 유지한 채 가로/세로 2배(80×64)로 표시합니다. 도끼 표시 크기와 위치는 유지합니다.
말풍선 v2: 80×64 원본 픽셀 SVG를 0.8배로 표시(64×51.2, 직전 표시 대비 80%). 중심과 도끼 크기/위치는 유지합니다. 계단형 모서리, 이중 테두리, 위쪽 밝은 림, 아래쪽 음영 및 꼬리 음영을 사용합니다.
도끼 v2: 20×22 크기를 유지한 채 날의 베벨/금속 명암, 결합부 및 자루 결을 추가했습니다. 애니메이션 중심을 기존보다 월드 화면 기준 10px 위로 이동합니다.
도끼 위치를 v2 위치에서 5px 아래로 조정했습니다. 크기와 동작은 유지합니다.
말풍선 꼬리를 분리된 크기 다른 픽셀 동그라미 두 개로 교체했습니다. 속마음/상상 말풍선 형태이며 전체 크기, 도끼 위치, 등장/퇴장과 둥실거림은 유지합니다.
WorldLighting: 공통 tint #f3f1e8, 그림자 #142b28, 나무 투영 그림자 alpha 24%. 별도 방향성 잎 하이라이트는 복원하지 않습니다. 그림자는 정적 PNG 실루엣을 투영한 공유 캔버스 텍스처이며 매 프레임 재생성하지 않습니다.
지면 그림자 농도를 50% 높였습니다: 나무 투영 alpha 24%→36%, 공통 접촉 그림자의 각 층 alpha 12/18/30%→18/27/45%.
런타임 나무 레이어: tree-wood-{0..4} (밑동/줄기/가지), tree-leaves-{종류}-{0..71} (잎만). 동일 크기와 밑중앙 피벗. 초록색 조건을 보수적으로 분류하여 갈색 목질부와 자작나무 껍질은 잎 효과에서 제외합니다. 원본 5종 PNG는 분리 전 소스로 유지합니다.
목질부 전용 실제 PNG 프레임: assets/objects/nature/trees/wood-animation/tree-{0..4}-wood-{0..11}.png. 각 종류 12프레임, 동일 크기/밑동 피벗, 기존 팔레트 유지. 하단 32%와 중앙 굵은 줄기는 고정하며 상단 가지 연결 덩어리는 최대 ±1 텍스처px 이동, 연결부는 원래 색으로 보정합니다. 제작/검증 스크립트는 assets-source/objects에 있습니다. 원본 tree-0.png~tree-4.png는 수정하지 않았습니다.
목질부 애니메이션 v2는 원본 격자를 nearest로 4배 확장한 36프레임/종류입니다. 원래 RGB/alpha 팔레트는 유지하고 가지의 이동 간격은 기존 텍스처 기준 1/4px입니다. 표시 배율은 1/4로 보정해 나무 크기는 유지합니다. 하단 32% 고정, 그림자는 같은 36프레임을 72개 잎 프레임에 대응합니다.
목질부 프레임을 36→72개/종류로 늘렸습니다. 전체 360개. 4배 격자, 표시 크기와 팔레트, 밑동 고정은 유지하며 재생 속도는 원래대로 복원했습니다. 목질부/잎/그림자는 같은 72개 프레임 인덱스를 사용합니다.
자연/바위: assets/objects/nature/rocks/boulder.png. 기본 image_gen 도구로 나무 원본을 스타일 참조로 제작했습니다. 프롬프트: isometric coarse pixel-art matte gray-green granite boulder, fractured planes, moss cracks, transparent background, no ground tile or cast shadow. 투명 PNG 원본을 보존하고 런타임 2px 격자/차분한 팔레트/nearest로 나무 밀도에 맞춥니다. 한 원본의 크기 3종(160/132/110 폭)을 사용합니다.
바위의 둥근 하단 12%를 런타임 표시에서 수평으로 잘라 지면에 묻힌 형태로 표시합니다. 원본 PNG는 보존합니다. 바닥선을 그림자 접지 기준으로 쓰고 2px 겹치게 배치합니다. 접촉 그림자는 바닥 폭 85%/높이 16%로 맞춥니다.
핑크 별 캐릭터: 사용자 정면 원본을 identity reference로 기본 image_gen 도구에서 8방향 turnaround와 달리기 시트를 제작했습니다. 프롬프트 요지: exact translucent glossy pink rounded star mascot, magenta sparkle eyes, diamond cheeks, no limbs/mouth/clothes, 8 isometric directions, blank back, jelly squash-and-hop run, transparent sprite sheets. 원본/reference-front와 생성 idle/run 시트는 assets-source/mito/pink-star에 보존합니다. 런타임 assets/mito/pink-star/idle_{N,NE,E,SE,S,SW,W,NW}.png 및 run_{방향}_{0..3}.png: 전부 64×64, 발 피벗 (32,56), 방향별 4프레임 75ms. 연결된 주 실루엣 추출로 생성 시트의 배경 잔점을 제거하고 nearest 축소했습니다. 이전 placeholder SVG는 참고용으로 보존합니다.
핑크 별 idle 애니메이션: breathe_S_{0..3}, breathe_N_{0..3}, blink_{0..3}, idle_2_{0..3}.png. 기본 image_gen 도구에서 기존 정면/후면 PNG를 identity reference로 4×4 시트를 제작했습니다. 프롬프트: exact glossy pink star, subtle breathing front/back, occasional blink, front happy smile, common baseline, transparent separated sprite cells. 원본 생성 시트는 assets-source/mito/pink-star/idle-animation-sheet.png에 보존하고 런타임은 기존 64×64/발 (32,56) 규격입니다.
지형/물: assets/terrain/water/water-surface.png, 64×64 반복 수면 원본 텍스처. 기본 image_gen 프롬프트: seamless top-down chunky pixel freshwater, muted matte teal, subtle ripples, no shore/ground/text. 생성 원본은 assets-source/terrain/water/water-source.png에 보존합니다. opposite edge 4px 패턴을 맞추고 런타임에서는 WORLD 좌표로 반복합니다. 해안선은 WaterTiles의 signed-distance 마스크로 모든 연결 형태를 생성하며 고정된 코너 파일에 의존하지 않습니다. 은은한 얕은 물과 젖은 흙 2단계 경계가 잔디와 연결됩니다.
수생/물가 장식: assets/terrain/aquatic/{lily-pads,lotus,duckweed,cattails}.png와 assets/terrain/shore/{pebbles,sedge}.png. 기본 image_gen 도구로 동일한 픽셀 스타일의 2×3 투명 atlas를 제작했습니다. 프롬프트: isometric chunky matte woodland aquatic plants lily pads/lotus/duckweed/cattails and shore pebbles/sedge, separate sprites, transparent, no ground or shadow. 생성 원본과 런타임 분리 제작 스크립트는 assets-source/terrain/aquatic에 보존합니다. 표시 격자는 기존 지형/나무와 같은 약2px이며 수련류에는 작은 수면 부유 움직임을 적용합니다.
구름 그림자10종은 CloudShadowRenderer에서 256×128 캔버스의 부드러운 겹침 음영으로 생성하는 코드 기반 효과입니다. 공유 텍스처10장, LINEAR 필터, 개체 alpha8~12.5%를 사용하며 실제 흰 구름 이미지는 표시하지 않습니다.

## 에셋 모듈과 수정 위치

실제 이미지 파일은 assets/, 제작 원본·생성 도구는 assets-source/, 런타임 에셋 목록과 준비 처리는 src/assets/에 둡니다.

- CharacterAssets.ts: 8방향 기본 이미지와 표시 크기·발 피벗.
- IdleAssets.ts / RunAssets.ts / WoodAnimationAssets.ts: 대기·달리기·목질부 이미지 목록.
- AnimationConfig.ts: 미토 애니메이션 프레임 수, 시간, 웃음 진입·복귀 순서와 발생 간격.
- IdleOutline.ts: 대기 외곽선 색보정. 원본 파일을 덮어쓰지 않습니다.
- TerrainAssets.ts: 잔디5종 파일 목록과 공통 색보정. 물가 합성도 같은 텍스처를 사용합니다.

동일 규격 파일 교체는 assets/에서 진행합니다. 프레임 수를 바꾸면 AnimationConfig.ts와 assets-source/mito/build_smooth_idle.py의 생성 개수를 함께 맞추고 npm test 및 npm run build로 확인합니다. Renderer는 에셋 준비 처리가 아닌 배치·깊이·현재 프레임 표시를 담당합니다. 기존 자연물·수면의 전용 생성 모듈은 유지합니다.
돌5종: 기존 boulder.png가 최대160×112, 추가 boulder-1~4.png는 판석138×78/갈라진 돌120×98/둥근 돌104×74/돌무더기88×58 상한입니다. imagegen으로 기존 돌 화풍을 참조해 개별 제작하고 RockAssets에서 목록을 관리합니다. 런타임 nearest/공통 팔레트/밑면 절단을 공유합니다.
관목5종은 assets/objects/nature/shrubs/shrub-0~4.png(둥근 관목/고사리형/직립형/꽃관목/열매관목)이며 imagegen으로 각각 제작했습니다. ShrubAssets에서 파일 목록, Shrubs에서 종류별 상한 크기를 수정합니다. 자연물 공통 nearest/팔레트 처리와 그림자를 공유합니다.
맨땅/흙은 assets/terrain/ground/{bare,dirt}.png를 imagegen으로 개별 제작했습니다(올리브 맨땅/따뜻한 갈색 흙, 식물 없는 seamless pixel ground). GroundAssets에서 경로를 관리하고64×64 반복 패턴을 WORLD 좌표로 투영해64×32 타일에 합성합니다.
맨땅은 올리브 흙이 아니라 풀잎이 없는 짙은 초록 바탕으로 수정했습니다. GroundTiles에서 bare 패턴의 명암만 이용해 forest-green 팔레트로 변환하고 미니맵도 같은 계열로 표시합니다.
GroundDecorations는 기본 잔디와 꽃/풀뭉치 타일의 공통 픽셀을 제거해 투명 장식 에셋2종을 정확히 추출합니다. 기존 색보정 후의 픽셀을 사용해 원래 표시색을 유지합니다. 맨땅 장식 선택은 시드+타일 해시로 꽃9%/풀뭉치8%/없음83%이며 흙 지형에는 합성하지 않습니다.
