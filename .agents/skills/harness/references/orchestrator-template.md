# Gemini 오케스트레이터 작성 표준 템플릿 (`수형 / 가지톡` 플랫폼 기준)

본 템플릿은 Antigravity / Gemini 환경에서 [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md) 목표를 달성하기 위한 다단계 에이전트 팀 협업 워크플로우를 오케스트레이션할 때 활용한다.

---

## 템플릿 구조

```markdown
# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 멀티에이전트 오케스트레이터

이 문서는 조경·수목 전지(가지치기) AI 시뮬레이션 및 정원주-조경사 O2O 매칭 플랫폼 구축을 위한 에이전트 팀 협업 워크플로우를 오케스트레이션한다.

## 1. 참여 에이전트 및 역할 정의

| 에이전트명 | 모델 티어 | 담당 영역 / 포트 | 주 역할 및 산출물 |
| :--- | :--- | :--- | :--- |
| **System & Geo-DB Architect** | Gemini Pro | `./apps/backend` (`:30020`) | MongoDB 5대 스키마(`2dsphere`), 19개 REST API, 시드 데이터, `run_port.sh` |
| **Vision AI & Simulation Specialist** | Gemini Pro | `./apps/backend/src/services` (`:30020`) | 가지 구조 세그멘테이션, 절단선 좌표 도출, 직후/6개월/1년/3년 실사 생장 합성 |
| **Mobile Garden & Canvas UX Specialist** | Gemini Pro/Flash | `./apps/mobile-app` (`:30018`) | `BranchOverlayCanvas`, 가상 가위질, `BeforeAfterSlider`, `GrowthTimelineBar`, 내 정원 타임라인 |
| **O2O Matching & Bidding Specialist** | Gemini Pro/Flash | `./apps/mobile-app` (`:30018`) & `:30020` | AI 시뮬레이션 첨부 견적 의뢰, 공개 입찰/1:1 의뢰, 조경사 파트너 견적 발송 및 시공 완료 보고서 |
| **Admin Studio & Horticulture Specialist** | Gemini Pro/Flash | `./apps/admin-web` (`:30019`) | 통합 대시보드, 조경사 자격 심사/명인 배지, 매칭 중재, Canvas 절단선 첨삭 스튜디오, 수종 도감/단가표 |
| **Quality & E2E Assurer** | Gemini Pro | `./tests/` (`:30018`, `:30019`, `:30020`) | Playwright Headless 전 화면 캡처, `data-serial-id` 검증, 시뮬레이션→매칭 E2E 검증 |

## 2. 실행 파이프라인 (Phase Workflow)

### Phase 1: 기반 아키텍처 및 MongoDB 스키마/시드 구축
- **실행 모드**: 도구 기반 비동기 오케스트레이션 (모드 A)
- **절차**:
  1. `./apps/{mobile-app,admin-web,backend}` 모노레포 워크스페이스 및 환경변수 구성
  2. 5대 Mongoose 모델(`User`, `Garden`, `PruningSimulation`, `MatchingRequest`, `TreeSpecies`) 및 시드 데이터 구축
  3. Port `30020` 백엔드 서버 기동 및 19개 REST API 엔드포인트 검증

### Phase 2: 3대 타겟 분할 구현 (Fan-out)
- **실행 모드**: 도구 기반 비동기 오케스트레이션 (모드 A) & 서브에이전트 병렬 위임 (모드 B)
- **절차**:
  1. `./apps/mobile-app` (Port `30018`): 실사 전지 시뮬레이터 + 내 정원 + 정원주/조경사 매칭 뷰 구현
  2. `./apps/admin-web` (Port `30019`): 대시보드 + 조경사 심사 + 매칭 관리 + Canvas 첨삭 스튜디오 + 수종 단가 관리 구현
  3. 모든 주요 인터랙션 요소에 `data-serial-id` 및 `Alt+I` UI inspect 뱃지 적용

### Phase 3: 통합 연동 및 적대적 교차 검증 (Fan-in & Producer-Reviewer)
- **실행 모드**: 생성-검증 루프 (모드 A + 모드 B)
- **적용 패턴**: 적대적 검증 (Adversarial Verification) & Loop-until-dry
- **절차**:
  1. `./run_port.sh all`로 `30018`, `30019`, `30020` 전체 서버 기동 확인
  2. Playwright Headless로 모바일 앱(정원주/조경사 모드) 및 관리자 웹 전 화면 렌더링·API 연동 검증
  3. 결함 0건 수렴 시 원자적 Git Commit 수행 및 완료 보고
```
