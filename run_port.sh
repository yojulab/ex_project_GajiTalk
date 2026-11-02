#!/usr/bin/env bash
# ==============================================================================
# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 플랫폼 - 포트 관리 및 컴파일 통합 스크립트 (run_port.sh)
#
# [할당 포트 및 ./apps/ 폴더 구조]
#   • 30018 (mobile / app)   : ./apps/mobile-app  (정원주·조경사 모바일 웹/앱 - React + Vite)
#   • 30019 (admin)          : ./apps/admin-web   (통합 관리자 웹 & 첨삭 스튜디오 - React + Vite)
#   • 30020 (api / backend)  : ./apps/backend     (백엔드 REST API & AI/매칭 서버 - Node.js + MongoDB)
#
# [사용법]
#   ./run_port.sh [명령어] [대상]
#   ./compile.sh  [대상]             (컴파일 단축 실행)
#
# [주요 명령어]
#   • start (또는 prod) [all|30018|30019|30020] : 운영 모드 기동 (기본값)
#   • dev               [all|30018|30019|30020] : 개발 모드(HMR) 기동
#   • build (또는 compile) [all|30018|30019|30020] : 컴파일 / 빌드
#   • stop              [all|30018|30019|30020] : 서비스 종료
#   • restart           [all|30018|30019|30020] : 재시작
#   • status                                    : 포트 가동 상태 점검
#   • env               [MONGODB_URI]           : 운영 환경 변수(.env) 자동 생성
#   • seed              [MONGODB_URI]           : 운영 DB 초기값 설정 및 시딩 (./backend/.env 참조)
#
# [간편 축약 실행 예시]
#   • ./run_port.sh all             -> 전체 서비스(30018, 30019, 30020) 운영 모드 기동
#   • ./run_port.sh 30018           -> 30018(모바일 앱) 단일 운영 모드 기동
#   • ./compile.sh all              -> 전체 서비스 일괄 컴파일
#   • ./run_port.sh stop all        -> 전체 서비스 일괄 중지
#   • ./run_port.sh status          -> 현재 포트 및 PID 점검
# ==============================================================================
if [ -n "${BASH_SOURCE[0]:-}" ] && [ "$0" != "${BASH_SOURCE[0]}" ]; then
  bash "${BASH_SOURCE[0]}" "$@"
  return $? 2>/dev/null || exit $?
fi

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="${PROJECT_DIR}/node_modules/.bin:${PATH}"
LOG_DIR="${PROJECT_DIR}/logs"
TODAY=$(date +"%Y%m%d")
mkdir -p "$LOG_DIR"

# 터미널 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# 하위 워크스페이스(./apps/*) .bin 심볼릭 링크 자동 점검 및 복원 (절대 경로 보장)
ensure_bin_links() {
  local root_bin="${PROJECT_DIR}/node_modules/.bin"
  if [ -d "$root_bin" ]; then
    for sub in apps/mobile-app apps/admin-web apps/backend; do
      local sub_dir="${PROJECT_DIR}/${sub}"
      if [ -d "$sub_dir" ]; then
        mkdir -p "${sub_dir}/node_modules"
        rm -rf "${sub_dir}/node_modules/.bin" 2>/dev/null || true
        ln -sf "${root_bin}" "${sub_dir}/node_modules/.bin" 2>/dev/null || true
      fi
    done
  fi
}
ensure_bin_links

# 환경 변수(.env) 자동 점검 및 부트스트랩
ensure_env_files() {
  if [ ! -f "${PROJECT_DIR}/.env" ] || [ ! -f "${PROJECT_DIR}/apps/backend/.env" ] || [ ! -f "${PROJECT_DIR}/apps/mobile-app/.env" ] || [ ! -f "${PROJECT_DIR}/apps/admin-web/.env" ]; then
    if [ -x "${PROJECT_DIR}/generate_env.sh" ]; then
      echo -e "${YELLOW}ℹ️  누락된 환경 변수(.env) 파일이 감지되어 generate_env.sh를 자동 실행합니다...${NC}"
      "${PROJECT_DIR}/generate_env.sh"
    fi
  fi
}
ensure_env_files

# 포트 활성 여부 점검 (소켓 프로브 + /dev/tcp 안전망)
is_port_in_use() {
  local port=$1
  if command -v python3 >/dev/null 2>&1; then
    if python3 -c "import socket; s=socket.socket(); s.settimeout(0.3); exit(0 if s.connect_ex(('127.0.0.1', ${port}))==0 else 1)" 2>/dev/null; then
      return 0
    fi
  fi
  if command -v timeout >/dev/null 2>&1; then
    if timeout 0.3 bash -c "(: > /dev/tcp/127.0.0.1/${port}) >/dev/null 2>&1" 2>/dev/null; then
      return 0
    fi
  fi
  return 1
}

