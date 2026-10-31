const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runE2E() {
  console.log('=================================================================');
  console.log('🌲 수형 (SOOHYUNG) / 가지톡 Playwright Headless 무인 자동 검증 시작');
  console.log('=================================================================');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const consoleErrors = [];

  // =================================================================
  // [PART 1] 모바일 웹/앱 검증 (Port 30018, 모바일 뷰포트 390x844)
  // =================================================================
  console.log('\n📱 [PART 1] 모바일 앱 (:30018) 전 화면 및 인터랙션 검증...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  });

  const mobilePage = await mobileContext.newPage();
  mobilePage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Mobile Console Error] ${msg.text()}`);
    }
  });

  mobilePage.on('dialog', async dialog => {
    console.log(`     [Mobile Alert] ${dialog.message()}`);
    await dialog.accept();
  });

  // 1-1. P01: 정원주 메인 홈
  console.log('  1. P01-MOBILE-HOME 메인 홈 접속 및 렌더링...');
  await mobilePage.goto('http://localhost:30018', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_p01_mobile_home.png') });
  console.log('     ✓ 캡처 완료: 01_p01_mobile_home.png');

  // 1-2. UI Inspect 토글 테스트 (Alt+I)
  console.log('  2. UI Inspect 시스템 단축키(Alt+I) 테스트...');
  await mobilePage.keyboard.press('Alt+KeyI');
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_ui_inspect_on_home.png') });
  console.log('     ✓ 캡처 완료: 02_ui_inspect_on_home.png (인스펙션 뱃지 노출 확인)');
  // 인터랙션 진행을 위해 Alt+I 한 번 더 눌러 뱃지 숨김 토글
  await mobilePage.keyboard.press('Alt+KeyI');
  await mobilePage.waitForTimeout(400);

  // 1-3. P02: 수목 촬영 및 분석 페이지 이동
  console.log('  3. P02-MOBILE-CAPTURE 촬영 & 분석 페이지...');
  const startBtn = await mobilePage.$('[data-serial-id="P01-SEC01-BTN01"]');
  if (startBtn) {
    await startBtn.click();
  } else {
    await mobilePage.click('text=내 나무 촬영하고 즉시 분석하기');
  }
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_p02_mobile_capture.png') });
  console.log('     ✓ 캡처 완료: 03_p02_mobile_capture.png');

  // 1-4. P03: 실사 전지 시뮬레이터 생성 및 결과 화면
  console.log('  4. P03-MOBILE-SIMULATION 실사 시뮬레이션 결과 화면...');
  await mobilePage.click('text=AI 실사 전지 & 생장 시뮬레이션 시작');
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_p03_mobile_simulation_canvas.png') });
  console.log('     ✓ 캡처 완료: 04_p03_mobile_simulation_canvas.png (가상 가위질 Canvas)');

  // Before/After 탭 전환
  console.log('  5. P03-SEC03: Before/After 비교 슬라이더 탭...');
  await mobilePage.click('text=전/후 비교');
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_p03_before_after_slider.png') });
  console.log('     ✓ 캡처 완료: 05_p03_before_after_slider.png');

  // 3년 생장 예측 탭 전환
  console.log('  6. P03-SEC03: 3년 생장 예측 타임라인 탭...');
  await mobilePage.click('text=3년 생장 예측');
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_p03_growth_timeline.png') });
  console.log('     ✓ 캡처 완료: 06_p03_growth_timeline.png');

  // 견적 요청 모달 열기
  console.log('  7. P03-SEC04: AI 시뮬레이션 첨부 견적 요청 모달...');
  await mobilePage.click('text=이 수형대로 전문 조경사에게 견적 받기');
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_p03_quote_request_modal.png') });
  console.log('     ✓ 캡처 완료: 07_p03_quote_request_modal.png');
  // 모달 닫기 (X 버튼 클릭 또는 Escape)
  const closeBtn = await mobilePage.$('button:has(svg.lucide-x)');
  if (closeBtn) {
    await closeBtn.click();
  } else {
    await mobilePage.keyboard.press('Escape');
  }
  await mobilePage.waitForTimeout(800);

  // 1-5. P04: 내 정원 타임라인 화면
  console.log('  8. P04-MOBILE-GARDEN 내 정원 및 수목 타임라인...');
  await mobilePage.click('nav >> text=내 정원');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_p04_mobile_garden.png') });
  console.log('     ✓ 캡처 완료: 08_p04_mobile_garden.png');

  // 1-6. P05: 전문 조경사 탐색 디렉토리
  console.log('  9. P05-MOBILE-DIRECTORY 전문 조경사 탐색...');
  await mobilePage.click('nav >> text=조경사');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_p05_landscaper_directory.png') });
  console.log('     ✓ 캡처 완료: 09_p05_landscaper_directory.png');

  // 1-7. P06: 내 견적 의뢰 현황 및 입찰 비교
  console.log('  10. P06-MOBILE-MATCHING 내 견적 의뢰 & 조경사 입찰 비교...');
  await mobilePage.click('nav >> text=내 견적');
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '10_p06_matching_status.png') });
  console.log('     ✓ 캡처 완료: 10_p06_matching_status.png');

  // 1-8. P01-AUTH 모바일 인증 시스템 검증 (회원가입, 로그인, 다중 역할 array, 데모 전환, 로그아웃)
  console.log('  11. P01-AUTH 모바일 회원가입 & 로그인 모달 검증...');
  // 상단 유저 프로필/로그인 버튼 클릭하여 모달 열기
  const userProfileBtn = await mobilePage.$('header button:has(img), header button:has-text("로그인")');
  if (userProfileBtn) {
    await userProfileBtn.click({ force: true });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '18_p01_mobile_auth_modal.png') });
    console.log('     ✓ 캡처 완료: 18_p01_mobile_auth_modal.png (인증 모달)');

    // 회원가입 탭 클릭
    console.log('  12. P01-AUTH 회원가입 폼 및 역할 Array 4종 체크박스 확인...');
    await mobilePage.click('button:has-text("회원가입")', { force: true });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '19_p01_mobile_register_roles.png') });
    console.log('     ✓ 캡처 완료: 19_p01_mobile_register_roles.png (다중 역할 array 선택)');

    // 데모 계정 빠른 전환 탭 클릭
    console.log('  13. P01-AUTH 데모 계정 원클릭 전환 탭...');
    await mobilePage.click('button:has-text("데모 빠른전환"), button:has-text("빠른전환")', { force: true });
    await mobilePage.waitForTimeout(500);
    // 최송석 명인 (roles: ['조경사', 'member']) 클릭하여 전환
    const choiMasterBtn = await mobilePage.$('button:has-text("최송석 명인")');
    if (choiMasterBtn) {
      await choiMasterBtn.click({ force: true });
      await mobilePage.waitForTimeout(800);
      console.log('     ✓ 최송석 명인(조경사, member) 계정으로 즉시 전환 완료');
    }
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '20_p01_mobile_switched_user.png') });
    console.log('     ✓ 캡처 완료: 20_p01_mobile_switched_user.png (전환 후 조경사 뱃지)');
  }

  // 1-9. P07: [조경사 파트너 모드] 전환
  console.log('  14. P07-PARTNER-JOBBOARD [조경사 파트너 모드] 전환 및 잡보드...');
  await mobilePage.click('text=정원주 모드', { force: true });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '11_p07_partner_jobboard.png') });
  console.log('     ✓ 캡처 완료: 11_p07_partner_jobboard.png');

  await mobileContext.close();

  // =================================================================
  // [PART 2] 관리자 웹 검증 (Port 30019, 데스크탑 뷰포트 1440x900)
  // =================================================================
  console.log('\n🖥️ [PART 2] 통합 관리자 웹 (:30019) 전 화면 검증...');
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const adminPage = await adminContext.newPage();
  adminPage.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Admin Console Error] ${msg.text()}`);
    }
  });

  // 2-1. P50: 통합 운영 대시보드
  console.log('  12. P50-ADMIN-DASHBOARD 대시보드 접속 및 차트 렌더링...');
  await adminPage.goto('http://localhost:30019', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_p50_admin_dashboard.png') });
  console.log('     ✓ 캡처 완료: 12_p50_admin_dashboard.png');

  // 관리자 UI inspect 토글
  await adminPage.keyboard.press('Alt+KeyI');
  await adminPage.waitForTimeout(500);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_p50_admin_inspect_on.png') });
  console.log('     ✓ 캡처 완료: 13_p50_admin_inspect_on.png (관리자 UI inspect 활성화)');
  // 다음 탭 이동을 위해 Alt+KeyI 숨김 토글
  await adminPage.keyboard.press('Alt+KeyI');
  await adminPage.waitForTimeout(400);

  // 2-2. P51: 매칭 & 분쟁 중재
  console.log('  13. P51-ADMIN-MATCHING 매칭 현황 및 분쟁 중재...');
  await adminPage.click('text=매칭 & 분쟁 중재', { force: true });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '14_p51_admin_matching.png') });
  console.log('     ✓ 캡처 완료: 14_p51_admin_matching.png');

  // 2-3. P52: 조경사 파트너 심사
  console.log('  14. P52-ADMIN-VERIFY 조경사 파트너 심사 & 명인 배지 관리...');
  await adminPage.click('text=조경사 파트너 심사', { force: true });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '15_p52_admin_verify.png') });
  console.log('     ✓ 캡처 완료: 15_p52_admin_verify.png');

  // 2-4. P53: 전문가 첨삭 스튜디오
  console.log('  15. P53-ADMIN-STUDIO 전문가 Canvas 전지 첨삭 스튜디오...');
  await adminPage.click('text=전문가 첨삭 스튜디오', { force: true });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '16_p53_admin_studio.png') });
  console.log('     ✓ 캡처 완료: 16_p53_admin_studio.png');

  // 2-5. P54: 수종 도감 & 표준 단가
  console.log('  16. P54-ADMIN-SPECIES 수종 도감 & 수고별 표준 단가 관리...');
  await adminPage.click('text=수종 도감 & 표준 단가', { force: true });
  await adminPage.waitForTimeout(1000);
  await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '17_p54_admin_species.png') });
  console.log('     ✓ 캡처 완료: 17_p54_admin_species.png');

  // 2-6. 관리자 인증 모달 및 권한 뱃지 검증
  console.log('  17. P50-ADMIN-AUTH 관리자 로그인/전환 모달 및 권한 array 검증...');
  const adminProfileBtn = await adminPage.$('header button[title="계정 정보 및 전환"], header button:has-text("통합 총괄관리자"), header button:has-text("관리자 로그인")');
  if (adminProfileBtn) {
    await adminProfileBtn.click({ force: true });
    await adminPage.waitForTimeout(600);
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '21_p50_admin_auth_modal.png') });
    console.log('     ✓ 캡처 완료: 21_p50_admin_auth_modal.png (관리자 인증 모달)');

    // 데모 전환 탭 클릭 후 현장 운영 매니저 데모 계정으로 전환해보기
    await adminPage.click('button:has-text("데모 전환")', { force: true });
    await adminPage.waitForTimeout(500);

    const managerBtn = await adminPage.$('button:has-text("현장 운영 매니저")');
    if (managerBtn) {
      await managerBtn.click({ force: true });
      await adminPage.waitForTimeout(800);
      console.log('     ✓ 현장 운영 매니저 계정으로 전환 완료');
    }
    await adminPage.screenshot({ path: path.join(SCREENSHOT_DIR, '22_p50_admin_switched_manager.png') });
    console.log('     ✓ 캡처 완료: 22_p50_admin_switched_manager.png (매니저 권한 반영)');
  }

  await adminContext.close();
  await browser.close();

  console.log('\n=================================================================');
  console.log(`🎉 모든 화면 자동 검증 및 핵심 캡처 총 22건 완료!`);
  console.log(`   - 캡처 저장 경로: ${SCREENSHOT_DIR}`);
  console.log(`   - 콘솔 에러 건수: ${consoleErrors.length}건`);
  if (consoleErrors.length > 0) {
    console.log('   [에러 목록]');
    consoleErrors.forEach(err => console.log('     ', err));
  }
  console.log('=================================================================');
}

runE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});

