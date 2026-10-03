# INOMITO Observatory

Vite + TypeScript + Phaser로 구성한 관측소 개발 시작점입니다.

## 실행

Node.js 24 LTS가 설치된 새 터미널에서 이 폴더로 이동합니다.

```powershell
npm.cmd ci
npm.cmd run dev
```

http://127.0.0.1:5173 에서 확인합니다. 서버 종료는 Ctrl+C입니다. PowerShell 실행 정책을 변경할 필요 없이 npm.cmd를 사용합니다.

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

## Git

저장소는 초기화되어 있으며 자동 커밋이나 원격 저장소 연결은 하지 않습니다. 사용자 정보가 없으면 본인의 값으로 이 저장소에만 설정합니다.

```powershell
git config user.name "본인 이름"
git config user.email "본인 이메일"
```

docs/PIPELINE.md, docs/DATA_SCHEMA.md, docs/ASSET_GUIDE.md를 이후 변경에도 준수합니다. sources의 동기화 자료는 수정하지 않습니다.

## 맵

1024×1024타일의 임시 지형입니다. 화면에 보이는 타일만 그립니다. 드래그로 이동, 휠 또는 버튼으로 50~300% 확대, 맵 중심으로 버튼으로 초기 위치와 확대율에 복귀합니다. 실제 지형 에셋과 다마고치 시드는 아직 적용하지 않았습니다.
