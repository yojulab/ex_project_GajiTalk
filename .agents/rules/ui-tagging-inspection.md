# 의뢰자 소통용 UI 일련번호 태깅 & 인스펙션 뱃지 시스템 규격
## (Client-Agent UI Tagging & Inspection System)

- **적용 대상**: `./apps/mobile-app/` (Port `30018`), `./apps/admin-web/` (Port `30019`) 및 모든 프로토타입/와이어프레임 화면
- **적용 목적**: 의뢰자(클라이언트/기획자)와 AI 에이전트/개발자 간의 피드백 소통 시, 모호한 묘사 대신 **화면(Page)과 UI 요소(Tag/Element)의 고유 일련번호**를 기반으로 100% 오차 없는 정밀한 커뮤니케이션을 실현함.

---

## 1. 일련번호 부여 규칙 (Serial Numbering Convention)

모든 페이지 및 대화형 UI 요소는 아래 표준 포맷에 따라 유일한 식별 코드를 부여합니다.

### 1-1. 전체 식별자 구조
```text
[페이지코드]-[섹션코드]-[태그/요소코드]
예시: P01-SEC02-BTN01
```

### 1-2. 코드 구성 규칙 (`수형 / 가지톡` 플랫폼 표준)

| 단위 | 코드 체계 | 규칙 및 예시 |
| :--- | :--- | :--- |
| **페이지 (Page)** | `P{01~99}-{도메인}` | **• 모바일 앱 (`./apps/mobile-app`, Port `30018`)**<br>- `P01-MOBILE-HOME`: 정원주 메인 홈 & 대표 수형 쇼케이스<br>- `P02-MOBILE-CAPTURE`: 수목 촬영 및 수종/목표수형 선택 (`CaptureAndAnalyzePage`)<br>- `P03-MOBILE-SIMULATION`: 실사 전지 가이드(Canvas) & 6개월/1년/3년 생장 예측 (`SimulationResultPage`)<br>- `P04-MOBILE-GARDEN`: 내 정원 프로필 및 보유 수목 생장 타임라인 (`MyGardenPage`)<br>- `P05-MOBILE-DIRECTORY`: 지역별·전문분야별 명인 조경사 탐색 (`LandscaperDirectoryPage`)<br>- `P06-MOBILE-MATCHING`: 내 견적 요청 현황 및 조경사 입찰서 비교/채택 (`MatchingStatusPage`)<br>- `P07-PARTNER-JOBBOARD`: [조경사 모드] 주변 정원 작업 요청 탐색 & 정밀 견적/첨삭 발송 (`PartnerJobBoardPage`)<br>**• 통합 관리자 웹 (`./apps/admin-web`, Port `30019`)**<br>- `P50-ADMIN-DASHBOARD`: 시뮬레이션·매칭 체결률·거래액 통합 대시보드 (`DashboardPage`)<br>- `P51-ADMIN-MATCHING`: 정원주-조경사 매칭/입찰/시공완료 모니터링 및 수동 배정 (`MatchingManagePage`)<br>- `P52-ADMIN-VERIFY`: 조경사 파트너 자격 심사 및 명인 배지 부여 (`LandscaperVerifyPage`)<br>- `P53-ADMIN-STUDIO`: AI 전지 분석 검수 및 전문가 Canvas 첨삭 스튜디오 (`SimulationReviewPage`)<br>- `P54-ADMIN-SPECIES`: 수종 도감, 전지 룰셋 및 수고별 표준 단가 기준표 관리 (`SpeciesManagePage`) |
| **섹션 (Section)** | `SEC{01~99}-{영역}` | - `SEC01-HEADER`: 상단 글로벌 헤더 & 정원주/조경사 모드 전환 바<br>- `SEC02-CANVAS`: 실사 절단선(Cutting Line) 오버레이 & 가상 가위질 Canvas<br>- `SEC03-SLIDER`: 전지 전/후 비교(`BeforeAfterSlider`) 및 시계열 생장(`GrowthTimelineBar`)<br>- `SEC04-QUOTES`: 조경사 입찰 견적 비교 및 상세 내역(`priceBreakdown`) 영역<br>- `SEC05-STUDIO`: 관리자 Canvas 절단선 교정 에디터 패널 |
| **요소/태그 (Tag)** | `{타입약어}{01~99}` | - `BTN01`: 버튼 (Button)<br>- `INP01`: 입력창 (Input Text)<br>- `SEL01`: 선택박스 (Select / Dropdown)<br>- `CRD01`: 카드 컴포넌트 (Card)<br>- `MOD01`: 모달/팝업 (Modal / Dialog)<br>- `CNV01`: 캔버스/슬라이더 요소 (Canvas / Slider)<br>- `TAB01`: 탭 요소 (Tab Item) |

---

## 2. 단축키 인스펙션 뱃지 기능 규격

모든 프론트엔드(`apps/mobile-app`, `apps/admin-web`) 빌드 시 아래 인스펙션 오버레이 메커니즘을 내장합니다.