# 포트 점유 PID 획득 (pgrep 우선 -> timeout fuser 보조)
get_port_pids() {
  local port=$1
  local pids=""

  case "$port" in
    30018) pids=$(pgrep -f "(vite.*30018|PORT=30018|ex_project_GajiTalk/apps/mobile-app)" 2>/dev/null || true) ;;
    30019) pids=$(pgrep -f "(vite.*30019|PORT=30019|ex_project_GajiTalk/apps/admin-web)" 2>/dev/null || true) ;;
    30020) pids=$(pgrep -f "(PORT=30020|ex_project_GajiTalk/apps/backend)" 2>/dev/null || true) ;;
  esac

  if [ -z "$pids" ] && command -v timeout >/dev/null 2>&1 && command -v fuser >/dev/null 2>&1; then
    pids=$(timeout 0.5 fuser "${port}/tcp" 2>/dev/null || true)
  fi

  echo "$pids" | tr '\n' ' ' | xargs
}

# 서비스 메타데이터 조회: 상대경로:서비스명:빌드산출물
get_service_meta() {
  local port=$1
  case "$port" in
    30018) echo "apps/mobile-app:모바일 앱 - 정원주·조경사 (Vite):dist/index.html" ;;
    30019) echo "apps/admin-web:통합 관리자 웹 & 첨삭 스튜디오 (Vite):dist/index.html" ;;
    30020) echo "apps/backend:백엔드 REST API & AI/매칭 엔진 (Node.js):dist/index.js" ;;
    *)     echo "unknown:알 수 없음:" ;;
  esac
}

# ------------------------------------------------------------------------------
# 1. 컴파일 (Build / Compile)
# ------------------------------------------------------------------------------
ensure_build_deps() {
  local root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ -f "$root/package.json" ] && [ ! -d "$root/node_modules" ]; then
    echo -e "${YELLOW}⚠ 루트 node_modules 누락 감지 → 의존성 설치 진행...${NC}"
    (cd "$root" && NODE_ENV=development npm install --include=dev) || return 1
  fi
}

build_service() {
  local port=$1
  local meta
  meta=$(get_service_meta "$port")
  local ws_path=$(echo "$meta" | cut -d: -f1)
  local title=$(echo "$meta" | cut -d: -f2)

  if [ ! -d "${PROJECT_DIR}/${ws_path}" ] || [ ! -f "${PROJECT_DIR}/${ws_path}/package.json" ]; then
    echo -e "   ${YELLOW}⚠ [:${port}] ${PROJECT_DIR}/${ws_path}/package.json 파일이 아직 존재하지 않습니다.${NC}\n"
    return 1
  fi

  ensure_build_deps || { echo -e "   ${RED}✗ 의존성 설치 실패${NC}"; return 1; }
  echo -e "🔨 [:${port}] ${BOLD}${title}${NC} (${ws_path}) 컴파일 시작..."
  if (cd "${PROJECT_DIR}/${ws_path}" && npm run build); then
    echo -e "   ${GREEN}✓ [:${port}] 컴파일 완료${NC}\n"
    return 0
  else
    echo -e "   ${RED}✗ [:${port}] 컴파일 실패!${NC}\n"
    return 1
  fi
}

cmd_build() {
  local target=${1:-all}
  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 🌲 수형(SOOHYUNG) / 가지톡 컴파일 매니저 (대상: ${target})${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  case "$target" in
    30018|mobile|app|mobile-app) build_service 30018 ;;
    30019|admin|admin-web)       build_service 30019 ;;
    30020|api|backend)           build_service 30020 ;;
    all)
      build_service 30020
      build_service 30018
      build_service 30019
      echo -e "${GREEN}${BOLD}🎉 모든 서비스(30018, 30019, 30020) 컴파일 완료!${NC}"
      ;;
    *)
      echo -e "${RED}잘못된 대상입니다: ${target} (사용 가능: all, 30018, 30019, 30020)${NC}"
      exit 1
      ;;
  esac
}

# ------------------------------------------------------------------------------
# 2. 프로세스 종료 (Stop)
# ------------------------------------------------------------------------------
stop_service() {
  local port=$1
  local meta
  meta=$(get_service_meta "$port")
  local title=$(echo "$meta" | cut -d: -f2)
  local pids
  pids=$(get_port_pids "$port")

  echo -n -e "🛑 [:${port}] ${title} 중지 중... "
  if [ -n "$pids" ]; then
    kill -15 $pids 2>/dev/null || true
    sleep 1
    local remain_pids
    remain_pids=$(get_port_pids "$port")
    if [ -n "$remain_pids" ]; then
      kill -9 $remain_pids 2>/dev/null || true
    fi
    echo -e "${YELLOW}종료 완료 (PID: ${pids})${NC}"
  else
    echo -e "${NC}실행 중인 프로세스 없음${NC}"
  fi
}

