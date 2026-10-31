---
name: pruning-simulation-ai
description: "수목 실사 가지치기(전지) AI 분석, 절단선(Cutting Line) 오버레이 Canvas, 인터랙티브 가상 가위질, 전지 직후/6개월/1년/3년 후 시계열 생장 예측(Growth Predictor) 및 관리자용 전문가 첨삭 스튜디오를 설계·구현·검증할 때 사용하는 도메인 전용 스킬."
---

# Pruning Simulation AI — 실사 수목 전지 & 생장 예측 시뮬레이터 스킬

본 스킬은 [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md) 및 [docs/arboriculture_terminology_dictionary.md](file:///apps/ex_project_GajiTalk/docs/arboriculture_terminology_dictionary.md)에 정의된 **"AI 실사 수목 전지·생장 시뮬레이션"** 파이프라인을 `./apps/mobile-app`(:30018), `./apps/admin-web`(:30019), `./apps/backend`(:30020) 전반에 걸쳐 일관되게 구축하기 위한 실행 절차를 정의합니다.

---

## 1. 핵심 설계 원칙

1. **만화풍 배제 & 100% 실사(Real-Photo) 몰입감**:
   - 단순 2D 일러스트가 아닌, 실제 촬영된 정원수(소나무, 단풍나무, 배롱나무, 유실수 등) 사진 질감을 그대로 유지한 상태에서 절단 가이드 오버레이 및 전지 후/생장 후 비교를 제공합니다.
2. **7대 기피 가지 컬러 코딩 & 10대 골든 룰 반영**:
   - `cuttingGuides`의 각 절단 포인트는 가지 유형(`도장지`, `내향지`, `교차지`, `하향지`, `병충해가지`)과 우선순위(`HIGH`, `MEDIUM`, `LOW`)를 가지며, 터치 시 수목학적 절단 이유(`reason`)와 기대 효과(`expectedEffect`)를 즉시 표시합니다.
3. **양방향 인터랙티브 캔버스**:
   - 모바일 앱(`BranchOverlayCanvas.tsx`)에서는 손가락 스와이프/터치로 가상 가위질(`/api/simulations/:id/re-render`)을 수행하고, 관리자 웹(`SimulationReviewPage.tsx`) 및 조경사 파트너 모드에서는 전문가 절단선 덧그리기/교정(`customCuttingGuides`)을 지원합니다.

---

## 2. 컴포넌트 및 API 구현 체크리스트

### Step 1: 백엔드 AI 파이프라인 & Mongoose 스키마 (`./apps/backend` : Port `30020`)
- **모델 (`PruningSimulation.model.ts`)**:
  - `speciesName`, `targetGoal` ("통풍 개선", "수형 교정", "구름형 다듬기", "생장 억제")
  - `originalImageUrl`
  - `cuttingGuides`: `[{ guideId, branchType, priority, cutLineCoords: [{x, y}], branchPolygon: [{x, y}], reason, expectedEffect }]`
  - `simulatedImages`: `{ immediatelyAfterUrl, after6MonthsUrl, after1YearUrl, after3YearsUrl }`
- **서비스 (`visionAi.service.ts`, `inpaintingAi.service.ts`)**:
  - `POST /api/simulations/analyze`: 이미지 및 수종/목표 수형을 받아 절단 좌표와 4단계 시계열 실사 URL 반환.
  - `POST /api/simulations/:id/re-render`: 사용자가 선택한 `guideIds`만 부분 절단했을 때의 실사 재합성 결과 반환.
  - `PUT /api/admin/simulations/:id/review`: 관리자/전문가가 교정한 절단선 좌표를 저장하고 학습 데이터셋으로 마킹.

### Step 2: 모바일 실사 시뮬레이터 UI (`./apps/mobile-app` : Port `30018`)
- **`BranchOverlayCanvas.tsx`**:
  - 원본 나무 사진 위에 `branchPolygon`(반투명 하이라이트) 및 `cutLineCoords`(점선 + 가위 아이콘 마커) 렌더링.
  - 우선순위별 색상: `HIGH` (코랄 레드 `#ef4444`), `MEDIUM` (앰버 옐로 `#f59e0b`), `LOW` (에메랄드 `#10b981`).
  - 절단선 스와이프 또는 가위 마커 클릭 시 절단 애니메이션과 함께 선택 가지 제거 상태 토글.
- **`BeforeAfterSlider.tsx`**:
  - 좌/우 드래그 핸들을 통해 `originalImageUrl`(전지 전 원본)과 `immediatelyAfterUrl`(전지 직후 실사)을 부드럽게 비교.
- **`GrowthTimelineBar.tsx`**:
  - 하단 4단계 타임라인 스텝 바:
    1. `전지 직후` (`immediatelyAfterUrl`) — 불필요 가지 정리 직후 깔끔한 골격
    2. `6개월 후` (`after6MonthsUrl`) — 외아(바깥눈)에서 신초(새순) 발생
    3. `1년 후` (`after1YearUrl`) — 수관 내부 통풍 확보 및 균형 잡힌 잎무더기 형성
    4. `3년 후` (`after3YearsUrl`) — 목표 수형(구름형/자연형 등) 완성 예측
- **원클릭 시공 의뢰 브릿지**:
  - 하단 고정 CTA 버튼 `[이 수형대로 전문 조경사에게 견적 받기]` (`data-serial-id="P03-SEC04-BTN01"`) 클릭 시 현재 `simulationId`와 목표 수형 이미지를 `QuoteRequestModal`에 자동 첨부.

### Step 3: 관리자 AI 검수 및 전문가 첨삭 스튜디오 (`./apps/admin-web` : Port `30019`)
- **`SimulationReviewPage.tsx` (`studio/`)**:
  - 좌측: 검수 대기 시뮬레이션 목록 및 수종/목표 필터.
  - 중앙: 전문가용 인터랙티브 Canvas 에디터 (절단선 드래그 이동, 신규 절단선 추가, 잘못된 절단선 삭제).
  - 우측: 가지 유형(`branchType`), 절단 사유(`reason`), 수종별 전지 룰셋 참조 및 `[검수 승인 & AI 학습셋 반영]` 저장 버튼.

