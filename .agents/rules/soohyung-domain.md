# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 플랫폼 도메인 엔지니어링 가이드

- **기준 문서**: [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md)
- **브랜드 및 플랫폼 명칭**: **수형 (SOOHYUNG)** / **가지톡 (GajiTalk)** (코드명: `soohyung-platform`)
- **슬로건**: *"찍으면 보이는 나무의 미래, 명인의 손길까지"* / *"내 나무에 딱 맞는 수형 디자인과 조경 매칭"*
- **핵심 가치 제안 (3대 축)**:
  1. **비전문가의 조경 기술 장벽 해소 (DIY 전지 가이드)**: 일반 정원주가 판단하기 어려운 도장지, 내향지, 교차지, 하향지 등 제거 대상 가지를 AI 비전 분석을 통해 실사 위 직관적인 절단 가이드라인(Cutting Line)으로 제공하고 가상 가위질 시뮬레이션 지원.
  2. **실사(Real-Photo) 기반 전/후 비교 및 시계열 생장 예측**: 실제 촬영한 나무 사진 위에 절단 위치 오버레이, 전지 직후(`BeforeAfterSlider`) 및 시간 경과(직후 → 6개월 후 신초 발생 → 1년 후 → 3년 후)에 따른 수목 생장 실사 예측(`GrowthTimelineBar`).
  3. **정원 보유 고객(정원주)과 전문 조경사 양방향 O2O 매칭**: AI 시뮬레이션 결과물(목표 수형 이미지 + 원본 절단 가이드)과 정원 프로필을 원클릭 첨부하여 전문 조경사에게 공개 입찰(역경매) 또는 1:1 직접 지정 의뢰, 비대면 원격 수형 첨삭 연결.

---

## 1. `./apps/` 하위 3대 타겟 멀티 프로젝트 구조 및 포트 규격

모든 웹, 앱, 백엔드 애플리케이션은 **`./apps/` 하위 폴더로 명확히 구분**하며, 지정된 **30018, 30019, 30020 포트**를 사용합니다:

```text
ex_project_GajiTalk/
├── .env.example                           # 루트 공통 환경 변수 템플릿 (:30018, :30019, :30020)
├── .gitignore                             # 빌드 산출물 및 로컬 .env 커밋 방지
├── .vscode/                               # 3대 타겟 통합 디버그 프로파일 (launch.json)
├── GEMINI.md                              # 프로젝트 하네스 헌장 & 에이전트 오케스트레이션 포인터
├── AGENTS.md                              # 에이전트 팀 행동 강령 및 표준 지침
├── run_port.sh                            # 포트(30018, 30019, 30020) 통합 기동/컴파일 스크립트
├── compile.sh                             # run_port.sh 심볼릭 링크 (컴파일 단축 실행)
├── apps/
│   ├── mobile-app/                        # [Port 30018] 정원주(고객) & 조경사(파트너) 모바일 웹/앱 (React + Vite)
│   ├── admin-web/                         # [Port 30019] 통합 관리자 웹 & 전문가 첨삭 스튜디오 (React + Vite)
│   └── backend/                           # [Port 30020] REST API & AI/매칭 엔진 서버 (Node.js + MongoDB)
├── tests/                                 # [E2E & Automation] Playwright Headless 캡처 및 검증 슈트
└── docs/
    ├── PRDs/WORK_ORDER.md                 # 마스터 작업지시서
    ├── arboriculture_terminology_dictionary.md # 조경·수목 전지 전문 용어 사전 & 10대 골든 룰
    └── UI-Inspects.md                     # 의뢰자 소통용 UI inspect 뱃지 시스템 규격
```

### 1-1. 프로젝트별 포트 및 기술 스택 규격

