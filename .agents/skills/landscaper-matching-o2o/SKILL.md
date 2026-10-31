---
name: landscaper-matching-o2o
description: "정원 보유 고객(정원주)과 전문 조경사(파트너) 간의 양방향 O2O 매칭, AI 시뮬레이션 첨부 견적 요청, 공개 입찰(역경매) 및 1:1 지정 의뢰, 비대면 원격 수형 첨삭, 시공 완료 Before/After 보고서 제출 및 내 정원 타임라인 자동 기록을 설계·구현·검증할 때 사용하는 도메인 전용 스킬."
---

# Landscaper Matching O2O — 정원주-전문 조경사 양방향 매칭 & 견적 입찰 스킬

본 스킬은 [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md)에 정의된 **"AI 시뮬레이션 연동 정원주-조경사 O2O 매칭 플랫폼"** 워크플로우를 `./apps/mobile-app`(:30018), `./apps/admin-web`(:30019), `./apps/backend`(:30020) 전반에 걸쳐 구축하기 위한 실행 지침입니다.

---

## 1. 매칭 라이프사이클 상태 머신 (State Machine)

모든 매칭 요청(`matching_requests.status`)은 아래 상태 전이를 엄격히 준수합니다:

```text
[OPEN (견적요청 등록)]
   │  (조경사 1명 이상 입찰 견적 제출: POST /api/matching/requests/:id/quotes)
   ▼
[QUOTING (입찰 진행중)]
   │  (정원주가 최적 견적서 채택: PUT /api/matching/requests/:id/accept-quote)
   ▼
[MATCHED / IN_PROGRESS (예약 확정 및 시공 진행)]
   │  (조경사가 시공 후 Before/After 보고서 제출: POST /api/matching/requests/:id/complete)
   ▼
[COMPLETED (시공 완료 & 내 정원 타임라인 자동 아카이빙)]
   │  (정원주 별점 리뷰 등록: POST /api/matching/requests/:id/review)
   ▼
[정산 완료 & 조경사 평점(ratingAvg)·포트폴리오 갱신]
```

---

## 2. 핵심 구현 체크리스트

### Step 1: 내 정원(My Garden) & 위치 기반 매칭 엔진 (`./apps/backend` : Port `30020`)
- **`Garden.model.ts` & `User.model.ts`**:
  - `gardens.location` 및 `users.landscaperProfile.baseLocation`에 GeoJSON `Point` (`[longitude, latitude]`) 및 `2dsphere` 인덱스 적용.
  - 정원 유형(`DETACHED_HOUSE` 전원주택, `TOWNHOUSE` 타운하우스, `COMMERCIAL_CAFE` 카페/상업시설, `APARTMENT` 아파트 화단, `FARM` 주말농장) 및 보유 수목(`trees`: 수종, 별칭, 수고 `heightMeters`, 그루 수, `timelineLogs`) 관리.
- **4대 의뢰 유형 (`requestType`) 지원**:
  1. `ONSITE_PRUNING`: 현장 방문 수목 전지(가지치기) 시공
  2. `REGULAR_CARE`: 정기 정원 관리 (월간/계절별 구독형)
  3. `REMOTE_COACHING`: 온라인 비대면 수형 첨삭 자문
  4. `LANDSCAPE_DESIGN`: 정원 리모델링 및 식재 시공

### Step 2: 정원주 견적 요청 및 입찰 비교 (`./apps/mobile-app` : Port `30018`)
- **`QuoteRequestModal.tsx`**:
  - AI 시뮬레이션 결과(`simulationIds`: 원본 절단선 이미지 + 전지 직후/3년 후 목표 수형 이미지) 자동 첨부.
  - 내 정원 선택, 작업 유형(`requestType`), 희망 방문 일정, 희망 예산 범위(`budgetRange`), 장비 진입 가능 여부/폐기물 처리 여부 입력.
  - **방식 1 (공개 입찰 역경매)** 또는 **방식 2 (`targetLandscaperId` 1:1 직접 지정 의뢰)** 선택 지원.
- **`QuoteComparisonList.tsx` & `MatchingStatusPage.tsx`**:
  - 조경사들이 제출한 입찰 견적 카드 비교:
    - 총 견적 금액(`price`) 및 상세 내역(`laborCost` 기술 인건비 + `equipmentCost` 장비비 + `wasteDisposalCost` 임목 폐기물 처리비).
    - 조경사 인증 명인 배지(`isMasterBadge`), 평균 별점(`ratingAvg`), 전문가 코멘트(`expertComment`), 전문가 보정 절단 라인(`customCuttingGuides`).
  - `[이 견적 채택 및 시공 예약 확정]` 클릭 시 상태가 `MATCHED`로 전환.

### Step 3: 조경사 파트너 모드 & 시공 완료 보고 (`./apps/mobile-app` : Port `30018`)
- **`PartnerJobBoardPage.tsx` (조경사 파트너 뷰)**:
  - 주변 정원 작업 요청 탐색(정원 평수, 수목 수고, 고객이 원하는 AI 목표 수형 이미지 확인).
  - 정밀 견적서 작성 모달: 수종별 표준 단가 가이드(`tree_species.standardPriceGuide`)를 참고하여 인건비·장비비·폐기물 처리비 산출 및 전문가 첨삭 코멘트 제출.
  - 시공 완료 보고서 제출: 현장 시공 전/후(`beforeImages`, `afterImages`) 실사 사진과 향후 물주기/시비/방제 관리 요약(`workSummary`) 업로드 → 즉시 고객의 `gardens.trees.timelineLogs`에 기록.

### Step 4: 관리자 파트너 심사 및 매칭 중재 (`./apps/admin-web` : Port `30019`)
- **`LandscaperVerifyPage.tsx`**:
  - 조경사 보유 자격증(조경기술사, 조경기사, 나무의사, 분재관리사 등) 및 시공 포트폴리오 심사(`PENDING` → `VERIFIED` / `REJECTED`), 우수 파트너에게 '인증 명인 배지(`isMasterBadge`)' 부여.
- **`MatchingManagePage.tsx`**:
  - 전체 매칭 건의 진행 단계 실시간 모니터링, 미매칭 정원주 대상 우수 조경사 수동 추천/배정, 시공 결과물 및 AI 시뮬레이션 합의안 대조를 통한 분쟁 조정.

