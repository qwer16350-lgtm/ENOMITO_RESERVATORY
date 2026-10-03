# Asset Guide v0.1

- 원본: assets-source/mito, terrain, objects, effects, ui
- 런타임: assets/mito, terrain, objects, effects, ui
- 초기 투영: 논리 타일 1×1, 화면 다이아몬드 64×32 픽셀
- 방향: N, NE, E, SE, S, SW, W, NW
- 애니메이션 이름: idle_NE, walk_NE, rest_NE 형식
- 미토 캔버스 크기, 피벗, 프레임 속도는 에셋 제작 전에 확정합니다.
- 런타임 에셋은 src에서 import하거나 public의 정적 파일로 제공해야 합니다. assets 폴더에 넣기만 해서는 빌드에 포함되지 않습니다.