cmd_stop() {
  local target=${1:-all}
  case "$target" in
    30018|mobile|app|mobile-app) stop_service 30018 ;;
    30019|admin|admin-web)       stop_service 30019 ;;
    30020|api|backend)           stop_service 30020 ;;
    all)
      stop_service 30018
      stop_service 30019
      stop_service 30020
      ;;
    *)
      echo -e "${RED}잘못된 대상입니다: ${target} (사용 가능: all, 30018, 30019, 30020)${NC}"
      exit 1
      ;;
  esac
}

# ------------------------------------------------------------------------------
# 3. 서비스 기동 (Start / Prod / Dev)
# ------------------------------------------------------------------------------
start_service() {
  local port=$1
  local mode=$2 # prod | dev
  local meta
  meta=$(get_service_meta "$port")
  local ws_path=$(echo "$meta" | cut -d: -f1)
  local ws_slug=$(echo "$ws_path" | tr '/' '_')
  local title=$(echo "$meta" | cut -d: -f2)
  local build_file=$(echo "$meta" | cut -d: -f3)
  local log_file="${LOG_DIR}/soohyung_${ws_slug}_${TODAY}.log"

  if [ ! -d "${PROJECT_DIR}/${ws_path}" ] || [ ! -f "${PROJECT_DIR}/${ws_path}/package.json" ]; then
    echo -e "⚠️ [:${port}] ${PROJECT_DIR}/${ws_path}/package.json 파일이 아직 준비되지 않았습니다."
    return 1
  fi

  # 운영 모드인데 빌드 산출물이 없으면 자동 컴파일 선행
  if [ "$mode" = "prod" ] && [ -n "$build_file" ] && [ ! -f "${PROJECT_DIR}/${ws_path}/${build_file}" ] && [ ! -f "${PROJECT_DIR}/${ws_path}/dist/main.js" ]; then
    echo -e "⚠️ [:${port}] 빌드 산출물이 없어 사전 컴파일을 자동 실행합니다..."
    build_service "$port" || return 1
  fi

  # 기존 점유 프로세스 정리
  stop_service "$port" >/dev/null 2>&1

  echo -e "🚀 [:${port}] ${BOLD}${title}${NC} (${ws_path}) 기동 중 (${mode} 모드)..."
  cd "${PROJECT_DIR}/${ws_path}"

  local bg_pid=""
  if [ "$mode" = "prod" ]; then
    setsid env NODE_ENV=production HOST="0.0.0.0" HOSTNAME="0.0.0.0" PORT="$port" npm run start </dev/null > "$log_file" 2>&1 &
    bg_pid=$!
  else
    setsid env NODE_ENV=development HOST="0.0.0.0" HOSTNAME="0.0.0.0" PORT="$port" npm run dev </dev/null > "$log_file" 2>&1 &
    bg_pid=$!
  fi

  cd "${PROJECT_DIR}"
  echo -e "   로그: ${log_file}"

  local max_wait=10
  if [ "$port" = "30020" ]; then
    max_wait=15
  fi

  for ((i=1; i<=max_wait; i++)); do
    sleep 1
    if is_port_in_use "$port"; then
      echo -e "   ${GREEN}✓ [:${port}] ONLINE 기동 성공 (PID: $(get_port_pids "$port"))${NC}\n"
      return 0
    fi
    if [ -n "$bg_pid" ] && ! kill -0 "$bg_pid" 2>/dev/null; then
      local current_pids=$(get_port_pids "$port")
      if [ -z "$current_pids" ]; then
        echo -e "   ${RED}✗ [:${port}] 프로세스 비정상 종료됨 (로그: ${log_file})${NC}"
        if [ -f "$log_file" ]; then
          echo -e "   ${RED}[최근 에러 로그]${NC}"
          tail -n 10 "$log_file" | sed 's/^/   /'
        fi
        echo ""
        return 1
      fi
    fi
  done

  echo -e "   ${YELLOW}⏳ [:${port}] 포트 바인딩 대기 중 (상태 확인: ./run_port.sh status)${NC}\n"
}

