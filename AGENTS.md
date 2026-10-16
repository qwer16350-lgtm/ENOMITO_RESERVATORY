# INOMITO Observatory 작업 규칙

- 변경 전에 docs/PIPELINE.md, docs/DATA_SCHEMA.md, docs/ASSET_GUIDE.md를 확인합니다.
- 데이터, 시뮬레이션, 렌더링 책임과 좌표계를 분리합니다.
- 실제 다마고치 인계 스키마를 확인하기 전에는 임의 데이터를 실제 시드로 주입하지 않습니다.
- 기능 범위를 확장하거나 규격을 바꾸면 docs도 갱신합니다.
- 변경 후 npm.cmd run check 및 npm.cmd run build를 실행하고 화면에 영향을 주는 변경은 브라우저에서도 검증합니다.
- 상위 프로젝트의 sources/ 동기화 자료는 읽기 전용입니다.

## 버전 업로드 규칙

- 사용자가 업로드를 요청하면 main에서 package.json과 package-lock.json의 버전을 함께 갱신합니다.
- 직전 업로드 이후 변경사항을 CHANGELOG.md에 날짜/추가/개선/수정으로 취합합니다. 변경 규모에 맞춰 semantic version을 선택합니다.
- check/test/build 통과 후 커밋하고 같은 버전의 annotated Git 태그(vX.Y.Z)를 생성해 main과 태그를 함께 업로드합니다.
- 기존 태그를 변경하거나 덮어쓰지 않습니다.
