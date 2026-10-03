# INOMITO Observatory 작업 규칙

- 변경 전에 docs/PIPELINE.md, docs/DATA_SCHEMA.md, docs/ASSET_GUIDE.md를 확인합니다.
- 데이터, 시뮬레이션, 렌더링 책임과 좌표계를 분리합니다.
- 실제 다마고치 인계 스키마를 확인하기 전에는 임의 데이터를 실제 시드로 주입하지 않습니다.
- 기능 범위를 확장하거나 규격을 바꾸면 docs도 갱신합니다.
- 변경 후 npm.cmd run check 및 npm.cmd run build를 실행하고 화면에 영향을 주는 변경은 브라우저에서도 검증합니다.
- 상위 프로젝트의 sources/ 동기화 자료는 읽기 전용입니다.
