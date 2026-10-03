# Development Pipeline v0.1

1. 작업 범위와 데이터 계약을 먼저 확인합니다.
2. 데이터 → World State → Simulation → Renderer 흐름을 유지합니다.
3. core/world/entities/behavior/events/camera/ui/save의 책임을 분리합니다.
4. GRID 주소, 연속 WORLD 좌표, 투영 ISOMETRIC 픽셀, 카메라 적용 SCREEN 픽셀을 구분합니다.
5. 변경 후 npm run check, npm test 및 npm run build를 수행하고 npm run dev로 화면을 확인합니다.
6. 새 규격과 변경 사항을 docs에 함께 기록합니다.

맵은 1024×1024타일(1,048,576칸), 유효 GRID 주소는 각 축 0~1023입니다. 균일한 임시 지형을 사용하며 전체 개체 배열을 만들지 않습니다. 카메라 사각형을 역투영해 후보 범위를 계산한 뒤 화면과 겹치는 타일만 그립니다. 카메라가 변경될 때만 그리기 명령을 갱신합니다. 32칸 간격의 밝은 선은 위치 파악용입니다.

드래그 이동, 휠/버튼 확대(0.5~3배), 중심 복귀를 지원합니다. 카메라 중심을 맵의 유효 WORLD 범위 안으로 제한합니다. 맵 모서리에서 화면에 배경이 보일 수 있습니다. 초기 카메라는 맵 중앙을 봅니다. 행동, 저장, 알림, PWA 및 실제 시드 주입은 아직 구현하지 않았습니다.
