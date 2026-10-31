# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) UI inspect 시스템 표준 규격서

## 1. 개요 및 적용 대상

의뢰자(클라이언트/기획자)와 AI 에이전트 간 정밀 소통을 지원하는 **UI 태그 뱃지 인스펙션 시스템(`UI inspect`)**의 표준 규격입니다.

| 구분 | 폴더 경로 (`./apps/`) | 할당 포트 | 서비스 명칭 표기 |
| :--- | :--- | :---: | :--- |
| **모바일 앱 (정원주 & 조경사)** | `./apps/mobile-app` | **`30018`** | `수형 (SOOHYUNG) 모바일` |
| **관리자 웹 & 첨삭 스튜디오** | `./apps/admin-web` | **`30019`** | `수형 (SOOHYUNG) 관리자` |
| **백엔드 API & 매칭 서버** | `./apps/backend` | **`30020`** | `수형 (SOOHYUNG) API` |

---

## 2. 표준 UI inspect 규격

### 2-1. 용어 및 단축키 통일 (`UI inspect`)
- **전역 단축키**: `Alt + I` (또는 `Ctrl + Shift + T`)
- **플로팅 FAB / 헤더 토글 버튼**:
  - 기본(OFF): `🏷️ UI inspect (Alt+I)`
  - 활성(ON): `🏷️ UI inspect ON (Alt+I)`
- **토스트 알림**:
  - 활성화: `🔍 UI inspect 활성화 (클릭 시 4대 정보 복사)`
  - 비활성화: `UI inspect 비활성화 (숨김)`
  - 복사 완료: `📋 [일련번호] 4대 정보 복사 완료! (일련번호/페이지/URI/항목명)`

### 2-2. 뱃지 시각 스타일 및 좌상단 핀 위치 고정
- **폰트 크기**: `9.5px !important` (`ui-monospace`, `font-weight: 700`)
- **패딩 및 모서리**: `2.5px 5.5px !important`, `border-radius: 4px`, `line-height: 1`
- **좌상단 핀 위치 일관성**: 네비게이션, 사이드바, 카드, 버튼 등 모든 요소에서 **좌상단 핀(`top: -6px; left: -4px;`)** 위치를 엄수합니다.

---

## 3. 4대 핵심 정보 클립보드 복사 규격 및 예시

뱃지 클릭 시 클립보드에 복사되는 데이터 포맷은 아래 4대 정보를 엄격히 유지합니다:

```text
- 일련번호: {serialId}
- 페이지명: {화면명} ({화면코드}) - {서비스명}
- URI: {URL}
- 항목명: {항목명}
```

### 3-1. 모바일 앱 (`./apps/mobile-app` : Port `30018`) 복사 예시
```text
- 일련번호: P03-SEC02-CNV01
- 페이지명: 실사 전지 & 생장 시뮬레이션 (P-03) - 수형 (SOOHYUNG) 모바일
- URI: http://localhost:30018/simulation#tab=After1Year
- 항목명: 실사 위 절단선(Cutting Line) 오버레이 및 가상 가위질 캔버스
```

### 3-2. 통합 관리자 웹 (`./apps/admin-web` : Port `30019`) 복사 예시
```text
- 일련번호: P53-SEC05-CNV01
- 페이지명: AI 전지 분석 검수 스튜디오 (P-53) - 수형 (SOOHYUNG) 관리자
- URI: http://localhost:30019/studio#simId=sim-001
- 항목명: 전문가용 가지치기 절단선 교정 Canvas 에디터
```
