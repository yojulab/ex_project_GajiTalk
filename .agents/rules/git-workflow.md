# Git 워크플로우 & 업무 종료 커밋 규약 (Git Commit Rules)

본 문서는 `수형 (SOOHYUNG) / 가지톡 (GajiTalk)` 프로젝트에서 모든 에이전트가 작업을 수행하고 종료할 때 준수해야 하는 **Git Commit 표준 지침**이다.

---

## 1. 커밋 시점 및 의무 원칙

### 1-1. 업무 종료 시 Git Commit 필수
- 에이전트는 기획 문서 작성, 아키텍처 명세화, Mongoose 스키마 정의, 프론트엔드/백엔드 구현, 룰 수정, 테스트 시나리오 작성 등 **유의미한 업무 단위를 마칠 때마다 반드시 Git Commit을 수행**해야 한다.
- Ralph Loop 실행 중에도 각 마일스톤이나 서브태스크가 완료되면 즉시 커밋하여 디스크 상에 상태를 영속화(State on Disk)한다.

### 1-2. 원자적 커밋 (Atomic Commits)
- 여러 성격의 작업을 한데 뭉뚱그려 커밋하지 않고, 독립적인 기능/문서 단위별로 원자적으로 커밋한다.
- 커밋 전 `git status`와 `git diff`를 확인하여 의도하지 않은 파일이 포함되지 않았는지 점검한다.

---

## 2. 커밋 메시지 컨벤션

커밋 메시지는 다음 접두어를 사용하여 명확히 기술한다:

| 타입 | 의미 | 예시 |
| :--- | :--- | :--- |
| **`arch:`** | 시스템/데이터베이스/`./apps/` 폴더 아키텍처 설계 | `arch: ./apps 하위 3대 서비스(30018/30019/30020) 및 MongoDB 5대 스키마 수립` |
| **`docs:`** | PRD, 작업지시서, 수목 전지 용어집, 가이드 작성 | `docs: WORK_ORDER.md 기반 조경 전지 용어 사전 및 10대 골든 룰 반영` |
| **`feat:`** | 신규 기능, Canvas 시뮬레이터, 매칭 API, UI 추가 | `feat: BranchOverlayCanvas 가상 가위질 및 6개월~3년 생장 슬라이더 구현` |
| **`rule:`** | 하네스 규칙, 오케스트레이션 파이프라인, 스킬 변경 | `rule: WORK_ORDER.md 맞춤 오케스트레이션 및 하네스 프롬프트 전면 개편` |
| **`test:`** | Playwright E2E 검증 시나리오 및 화면 캡처 추가 | `test: 30018/30019/30020 전 화면 캡처 및 시뮬레이션-매칭 E2E 검증` |
| **`chore:`** | `.gitignore`, 환경변수 템플릿, `run_port.sh` 설정 | `chore: 30018/30019/30020 포트 통합 run_port.sh 및 launch.json 구성` |

---

## 3. 커밋 전 보안 및 무결성 체크리스트

1. **`.env` 파일 배제**: 실제 비밀키(`AI_API_KEY`, `JWT_SECRET` 등)가 담긴 로컬 `.env` 파일이 포함되지 않았는가? (`.gitignore` 적용 여부 확인)
2. **`./apps/` 구조 및 포트 정합성**: 웹·앱·백엔드 코드가 `./apps/{mobile-app,admin-web,backend}` 하위에 위치하며 포트 `30018`, `30019`, `30020` 규격을 준수하는가?
3. **완료 약속 연계**: Ralph Loop 상태 파일([.agents/loop/state.json](file:///apps/ex_project_GajiTalk/.agents/loop/state.json))의 진전 사항과 커밋 내용이 일치하는가?
