# GEMINI.md — 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 하네스 헌장 & 마스터 오케스트레이터

> **Antigravity & Gemini 하네스 엔지니어링 및 멀티에이전트 오케스트레이션 가동 중**
> 본 프로젝트는 Google Antigravity 및 Gemini 실행 환경에 최적화된 `revfactory/harness` 및 `ralph-loop` 아키텍처를 기반으로, **[docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md)** (조경·수목 전지 AI 시뮬레이션 및 정원주-조경사 O2O 매칭 플랫폼), **[docs/arboriculture_terminology_dictionary.md](file:///apps/ex_project_GajiTalk/docs/arboriculture_terminology_dictionary.md)** 수목 전지 전문 용어 사전, 그리고 **의뢰자 소통용 UI inspect 태깅 시스템**을 완벽히 준수합니다.

---

## 1. 하네스 시스템 트리거 및 오케스트레이션 라우팅 포인터

사용자의 요청 키워드에 따라 아래 스킬과 룰을 즉시 로드하여 작업을 오케스트레이션합니다:

| 사용자 요청 키워드 | 대상 스킬 / 룰 | 설명 |
| :--- | :--- | :--- |
| **"하네스 구성해줘"**, **"하네스 설계"**, **"에이전트 팀 만들어줘"** | [.agents/skills/harness/SKILL.md](file:///apps/ex_project_GajiTalk/.agents/skills/harness/SKILL.md) | 프로젝트 도메인 분석 후 최적의 에이전트 팀, 오케스트레이터, 스킬 설계 |
| **"하네스 회고"**, **"하네스 피드백 반영"**, **"하네스 진화"** | [.agents/skills/harness-evolve/SKILL.md](file:///apps/ex_project_GajiTalk/.agents/skills/harness-evolve/SKILL.md) | 실행 델타 포착, 원리 일반화, 룰 및 에이전트 지속 개선 |
| **"루프 실행"**, **"ralph loop"**, **"끝날 때까지 반복"**, **"자율 루프"** | [.agents/skills/ralph-loop/SKILL.md](file:///apps/ex_project_GajiTalk/.agents/skills/ralph-loop/SKILL.md) | Ralph Loop 자율 반복 실행, 완료 약속 및 서킷 브레이커 관리 |
| **"가지치기 시뮬레이션"**, **"전지 가이드"**, **"생장 예측"**, **"Canvas 첨삭"** | [.agents/skills/pruning-simulation-ai/SKILL.md](file:///apps/ex_project_GajiTalk/.agents/skills/pruning-simulation-ai/SKILL.md) | 실사 절단선(`BranchOverlayCanvas`), 가상 가위질, 6개월/1년/3년 생장 예측, 관리자 첨삭 스튜디오 구현 |
| **"조경사 매칭"**, **"견적 입찰"**, **"내 정원"**, **"시공 완료 보고"** | [.agents/skills/landscaper-matching-o2o/SKILL.md](file:///apps/ex_project_GajiTalk/.agents/skills/landscaper-matching-o2o/SKILL.md) | 정원주-조경사 양방향 O2O 매칭, 공개 입찰/1:1 의뢰, 시공 전/후 리포트 및 타임라인 연동 |
| **수형/가지톡 도메인 & PRD 아키텍처 규격** | [.agents/rules/soohyung-domain.md](file:///apps/ex_project_GajiTalk/.agents/rules/soohyung-domain.md) | `./apps/` 3대 서비스(`30018`, `30019`, `30020`), MongoDB 5대 스키마, REST API 19개 명세 |
| **조경·수목 전지 전문 용어 & 10대 골든 룰** | [.agents/rules/arboriculture-terminology.md](file:///apps/ex_project_GajiTalk/.agents/rules/arboriculture-terminology.md) | [arboriculture_terminology_dictionary.md](file:///apps/ex_project_GajiTalk/docs/arboriculture_terminology_dictionary.md) 기반 7대 기피 가지 및 10대 전지 골든 룰 |
| **멀티에이전트 오케스트레이션 파이프라인** | [.agents/rules/orchestration-pipeline.md](file:///apps/ex_project_GajiTalk/.agents/rules/orchestration-pipeline.md) | Stage 1~3 파이프라인, Fan-out/Fan-in 병렬 구현, Producer-Reviewer 검증 프로토콜 |
| **UI 일련번호 태깅 & 단축키 인스펙션** | [.agents/rules/ui-tagging-inspection.md](file:///apps/ex_project_GajiTalk/.agents/rules/ui-tagging-inspection.md) | 페이지/태그 일련번호 체계(`P01~P54`), `Alt+I` 단축키 토글, 뱃지 클릭 시 4대 정보 복사 |
| **Git 커밋 규약 & 업무 종료 수칙** | [.agents/rules/git-workflow.md](file:///apps/ex_project_GajiTalk/.agents/rules/git-workflow.md) | 업무 종료 시 Git Commit 필수화, 원자적 커밋, 메시지 컨벤션 |
| **하네스 아키텍처 & 품질 원칙** | [.agents/rules/harness-engineering.md](file:///apps/ex_project_GajiTalk/.agents/rules/harness-engineering.md) | 6대 팀 패턴, 5대 품질 검증, 점진적 공개 원칙 |
| **루프 엔지니어링 원칙 & 서킷 브레이커** | [.agents/rules/loop-engineering.md](file:///apps/ex_project_GajiTalk/.agents/rules/loop-engineering.md) | Iteration > Perfection, 상태 디스크 영속화, 서킷 브레이커 규정 |

---

## 2. `수형 (SOOHYUNG) / 가지톡 (GajiTalk)` 핵심 아키텍처 및 개발 가드레일

1. **`./apps/` 하위 폴더 구분 및 지정 포트(`30018`, `30019`, `30020`) 고정 원칙**:
   - 모든 웹, 앱, 백엔드 서비스는 반드시 **`./apps/` 하위 폴더로 구분**하며 다음 포트에 바인딩합니다:
     - **`./apps/mobile-app` (Port `30018`)**: 정원주(고객) 모드 & 전문 조경사(파트너) 모드 전환 지원 모바일 웹/앱 (React + Vite, TypeScript, Tailwind CSS, HTML5 Canvas)
     - **`./apps/admin-web` (Port `30019`)**: 통합 관리자 웹 백오피스 & 전문가 Canvas 절단선 첨삭 스튜디오 (React + Vite, TypeScript, Tailwind CSS, TanStack Query, Recharts)
     - **`./apps/backend` (Port `30020`)**: RESTful API & Vision AI / Inpainting / `2dsphere` 위치 기반 조경사 매칭 서버 (Node.js + Express/NestJS, TypeScript, Mongoose, MongoDB)
     - **`./tests/`**: Playwright Headless 기반 핵심 화면 캡처 및 E2E 자동 검증 슈트
2. **실사(Real-Photo) 기반 전지 시뮬레이션 & O2O 매칭 직결 원칙**:
   - 만화풍 그래픽을 배제하고, 실제 촬영된 나무 사진 위에 **절단 위치(`cuttingGuides`: 도장지, 내향지, 교차지, 하향지, 병충해가지)**를 오버레이하며, **가상 가위질 스와이프**, **전지 직후 비교(`BeforeAfterSlider`)**, **시계열 생장 예측(`GrowthTimelineBar`: 직후 → 6개월 → 1년 → 3년 후)**을 제공합니다.
   - 시뮬레이션 결과 화면에서 원클릭으로 목표 수형 이미지와 원본 절단 가이드를 첨부하여 전문 조경사에게 시공/첨삭 견적을 의뢰(공개 입찰 역경매 / 1:1 지정 의뢰)할 수 있어야 합니다.
3. **조경·수목 전지 전문 용어 및 10대 골든 룰 준수**:
   - 모든 AI 분석 코멘트, 수종 도감(`tree_species`), 견적서 및 첨삭 가이드 작성 시 [docs/arboriculture_terminology_dictionary.md](file:///apps/ex_project_GajiTalk/docs/arboriculture_terminology_dictionary.md)의 전문 용어(주간, 주지, 지융부, 외아, 7대 기피 가지, 적심/순집기, 솎아베기 등)와 **"현장 압축 10대 전지 골든 룰"**을 엄수합니다.
4. **의뢰자 소통용 UI 일련번호 태깅 및 4대 정보 뱃지 복사 규정**:
   - 모든 화면과 컴포넌트 태그에 고유 일련번호(`[P01-SEC01-BTN01]`, `data-serial-id`)를 부여합니다.
   - 단축키 **`Alt + I`**로 뱃지 표시/숨김 토글을 지원하고, **뱃지 클릭 시 4대 핵심 정보(일련번호, 페이지명, URI, 항목명)가 클립보드에 자동 복사(Copy)**되도록 구현합니다.
5. **알맞은 업무 종료 시 Git Commit 의무화**:
   - 모든 에이전트는 아키텍처/룰 갱신, 기능 구현, 검증 완료 등 유의미한 작업 단위를 완수했을 때 **반드시 원자적 Git Commit을 수행**합니다.
6. **Playwright Headless 무인 자동 검증 원칙**:
   - 화면/기능 변경 시 `./run_port.sh all`로 3개 포트(`30018`, `30019`, `30020`)를 기동하고 Playwright Headless(Linux 컨테이너 필수 4대 런치 옵션 `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`)로 전 화면 렌더링 및 API 연동을 검증합니다.

---

## 3. 전담 에이전트 팀 및 오케스트레이션 롤 (Agent Roles)

| 에이전트 롤 | 모델 티어 | 담당 타겟 및 포트 | 주 임무 및 전담 산출물 |
| :--- | :--- | :--- | :--- |
| **System & Geo-DB Architect** | Gemini Pro | `./apps/backend` (`:30020`), 루트 인프라 | `./apps/*` 모노레포 워크스페이스, MongoDB 5대 스키마(`users`, `gardens`, `pruning_simulations`, `matching_requests`, `tree_species`) 및 `2dsphere` 위치 인덱스, 시드 데이터, `run_port.sh`, `.env` 설계 |
| **Vision AI & Simulation Specialist** | Gemini Pro | `./apps/backend/src/services` (`:30020`) | 실사 수목 주간/주지/7대 기피 가지 세그멘테이션, 절단선 좌표(`cutLineCoords`) 도출, Image Inpainting 연동 전지 직후 및 6개월/1년/3년 후 생장 예측 파이프라인(`visionAi.service.ts`, `inpaintingAi.service.ts`) |
| **Mobile Garden & Canvas UX Specialist** | Gemini Pro/Flash | `./apps/mobile-app` (`:30018`) | 정원주 ⇄ 조경사 모드 전환 UX, `BranchOverlayCanvas`(절단선 오버레이 & 스와이프 가상 가위질), `BeforeAfterSlider`, `GrowthTimelineBar`, 내 정원(`MyGardenPage`) 수목 생장 타임라인 및 UI inspect 태깅 |
| **O2O Matching & Bidding Specialist** | Gemini Pro/Flash | `./apps/mobile-app` (`:30018`) & `:30020` | AI 시뮬레이션 원클릭 첨부 견적 요청(`QuoteRequestModal`), 공개 입찰(역경매) & 1:1 지정 의뢰, 상세 견적 내역(`laborCost`, `equipmentCost`, `wasteDisposalCost`) 비교/채택(`QuoteComparisonList`), 조경사 파트너 잡보드(`PartnerJobBoardPage`), 시공 완료 Before/After 리포트 |
| **Admin Studio & Horticulture Specialist** | Gemini Pro/Flash | `./apps/admin-web` (`:30019`) | 통합 운영 대시보드(`DashboardPage`), 조경사 자격 심사 및 인증 명인 배지(`isMasterBadge`) 부여(`LandscaperVerifyPage`), 매칭 모니터링/수동 배정/분쟁 조정(`MatchingManagePage`), 전문가 Canvas 절단선 첨삭 스튜디오(`SimulationReviewPage`), 수종 도감·룰셋·표준 단가 관리(`SpeciesManagePage`) |
| **Quality & E2E Assurer** | Gemini Pro | `./tests/`, 전체 포트 (`:30018`, `:30019`, `:30020`) | Playwright Headless 핵심 화면 자동 캡처 슈트, `data-serial-id` 기반 UI inspect 검증, 시뮬레이션→견적요청→입찰→채택→시공완료→관리자 검수 E2E 무결성 검증 |

---

## 4. 하네스 변경 이력 (Harness Changelog)

| 일자 | 변경 내용 | 대상 | 사유 |
| :--- | :--- | :--- | :--- |
| **2026-10-12** | Gemini 맞춤형 하네스 및 Ralph Loop 규칙 체계 최초 수립 | 전체 하네스 시스템 | Google Antigravity & Gemini 환경 기반 하네스 및 자율 루프 아키텍처 구성 |
| **2026-10-31** | `WORK_ORDER.md` 기반 조경·수목 전지 AI 시뮬레이션 & 정원주-조경사 매칭 플랫폼으로 오케스트레이션 및 하네스 프롬프트 전면 개편 | `GEMINI.md`, `AGENTS.md`, `.agents/rules/*`, `.agents/skills/*`, `run_port.sh`, `.env.example`, `.vscode/launch.json`, `docs/*` | `docs/PRDs/WORK_ORDER.md` 요구사항 반영, 사용 포트 `30018`(모바일 앱), `30019`(관리자 웹), `30020`(백엔드 API) 지정 및 `./apps/` 하위(`apps/mobile-app`, `apps/admin-web`, `apps/backend`) 폴더 구분 구조 확립 |
| **2026-11-02** | 운영 서버용 4대 환경 변수(.env) 자동 생성기(`generate_env.sh`) 구축 및 연동 | `generate_env.sh`, `setup_env.sh`, `run_port.sh`, `package.json`, `.env.example`, `GEMINI.md` | 운영 MongoDB(`external_project_db_mongo`) URI 정규화 및 백업 기능 포함 일괄 .env 자동 배포 체계 마련 |