| 타겟 구분 | 폴더 경로 | 포트 | 기술 스택 | 핵심 역할 및 아키텍처 규격 |
| :--- | :--- | :---: | :--- | :--- |
| **모바일 앱/웹** | `./apps/mobile-app` | **`30018`** | React (Vite), TypeScript, Tailwind CSS, Capacitor/PWA, HTML5 Canvas API | **정원주(고객) 모드 & 조경사(전문가) 모드 통합 앱**. 나무 촬영, `BranchOverlayCanvas`(절단선 마킹 & 스와이프 가상 가위질), `BeforeAfterSlider`, `GrowthTimelineBar`(직후/6개월/1년/3년), 내 정원 관리, 견적 요청/입찰/포트폴리오 탐색. |
| **관리자 웹** | `./apps/admin-web` | **`30019`** | React (Vite), TypeScript, Tailwind CSS, TanStack Query, Recharts, Canvas | **통합 관리자 백오피스**. 시뮬레이션·매칭 거래액 대시보드, 조경사 자격 심사 및 명인 배지(`isMasterBadge`) 부여, 매칭/분쟁 중재, AI 전지 검수 & 전문가 Canvas 첨삭 스튜디오, 수종 도감·룰셋·표준 단가 기준표 관리. |
| **백엔드 API** | `./apps/backend` | **`30020`** | Node.js (Express / NestJS), TypeScript, Mongoose, MongoDB (`2dsphere`) | **RESTful API & AI/O2O 매칭 서버**. Vision AI 가지 구조 분석, Image Inpainting 실사 전지/생장 합성, GeoJSON `2dsphere` 기반 반경 내 조경사 매칭 및 견적 입찰·시공 완료 리포트 관리. |
| **E2E 테스트** | `./tests` | - | Playwright (Headless Mode), TypeScript/JS | **무인 자동 검증 슈트**. 3개 포트(`:30018`, `:30019`, `:30020`) 핵심 화면 캡처, `data-serial-id` 기반 UI inspect 검증, 시뮬레이션→견적→입찰→매칭 E2E 검증. |

---

## 2. 핵심 도메인 기능 명세 요약

### 2-1. 모바일 앱 (`./apps/mobile-app` : Port `30018`)
1. **[정원주 모드] 수목 촬영 및 실사 기반 가지치기 가이드**:
   - 수종 판별(소나무, 단풍나무, 배롱나무, 유실수 등) 및 목표 수형(자연형, 통풍 개선, 구름형, 크기 억제 등) 선택.
   - 실사 이미지 위 7대 기피 가지(도장지, 내향지, 교차지, 하향지, 병충해가지 등) 색상별 라인 & 가위 절단선 오버레이 표시, 포인트 터치 시 절단 이유(`reason`)와 기대 효과(`expectedEffect`) 안내.
   - **인터랙티브 가상 가위질**: 절단선을 스와이프하면 해당 가지가 잘린 후의 모습을 즉시 시뮬레이션 (`/api/simulations/:id/re-render`).
2. **[정원주 모드] 실사 조경 결과 및 시계열 생장 시뮬레이션**:
   - **Before / After Slider**: 실제 사진 질감을 유지한 채 전지 전/직후 수형 비교 슬라이더.
   - **시계열 생장 예측 (Growth Predictor)**: 타임바 슬라이더로 **전지 직후 → 6개월 후(신초 발생) → 1년 후 → 3년 후** 수형 변화를 실사 이미지로 예측.
3. **[정원주 모드] 내 정원(My Garden) 등록 및 생장 타임라인**:
   - 정원 위치(주소/GeoJSON 좌표), 면적(평수), 정원 유형(`DETACHED_HOUSE`, `TOWNHOUSE`, `COMMERCIAL_CAFE`, `APARTMENT`, `FARM`), 보유 수목 리스트 및 연차별/계절별 관리 타임라인 기록.