cmd_start() {
  local mode=$1
  local target=${2:-all}

  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 🌲 수형(SOOHYUNG) / 가지톡 서비스 기동 매니저 (모드: ${mode}, 대상: ${target})${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  case "$target" in
    30018|mobile|app|mobile-app) start_service 30018 "$mode" ;;
    30019|admin|admin-web)       start_service 30019 "$mode" ;;
    30020|api|backend)           start_service 30020 "$mode" ;;
    all)
      start_service 30020 "$mode" # 백엔드(:30020) 우선 기동
      start_service 30018 "$mode" # 모바일 앱(:30018) 기동
      start_service 30019 "$mode" # 관리자 웹(:30019) 기동
      ;;
    *)
      echo -e "${RED}잘못된 대상입니다: ${target} (사용 가능: all, 30018, 30019, 30020)${NC}"
      exit 1
      ;;
  esac
}

# ------------------------------------------------------------------------------
# 4. 상태 점검 (Status)
# ------------------------------------------------------------------------------
cmd_status() {
  echo -e "${CYAN}=================================================================${NC}"
  echo -e "${CYAN} 🌲 수형(SOOHYUNG) / 가지톡 통합 서비스 상태 점검 (status)${NC}"
  echo -e "${CYAN}=================================================================${NC}"

  for port in 30020 30018 30019; do
    local meta
    meta=$(get_service_meta "$port")
    local ws_path=$(echo "$meta" | cut -d: -f1)
    local title=$(echo "$meta" | cut -d: -f2)
    local pids
    pids=$(get_port_pids "$port")

    if is_port_in_use "$port"; then
      echo -e "  • [:${port}] ${BOLD}${title}${NC} (${ws_path}) : ${GREEN}ONLINE${NC} (PID: ${pids:-확인중}) ✓"
    elif [ -n "$pids" ]; then
      echo -e "  • [:${port}] ${BOLD}${title}${NC} (${ws_path}) : ${YELLOW}INITIALIZING / PORT_WAIT${NC} (PID: ${pids})"
    else
      echo -e "  • [:${port}] ${BOLD}${title}${NC} (${ws_path}) : ${RED}STOPPED${NC}"
    fi
  done

  echo -e "\n🌐 접속 URL (./apps/ 하위 멀티 서비스):"
  echo -e "   - [Port 30018] 모바일 앱 (정원주·조경사) : http://0.0.0.0:30018  (./apps/mobile-app)"
  echo -e "   - [Port 30019] 통합 관리자 웹 & 스튜디오 : http://0.0.0.0:30019  (./apps/admin-web)"
  echo -e "   - [Port 30020] 백엔드 REST API 서버      : http://0.0.0.0:30020/api  (./apps/backend)"
  echo -e "${CYAN}=================================================================${NC}"
}

# ------------------------------------------------------------------------------
# 메인 CLI 라우팅
# ------------------------------------------------------------------------------
MAIN_ARG="${1:-}"
SCRIPT_BASE=$(basename "$0")

if [ "$SCRIPT_BASE" = "compile.sh" ]; then
  cmd_build "${MAIN_ARG:-all}"
  exit $?
fi

case "$MAIN_ARG" in
  build|compile)
    cmd_build "${2:-all}"
    ;;
  start|prod)
    cmd_start "prod" "${2:-all}"
    ;;
  dev)
    cmd_start "dev" "${2:-all}"
    ;;
  stop)
    cmd_stop "${2:-all}"
    ;;
  restart)
    cmd_stop "${2:-all}"
    sleep 1
    cmd_start "prod" "${2:-all}"
    ;;
  status)
    cmd_status
    ;;
  env|setup-env)
    shift || true
    "${PROJECT_DIR}/generate_env.sh" "$@"
    exit $?
    ;;
  seed|init-db)
    shift || true
    "${PROJECT_DIR}/init_db.sh" "$@"
    exit $?
    ;;
  30018|30019|30020|mobile|admin|api|backend|all)
    cmd_start "prod" "$MAIN_ARG"
    ;;
  "")
    cmd_status
    echo -e "\n💡 ${BOLD}간편 사용 가이드:${NC}"
    echo -e "   • ./run_port.sh all              (운영 모드 전체 기동: 30018, 30019, 30020)"
    echo -e "   • ./run_port.sh dev all          (개발 모드 전체 기동)"
    echo -e "   • ./run_port.sh compile all      (전체 컴파일 / 빌드, 또는 ./compile.sh all)"
    echo -e "   • ./run_port.sh stop all         (전체 프로세스 종료)"
    echo -e "   • ./run_port.sh restart all      (전체 재시작)"
    echo -e "   • ./run_port.sh status           (가동 상태 점검)"
    echo -e "   ※ 대상 자리에 30018(mobile), 30019(admin), 30020(backend)을 지정하여 개별 제어 가능\n"
    ;;
  *)
    echo -e "${RED}알 수 없는 명령어: ${MAIN_ARG}${NC}"
    echo -e "사용법: ./run_port.sh [start|dev|build|stop|restart|status] [all|30018|30019|30020]"
    exit 1
    ;;
esac