### 2-1. 단축키 토글 (Toggle Shortcut) 및 FAB 버튼
- **전역 단축키**: **`Alt + I`** (UI inspect 모드 토글) 또는 **`Ctrl + Shift + T`**
- **플로팅 FAB 버튼 규격**:
  - 기본 상태(OFF): `🏷️ UI inspect (Alt+I)`
  - 활성화 상태(ON): `🏷️ UI inspect ON (Alt+I)`
  - 툴팁 안내: `단축키 Alt+I 로 UI inspect 모드를 켜고 끌 수 있습니다`
- **토스트 알림 규격**:
  - 활성화: `🔍 UI inspect 활성화 (클릭 시 4대 정보 복사)`
  - 비활성화: `UI inspect 비활성화 (숨김)`

### 2-2. 뱃지 시각 스타일 및 위치 규격 (Badge Styling & Positioning)
- **위치 일관성 원칙**: 메뉴, 내비게이션, 본문 카드 등 모든 컴포넌트에서 **좌상단(Top-Left Pin: `top: -6px; left: -4px;`)**으로 위치 통일 (우측 끝 세로 중앙 등 변칙 배치 절대 금지).
- **디자인 규격**:
  - **폰트**: 9.5px (ui-monospace, 700 bold)
  - **패딩**: 2.5px 5.5px (콤팩트 규격)
  - **모서리**: border-radius: 4px
  - **배경/테두리**: 고대비 다크 에메랄드/인디고 배경 (`#4f46e5`), 1px 반투명 화이트 보더
- **마우스 호버**: 스케일 1.1배 확대 및 툴팁 노출.

### 2-3. 원클릭 클립보드 복사 (Click to Copy)
- **동작**:
  1. 의뢰자가 수정하고 싶은 요소의 일련번호 뱃지를 마우스로 클릭/터치.
  2. 클립보드에 **4대 필수 정보(일련번호, 페이지명, URI, 항목명)**가 정돈된 포맷으로 즉시 복사됨 (`navigator.clipboard.writeText`).
     - 페이지명은 자동으로 `{화면명} ({화면코드}) - {서비스명}` 형태로 결합됩니다.
     - SPA 화면 전환 시 URL 경로 또는 해시(`#tab=...`)가 실시간 동기화되어 URI에 정확히 남습니다.
     ```text
     - 일련번호: P03-SEC03-BTN01
     - 페이지명: 실사 전지 & 생장 시뮬레이션 (P-03) - 수형 (SOOHYUNG)
     - URI: http://localhost:30018/simulation/sim-pine-01
     - 항목명: 이 수형대로 전문 조경사에게 견적 받기 버튼
     ```
     또는 관리자 웹 예시:
     ```text
     - 일련번호: P53-SEC05-CNV01
     - 페이지명: AI 전지 분석 검수 스튜디오 (P-53) - 수형 (SOOHYUNG) 관리자
     - URI: http://localhost:30019/studio
     - 항목명: 전문가용 절단선 교정 Canvas 에디터
     ```
  3. 뱃지 라벨이 1.2초간 녹색 **`[Copied! ✓]`**로 바뀌며 하단에 상세 토스트 알림 발생(`📋 [일련번호] 4대 정보 복사 완료! (일련번호/페이지/URI/항목명)`).

---

## 3. 의뢰자-에이전트 협업 소통 시나리오

```text
[의뢰자 (클라이언트)]
  1. Alt + I 를 눌러 화면의 인스펙션 뱃지를 켠다.
  2. 수정하고 싶은 요소의 뱃지를 클릭한다 -> 일련번호, 페이지명, URI, 항목명이 클립보드 자동 복사.
  3. 채팅창에 붙여넣기(Ctrl+V)하여 요청:
     - 일련번호: P03-SEC03-SLD01
     - 페이지명: 실사 전지 & 생장 시뮬레이션 (P-03) - 수형 (SOOHYUNG)
     - URI: http://localhost:30018/simulation/sim-pine-01
     - 항목명: 시계열 생장 예측 타임바 (직후/6개월/1년/3년)
     "위 타임바에 '2년 후' 스텝을 추가하거나 각 연차별 예상 수고(m) 뱃지를 함께 표시해주세요."

[AI 에이전트]
  1. 'P03-SEC03-SLD01' 및 제공된 URI/페이지명을 통해 ./apps/mobile-app 내 GrowthTimelineBar.tsx를 즉시 추적.
  2. 오차 없이 정확한 파일의 해당 엘리먼트를 특정하여 수정 및 검증 완료.
```

---

## 4. 하네스 에이전트 준수 가이드라인

1. **Mobile Garden & Canvas UX Specialist**:
   - `./apps/mobile-app/` (:30018) 컴포넌트 마크업 시 모든 주요 태그에 `data-serial-id="P01-SEC01-BTN01"` 및 일련번호 뱃지 마크업을 기본 구조로 반영한다.
2. **Admin Studio & Horticulture Specialist**:
   - `./apps/admin-web/` (:30019)의 대시보드, 매칭 관리, 조경사 심사, Canvas 첨삭 스튜디오, 수종 도감 화면에 `data-serial-id="P50-SEC01-CRD01"` 등의 일련번호 앵커를 부여한다.
3. **Quality & E2E Assurer**:
   - Playwright 자동화 테스트 작성 시 깨지기 쉬운 CSS 셀렉터 대신 `data-serial-id` 속성을 1순위 테스트 셀렉터로 채택하여 테스트 안정성을 극대화한다.
