# AGENTS.md — 에이전트 팀 행동 강령 및 표준 지침 (`수형 / 가지톡` 플랫폼)

본 워크스페이스는 [GEMINI.md](file:///apps/ex_project_GajiTalk/GEMINI.md), [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md), [.agents/rules/harness-engineering.md](file:///apps/ex_project_GajiTalk/.agents/rules/harness-engineering.md), [.agents/rules/soohyung-domain.md](file:///apps/ex_project_GajiTalk/.agents/rules/soohyung-domain.md), [.agents/rules/arboriculture-terminology.md](file:///apps/ex_project_GajiTalk/.agents/rules/arboriculture-terminology.md), [.agents/rules/orchestration-pipeline.md](file:///apps/ex_project_GajiTalk/.agents/rules/orchestration-pipeline.md), [.agents/rules/ui-tagging-inspection.md](file:///apps/ex_project_GajiTalk/.agents/rules/ui-tagging-inspection.md), [.agents/rules/git-workflow.md](file:///apps/ex_project_GajiTalk/.agents/rules/git-workflow.md)에 정의된 하네스 엔지니어링 및 오케스트레이션 체계를 따릅니다.

---

## 1. 에이전트 필수 준수 사항 (10대 수칙)

1. **상시 룰 및 작업지시서 참조**:
   - 작업을 시작하기 전 반드시 [GEMINI.md](file:///apps/ex_project_GajiTalk/GEMINI.md), 작업지시서([docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md)), 도메인 룰([.agents/rules/soohyung-domain.md](file:///apps/ex_project_GajiTalk/.agents/rules/soohyung-domain.md)), 조경·수목 전지 용어 룰([.agents/rules/arboriculture-terminology.md](file:///apps/ex_project_GajiTalk/.agents/rules/arboriculture-terminology.md)), 오케스트레이션 파이프라인 룰([.agents/rules/orchestration-pipeline.md](file:///apps/ex_project_GajiTalk/.agents/rules/orchestration-pipeline.md)), UI 태깅 인스펙션 룰([.agents/rules/ui-tagging-inspection.md](file:///apps/ex_project_GajiTalk/.agents/rules/ui-tagging-inspection.md)), Git 워크플로우 룰([.agents/rules/git-workflow.md](file:///apps/ex_project_GajiTalk/.agents/rules/git-workflow.md))을 준수한다.
2. **`./apps/` 하위 폴더 구분 및 지정 포트(`30018`, `30019`, `30020`) 엄수**:
   - 모든 웹·앱·백엔드 서비스는 반드시 **`./apps/` 하위 폴더로 구분**하여 구성하고 지정된 포트 및 운영 도메인만 사용한다:
     - **`./apps/admin-web`** (Port **`30018`**, `https://jupiter.axfoundly.com`): 통합 관리자 웹 & 전문가 Canvas 첨삭 스튜디오 (React + Vite)
     - **`./apps/mobile-app`** (Port **`30019`**, `https://saturn.axfoundly.com`): 정원주(고객) & 전문 조경사(파트너) 모바일 웹/앱 (React + Vite)
     - **`./apps/backend`** (Port **`30020`**, `https://uranus.axfoundly.com`): RESTful API & AI 시뮬레이션/위치 매칭 서버 (Node.js + Express/NestJS + MongoDB)
3. **의뢰자 소통용 UI 일련번호 태깅 및 4대 정보 뱃지 복사 규정 준수**:
   - 모든 화면과 주요 인터랙션 태그 요소에 고유 일련번호(`[P01-SEC01-BTN01]`, `data-serial-id`)를 부여하여 의뢰자와 정밀하게 소통한다.
   - 단축키 `Alt + I`로 뱃지 표시/숨김 토글을 지원하고, 뱃지 클릭 시 **4대 핵심 정보(일련번호, 페이지명, URI, 항목명)**가 클립보드에 정돈되어 복사(`[Copied! ✓]`)되도록 설계 및 검증한다.
4. **조경·수목 전지 전문 용어 및 10대 전지 골든 룰 엄수**:
   - 모든 AI 전지 가이드(`cuttingGuides`), 생장 시뮬레이션 설명, 조경사 입찰 견적서, 수종 도감(`tree_species`) 작성 시 [docs/arboriculture_terminology_dictionary.md](file:///apps/ex_project_GajiTalk/docs/arboriculture_terminology_dictionary.md)의 전문 용어(주간/주지/부주지, 지융부, 외아, 도장지, 내향지, 교차지, 하향지, 병충해가지, 적심/순집기, 솎아베기 등) 및 **10대 전지 골든 룰**(지융부 보존, 외아 위 사선 절단, 7대 기피 가지 우선 제거, 소나무 적심 적기, 1회 엽량 30% 이내 절제 등)을 정확히 적용한다.
5. **실사(Real-Photo) 몰입감 및 시뮬레이션-매칭 무결성 원칙**:
   - 만화풍 그래픽이 아닌 실제 나무 사진 위에서 절단선 오버레이(`BranchOverlayCanvas`), 가상 가위질, 전지 직후(`BeforeAfterSlider`) 및 6개월/1년/3년 후 생장 예측(`GrowthTimelineBar`)이 자연스럽게 동작해야 한다.
   - 시뮬레이션 결과가 원클릭으로 조경사 견적 요청(`QuoteRequestModal`)에 첨부되어 입찰·채택·시공 완료 리포트까지 끊김 없이 연결되어야 한다.
6. **알맞은 업무 종료 시 Git Commit 필수화**:
   - 모든 에이전트는 아키텍처 문서 갱신, 스키마/API 구현, UI 컴포넌트 완성, 검증 완료 등 유의미한 작업 단위 완료 시 **반드시 원자적 Git Commit을 수행**한다.
   - 커밋 메시지 컨벤션을 준수하며, `.env` 등 민감 파일이 스테이징되지 않도록 사전 점검한다.
7. **역할과 스킬의 분리**:
   - 에이전트는 본인의 정의된 책임(Who) 범위를 벗어나지 않는다.
   - 구체적인 실행 절차(How)는 `.agents/skills/`(`pruning-simulation-ai`, `landscaper-matching-o2o`, `ralph-loop`, `harness`, `harness-evolve`)에 정의된 스킬 가이드를 따른다.
8. **루프 엔지니어링과 상태 영속화**:
   - 반복 루프 작업 수행 시 세션 메모리에 의존하지 않고, 항상 디스크의 상태 파일([.agents/loop/state.json](file:///apps/ex_project_GajiTalk/.agents/loop/state.json), [.agents/loop/task.md](file:///apps/ex_project_GajiTalk/.agents/loop/task.md))과 Git 커밋에 진행 상황을 원자적으로 기록한다.
   - 사전에 정의된 검증 기준과 완료 약속(Completion Promise)이 기계적으로 입증되었을 때에만 약속 토큰을 출력하고 종료한다.
9. **무한 폴링 금지**:
   - 백그라운드 태스크나 메시지를 기다릴 때 루프를 돌며 상태를 조회하지 않는다. Antigravity의 반응형 웨이크업(Reactive Wakeup) 시스템에 맡기고 도구 호출을 종료한다.
10. **Playwright Headless 무인 자동 검증 및 핵심 화면 캡처 의무화**:
    - 모든 UI/API 변경 및 주요 마일스톤 완료 시 `./run_port.sh status` 및 Playwright Headless 검증 스크립트를 실행하여 관리자 웹(`:30018`), 모바일 앱(`:30019` 정원주/조경사 모드), 백엔드 API(`:30020`) 전 화면의 무결성(HTTP 200, 콘솔/렌더링 에러 0건)을 기계적으로 자동 캡처·검증한다.
    - 리눅스 컨테이너 환경의 안정적 무인 실행을 위해 필수 브라우저 4대 런치 옵션(`--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`)을 준수한다.