4. **[정원주 모드] 조경사 매칭 및 시공/자문 의뢰**:
   - AI 시뮬레이션 결과(목표 수형 이미지 + 절단 가이드 원본)를 원클릭 첨부하여 시공/자문 의뢰(`ONSITE_PRUNING`, `REGULAR_CARE`, `REMOTE_COACHING`, `LANDSCAPE_DESIGN`).
   - **방식 1 (공개 입찰 역경매)**: 내 정원 반경 내 전문 조경사들의 입찰 견적(금액, 소요 시간, 작업 계획 코멘트, 포트폴리오) 비교 선택.
   - **방식 2 (1:1 직접 지정 의뢰)**: 지역별·전문분야별 명인 조경사 탐색 후 1:1 의뢰.
   - **온라인 원격 수형 첨삭**: 현장 방문 전 조경사가 나무 사진 위 절단선을 직접 교정하고 음성/텍스트 코멘트를 제공하는 비대면 자문.
5. **[조경사 파트너 모드] 주변 요청 탐색, 정밀 견적 입찰 및 시공 완료 보고**:
   - 상단 모드 전환 탭을 통해 조경사 파트너 뷰(`PartnerJobBoardPage`) 즉시 전환.
   - 반경 내 작업 요청 확인, AI 시뮬레이션 이미지 위 전문가 Canvas 첨삭 라인 추가, 상세 견적 내역(`laborCost`, `equipmentCost`, `wasteDisposalCost`) 및 방문 가능 일자 발송.
   - 현장 시공 완료 후 실제 Before/After 사진과 관리 팁 제출 → 고객의 '내 정원 타임라인'에 자동 기록 및 정산 진행.

### 2-2. 통합 관리자 웹 (`./apps/admin-web` : Port `30019`)
1. **통합 운영 대시보드 (`DashboardPage`)**: 일별/월별 AI 시뮬레이션 건수, 매칭 요청 건수, 견적 체결률, 거래액/수수료 매출, 지역별 수급 현황 시각화.
2. **조경사 파트너 심사 (`LandscaperVerifyPage`)**: 자격증(조경기술사, 조경기사, 나무의사, 분재관리사 등), 경력, 포트폴리오 검증(`PENDING` → `VERIFIED`/`REJECTED`) 및 인증 명인 배지(`isMasterBadge`) 부여.
3. **매칭 모니터링 및 분쟁 조정 (`MatchingManagePage`)**: 매칭 상태(`OPEN` → `QUOTING` → `MATCHED` → `IN_PROGRESS` → `COMPLETED`) 추적, 미매칭 건 수동 추천/배정, 시공 전/후 사진 및 AI 시뮬레이션 합의안 대조 중재.
4. **AI 전지 분석 검수 스튜디오 (`SimulationReviewPage`)**: Canvas 기반으로 AI 추천 절단선을 교정하고 실제 시공 Before/After와 매핑하여 AI 학습 데이터셋 축적.
5. **수종별 전지 룰셋 및 표준 단가표 관리 (`SpeciesManagePage`)**: 수종별 적정 전지 시기, 전지 규칙, AI 생성 프롬프트, 수고별(2m 미만 소형 / 2~4m 중형 / 4m 이상 대형) 권장 견적 단가 가이드라인 관리.

---

## 3. 데이터베이스 (MongoDB) 5대 핵심 컬렉션 스키마 규격

