---
name: harness
description: "프로젝트에 맞는 하네스를 설계하고, 전문 에이전트와 각 에이전트가 사용할 스킬을 만든다. 사용자가 '하네스 구성해줘', '하네스 구축해줘', '하네스 설계', '하네스 엔지니어링', '에이전트 팀 만들어줘'라고 요청할 때 사용한다. 새로운 분야나 프로젝트의 자동화 체계를 구축하거나 기존 하네스를 재구성·확장할 때도 사용한다. '하네스 점검', '하네스 감사', '하네스 현황', '에이전트/스킬 동기화'처럼 기존 하네스를 운영하거나 유지 보수하는 요청에도 사용한다. 실행 결과를 회고하고 피드백을 반영하는 작업에는 harness-evolve 스킬을 사용한다."
---

# Harness for Gemini — 에이전트 팀과 스킬 설계 팩토리

프로젝트(`수형 (SOOHYUNG) / 가지톡 (GajiTalk)` — 조경·수목 전지 AI 시뮬레이션 및 정원주-조경사 매칭 플랫폼)의 도메인 특성에 맞추어 Google Antigravity / Gemini 환경에 최적화된 하네스(에이전트 팀 아키텍처, 전용 스킬, 오케스트레이션 파이프라인, 품질 검증 체계)를 설계하고 운영한다.

---

## 핵심 원칙

