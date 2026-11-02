# Ralph Loop 작업 체크리스트 (Task Burn-down — `수형 / 가지톡` 플랫폼)

> 에이전트는 [docs/PRDs/WORK_ORDER.md](file:///apps/ex_project_GajiTalk/docs/PRDs/WORK_ORDER.md) 기준 미완료(`[ ]`) 항목 중 1개를 선택하여 구현 및 검증을 완료한 후 `[x]`로 갱신합니다.
> 모든 항목이 `[x]`가 되면 사전에 정의된 `completion_promise`(`PROMISE_MET: COMPLETED`)를 출력하고 루프를 종료합니다.

## Phase 1: 기반 아키텍처 & 풀스택 MVP (`./apps/` : 30018, 30019, 30020)
- [ ] 1. `./apps/backend` (Port `30020`): MongoDB 5대 스키마(`users`, `gardens`, `pruning_simulations`, `matching_requests`, `tree_species`), `2dsphere` 위치 인덱스, 대표 수종·시뮬레이션·명인 조경사 시드 데이터 및 19개 REST API 구축
- [ ] 2. `./apps/mobile-app` (Port `30019`): 실사 위 절단선 오버레이(`BranchOverlayCanvas`), 가상 가위질, 전지 전/후 슬라이더(`BeforeAfterSlider`), 6개월/1년/3년 시계열 생장 예측(`GrowthTimelineBar`) 구현
- [ ] 3. `./apps/mobile-app` (Port `30019`): 내 정원 관리(`MyGardenPage`), AI 시뮬레이션 원클릭 첨부 견적 요청(`QuoteRequestModal`), 입찰 비교/채택(`MatchingStatusPage`), 조경사 파트너 뷰 전환(`PartnerJobBoardPage`) 구현
- [ ] 4. `./apps/admin-web` (Port `30018`): 통합 운영 대시보드(`DashboardPage`), 조경사 자격 심사/명인 배지(`LandscaperVerifyPage`), 매칭 모니터링(`MatchingManagePage`), Canvas 절단선 검수 스튜디오(`SimulationReviewPage`), 수종 도감/표준 단가 관리(`SpeciesManagePage`) 구현
- [ ] 5. `tests/` & `./run_port.sh`: 3개 포트(`30018`, `30019`, `30020`) 통합 기동, `Alt+I` UI inspect 뱃지 검증, Playwright Headless 핵심 화면 캡처 및 E2E 연동 검증