1. **`users`**: 정원주(`GARDEN_OWNER`), 조경사(`LANDSCAPER`), 관리자(`ADMIN`) 통합 회원 및 `landscaperProfile` (상호명, 경력, 자격증, 전문분야, 활동지역, `baseLocation` GeoJSON Point `2dsphere`, 인증상태, `isMasterBadge`, 별점, 시공 포트폴리오 배열).
2. **`gardens`**: 정원주의 정원 프로필 (정원명, 유형, 주소, `location` GeoJSON Point `2dsphere`, 평수 `areaPyeong`, 전경 이미지, 보유 수목 `trees` 배열 및 수목별 시계열 `timelineLogs`).
3. **`pruning_simulations`**: 실사 가지치기 분석 및 생장 시뮬레이션 (수종명, 목표 수형 `targetGoal`, 원본 이미지, `cuttingGuides` 배열[가지유형, 우선순위, `cutLineCoords`, `branchPolygon`, 절단 사유, 기대 효과], `simulatedImages`[`immediatelyAfterUrl`, `after6MonthsUrl`, `after1YearUrl`, `after3YearsUrl`]).
4. **`matching_requests`**: 정원주-조경사 매칭 및 시공/첨삭 의뢰 (`simulationIds` 연동, `requestType`, 희망 일정, 예산 범위, 상태 `status`, 입찰 견적 배열 `quotes`[총액, 인건비/장비비/폐기물처리비 내역, 방문가능일, 전문가 코멘트, `customCuttingGuides`], 매칭 확정 정보, `completionReport`[시공 전/후 이미지, 작업 요약], 정원주 `review`).
5. **`tree_species`**: 수종 도감, 전지 룰셋 및 표준 단가 기준 (`koreanName`, `scientificName`, 분류 `CONIFER`/`DECIDUOUS`/`EVERGREEN`/`FRUIT`, `pruningSeason`, `pruningRules`, `standardPriceGuide`[`smallTreePrice`, `mediumTreePrice`, `largeTreePrice`, `difficultyNote`], `aiPromptConfig`).

---

## 4. REST API 19개 표준 엔드포인트 규격 (Port `30020`)

- **Auth / User**:
  - `POST /api/auth/register` (정원주/조경사 회원가입)
  - `POST /api/auth/login` (로그인 및 JWT 발급)
- **Simulations (핵심 조경 AI)**:
  - `POST /api/simulations/analyze` (나무 사진 업로드 및 AI 절단선·실사 생장 시뮬레이션 생성)
  - `GET /api/simulations/:id` (시뮬레이션 상세 조회)
  - `POST /api/simulations/:id/re-render` (선택 가지만 부분 절단 시 실사 재합성)
- **Gardens (내 정원 관리)**:
  - `GET /api/gardens/my` (내 정원 정보 및 보유 수목 타임라인 조회)
  - `POST /api/gardens` (내 정원 위치/평수 및 보유 수목 신규 등록)
- **Matching (정원주-조경사 매칭)**:
  - `GET /api/landscapers` (지역별·전문분야별 조경사 목록, 포트폴리오, 별점 조회)
  - `GET /api/landscapers/:id` (특정 조경사 상세 프로필 및 시공 Before/After 조회)
  - `POST /api/matching/requests` (AI 시뮬레이션 첨부 조경사 시공/첨삭 견적 요청 등록)
  - `GET /api/matching/requests` (견적 요청 목록 조회 — 정원주: 내 요청 / 조경사: 주변 정원 요청)
  - `GET /api/matching/requests/:id` (매칭 요청 상세 및 입찰 견적서 리스트 조회)
  - `POST /api/matching/requests/:id/quotes` ([조경사용] 상세 견적서 및 첨삭 라인 입찰 제출)
  - `PUT /api/matching/requests/:id/accept-quote` ([정원주용] 조경사 견적 채택 및 시공 예약 확정)
  - `POST /api/matching/requests/:id/complete` ([조경사용] 현장 시공 완료 후 실제 Before/After 보고서 제출)
  - `POST /api/matching/requests/:id/review` ([정원주용] 시공 완료 건 조경사 별점 및 리뷰 등록)
- **Admin (관리자 웹)**:
  - `GET /api/admin/dashboard` (시뮬레이션 통계, 매칭 체결률, 매출/수수료 대시보드 조회)
  - `GET /api/admin/landscapers` (조경사 파트너 가입 신청 목록 및 자격증/포트폴리오 조회)
  - `PUT /api/admin/landscapers/:id/verify` (조경사 자격 승인/반려 및 명인 배지 부여)
  - `GET /api/admin/matching` (전체 매칭 진행 현황 모니터링 및 수동 배정)
  - `PUT /api/admin/simulations/:id/review` (관리자/전문가용 Canvas 절단선 교정 및 AI 데이터셋 축적)
  - `POST /api/admin/species` (수종 도감, 전지 룰셋 및 수종별 권장 시공 단가표 등록/수정)
