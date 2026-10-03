# Development Pipeline v0.1

1. 작업 범위와 데이터 계약을 먼저 확인합니다.
2. 데이터 → World State → Simulation → Renderer 흐름을 유지합니다.
3. core/world/entities/behavior/events/camera/ui/save의 책임을 분리합니다.
4. GRID 주소, 연속 WORLD 좌표, 투영 ISOMETRIC 픽셀, 카메라 적용 SCREEN 픽셀을 구분합니다.
5. 변경 후 npm run check 및 npm run build를 수행하고 npm run dev로 화면을 확인합니다.
6. 새 규격과 변경 사항을 docs에 함께 기록합니다.

현재는 개발환경 검증용 정적 타일 화면만 있습니다. 행동, 저장, 알림, PWA 및 실제 시드 주입은 아직 구현하지 않았습니다. 테스트는 기능 추가 시 동작 규칙을 검증하도록 작성합니다.