1. **규격 준수**:
   - 상위 프로젝트 규칙 및 상시 컨텍스트는 [GEMINI.md](file:///apps/ex_project_GajiTalk/GEMINI.md)와 [AGENTS.md](file:///apps/ex_project_GajiTalk/AGENTS.md)에 유지한다.
   - 세부 아키텍처, 오케스트레이션 및 도메인 규칙은 `.agents/rules/`에 작성한다:
     - [.agents/rules/soohyung-domain.md](file:///apps/ex_project_GajiTalk/.agents/rules/soohyung-domain.md)
     - [.agents/rules/arboriculture-terminology.md](file:///apps/ex_project_GajiTalk/.agents/rules/arboriculture-terminology.md)
     - [.agents/rules/orchestration-pipeline.md](file:///apps/ex_project_GajiTalk/.agents/rules/orchestration-pipeline.md)
     - [.agents/rules/ui-tagging-inspection.md](file:///apps/ex_project_GajiTalk/.agents/rules/ui-tagging-inspection.md)
     - [.agents/rules/git-workflow.md](file:///apps/ex_project_GajiTalk/.agents/rules/git-workflow.md)
     - [.agents/rules/harness-engineering.md](file:///apps/ex_project_GajiTalk/.agents/rules/harness-engineering.md)
     - [.agents/rules/loop-engineering.md](file:///apps/ex_project_GajiTalk/.agents/rules/loop-engineering.md)
   - 세부 작업 절차와 스킬은 `.agents/skills/<name>/SKILL.md`에 배치한다.
   - 에이전트에는 **"누가 일하는가(Role/Responsibility)"**를, 스킬에는 **"그 일을 어떻게 하는가(Procedure/Guidelines)"**를 명확히 분리한다.
2. **`./apps/` 멀티 프로젝트 및 포트 규격 엄수**:
   - `./apps/mobile-app` (Port **`30018`**): 정원주 & 조경사 모바일 웹/앱 (React + Vite)
   - `./apps/admin-web` (Port **`30019`**): 통합 관리자 웹 & 전문가 Canvas 첨삭 스튜디오 (React + Vite)
   - `./apps/backend` (Port **`30020`**): Node.js + Express/NestJS + MongoDB REST API 서버
3. **Gemini 3대 네이티브 실행 모드 매핑**:
   - 입출력이 명확하고 스크립트 실행이 가능한 작업은 **도구 기반 비동기 오케스트레이션 (모드 A)**을 적용한다.
   - 실제 브라우저 인터랙션이나 격리 검증이 필요한 경우 **서브에이전트 위임 (모드 B)**을 적용한다.
   - 복잡한 설계 조율 및 페어 프로그래밍은 **반응형 조율 (모드 C)**을 적용한다.
   - (참조: `references/gemini-execution-modes.md`)
4. **Gemini 모델 티어링 정책**:
   - 장기 계획, 시스템 아키텍처, Vision AI/Geo-DB 설계, 적대적 비판 검증에는 **Gemini Pro (Reasoning Tier)**를 배정한다.
   - 빠른 컴포넌트 구현, 린트/테스트 러너, 로그 분석, 형식 변환에는 **Gemini Flash (Execution Tier)**를 배정한다.
   - (참조: `references/model-selection-guide.md`)
5. **결정론적 품질 검증 결합**:
   - 산출물의 신뢰성을 위해 5대 품질 패턴(적대적 검증, 심사위원단, Loop-until-dry, 다각 스윕, 누락 검토자) 중 1개 이상을 필수로 연결한다.
   - (참조: `references/quality-verification-patterns.md`)
6. **점진적 공개(Progressive Disclosure)**:
   - `GEMINI.md`에는 호출 트리거와 라우팅 포인터만 간결히 유지하고, 상세 가이드는 서브문서로 관리하여 토큰 낭비를 원천 차단한다.

---

## 단계별 구축 및 감사 절차

### 0단계: 워크스페이스 현황 감사 (Audit)
1. 워크스페이스 루트의 `GEMINI.md`, `AGENTS.md`, `.agents/` 디렉토리 및 `./apps/` 하위 구조(`mobile-app`, `admin-web`, `backend`)를 점검한다.
2. 현재 상태에 따라 분기한다:
   - **신규 구축**: 하네스가 부재하거나 비어 있는 경우 1단계부터 전면 구축.
   - **기존 구성 확장**: 특정 도메인 에이전트나 스킬만 추가하는 경우 필요한 단계만 선별 실행.
   - **운영 및 유지보수**: `docs/PRDs/WORK_ORDER.md` 대비 불일치 점검 및 동기화 수행.

### 1단계: 도메인 및 제어 흐름 분석 (Domain Analysis)
1. [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md) 요구사항 및 조경·수목 전지/O2O 매칭 도메인을 심층 분석한다.
2. 제어 흐름의 형태를 진단한다:
   - MongoDB 5대 컬렉션(`users`, `gardens`, `pruning_simulations`, `matching_requests`, `tree_species`) 및 19개 REST API가 먼저 준비되어야 하는가?
   - `apps/mobile-app`(:30018)과 `apps/admin-web`(:30019)을 병렬(Fan-out)로 구현할 수 있는가?
   - Playwright Headless E2E 검증이 필요한가?

### 2단계: 실행 모드 및 팀 아키텍처 설계 (Architecture Design)
1. `references/gemini-execution-modes.md`를 참고하여 실행 모드(A, B, C 또는 하이브리드)를 선택한다.
2. 6대 팀 패턴 중 가장 적합한 아키텍처(파이프라인 + Fan-out/Fan-in + 생성·검증)를 확정한다.

### 3단계: 전문 에이전트 및 역할 정의 (Agent Definition)
1. 6대 핵심 에이전트(`System & Geo-DB Architect`, `Vision AI & Simulation Specialist`, `Mobile Garden & Canvas UX Specialist`, `O2O Matching & Bidding Specialist`, `Admin Studio & Horticulture Specialist`, `Quality & E2E Assurer`)의 페르소나, 주 임무, 입출력 포맷을 정의한다.

### 4단계: 스킬 생성 및 동기화 (Skill Generation)
1. 에이전트들이 수행할 전문 작업 지침을 `.agents/skills/<name>/SKILL.md`로 작성 및 유지한다 (`pruning-simulation-ai`, `landscaper-matching-o2o`, `ralph-loop`, `harness`, `harness-evolve`).

### 5단계: 오케스트레이터 및 `GEMINI.md` 통합
1. 팀을 유기적으로 작동시킬 오케스트레이션 규칙([.agents/rules/orchestration-pipeline.md](file:///apps/ex_project_GajiTalk/.agents/rules/orchestration-pipeline.md))을 정의한다.
2. `GEMINI.md`에 호출 키워드(트리거), 에이전트 팀 맵, 변경 이력 테이블을 갱신한다.
