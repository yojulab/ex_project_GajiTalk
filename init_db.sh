#!/usr/bin/env bash
# ==============================================================================
# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 플랫폼
# 운영 서버 데이터베이스 초기값 설정 및 시딩 스크립트 (init_db.sh)
#
# [설정 기준]
#   • ./backend/.env (또는 ./apps/backend/.env) 설정을 엄격히 따릅니다.
#   • MONGODB_URI, MONGODB_DB_NAME, SEED_ADMIN_EMAIL 등의 설정을 로드하여 적용합니다.
#
# [작업 내용]
#   1. 5대 핵심 컬렉션 초기화 (User, Garden, PruningSimulation, MatchingRequest, TreeSpecies)
#   2. 조경·수목 전지 표준 수종 도감 8종 자동 적재 (소나무, 단풍나무, 배롱나무, 향나무, 회양목 등)
#   3. 운영 기본 계정 생성 (통합 총괄관리자, 현장 운영 매니저, 정원주 회원 3명, 조경 명인/의사/기사 4명)
#   4. 샘플 실사 정원, 전지 가이드라인 좌표(cuttingGuides), 시계열 생장 시뮬레이션 및 매칭 데이터 적재
#   5. 2dsphere 위치 인덱스 자동 생성
#
# [사용법]
#   ./init_db.sh [옵션] [MONGODB_URI]
#   npm run db:init
#   npm run seed
#   ./run_port.sh seed
#
# [옵션]
#   -u, --uri <URI>    특정 MongoDB URI 오버라이드 지정
#   -d, --dry-run      실제 DB를 변경하지 않고 로드된 설정과 대상 정보만 확인
#   -f, --force        확인 프롬프트 없이 즉시 초기화 실행 (배포 자동화용)
#   -h, --help         도움말 출력
# ==============================================================================

# source 또는 . 으로 실행 시 터미널 세션 닫힘(exit) 방지 -> 서브쉘 위임
if [ -n "${BASH_SOURCE[0]:-}" ] && [ "$0" != "${BASH_SOURCE[0]}" ]; then
  bash "${BASH_SOURCE[0]}" "$@"
  return $? 2>/dev/null || exit $?
fi

set -euo pipefail

# 터미널 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/apps/backend"

# node_modules/.bin 경로를 PATH 최우선으로 등록
export PATH="${PROJECT_ROOT}/node_modules/.bin:${BACKEND_DIR}/node_modules/.bin:${PATH}"

# 하위 워크스페이스 심볼릭 링크 안전 복원 (tsc: not found 원천 차단)
ensure_bin_links() {
  local root_bin="${PROJECT_ROOT}/node_modules/.bin"
  if [ -d "$root_bin" ]; then
    for sub in apps/mobile-app apps/admin-web apps/backend; do
      local sub_dir="${PROJECT_ROOT}/${sub}"
      if [ -d "$sub_dir" ]; then
        mkdir -p "${sub_dir}/node_modules"
        rm -rf "${sub_dir}/node_modules/.bin" 2>/dev/null || true
        ln -sf "${root_bin}" "${sub_dir}/node_modules/.bin" 2>/dev/null || true
      fi
    done
  fi
}
ensure_bin_links

# 1. ./backend/.env 또는 ./apps/backend/.env 탐색
ENV_FILE=""
if [ -f "${BACKEND_DIR}/.env" ]; then
  ENV_FILE="${BACKEND_DIR}/.env"
elif [ -f "${PROJECT_ROOT}/backend/.env" ]; then
  ENV_FILE="${PROJECT_ROOT}/backend/.env"
elif [ -f "${PROJECT_ROOT}/.env" ]; then
  ENV_FILE="${PROJECT_ROOT}/.env"
fi

print_banner() {
  cat << "EOF"
======================================================================
 🌲 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 운영 DB 초기값 설정기 (init_db.sh)
======================================================================
EOF
}

show_help() {
  print_banner
  cat << EOF
사용법: $0 [옵션] [MONGODB_URI]

설명:
  ./backend/.env 설정을 읽어 운영 데이터베이스 초기화 및 기본 데이터를 적재합니다.

인수:
  MONGODB_URI              MongoDB 연결 URI 오버라이드 (지정하지 않으면 ./backend/.env 설정 사용)

옵션:
  -u, --uri <URI>          특정 MongoDB URI 직접 지정
  -d, --dry-run            실제 DB를 초기화하지 않고 설정 정보만 점검
  -f, --force              확인 절차 없이 즉시 실행
  -h, --help               도움말 출력

실행 예시:
  $0
  npm run db:init
  ./run_port.sh seed
  $0 --dry-run
  $0 "mongodb://admin:admin123@external_project_db_mongo:27017/soohyung?authSource=admin"
======================================================================
EOF
  exit 0
}

OVERRIDE_URI=""
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -u|--uri)
      OVERRIDE_URI="$2"
      shift 2
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -f|--force)
      FORCE=true
      shift
      ;;
    -*)
      echo -e "${RED}[오류] 알 수 없는 옵션: $1${NC}"
      show_help
      ;;
    *)
      if [ -z "$OVERRIDE_URI" ]; then
        OVERRIDE_URI="$1"
      fi
      shift
      ;;
  esac
done

print_banner

# 환경 변수 파일 유무 점검
if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}⚠️  ./backend/.env 설정 파일이 발견되지 않았습니다.${NC}"
  echo -e "   먼저 운영 환경 변수를 생성합니다: ${CYAN}./generate_env.sh${NC}\n"
  if [ -x "${PROJECT_ROOT}/generate_env.sh" ]; then
    "${PROJECT_ROOT}/generate_env.sh"
    ENV_FILE="${BACKEND_DIR}/.env"
  else
    echo -e "${RED}[오류] generate_env.sh 스크립트가 없습니다.${NC}"
    exit 1
  fi
fi

# ./backend/.env 파일 환경 변수 로드
REL_ENV_FILE="${ENV_FILE#$PROJECT_ROOT/}"
echo -e "${CYAN}▶ 참조 환경 변수 파일  :${NC} ${BOLD}./${REL_ENV_FILE}${NC}"

# .env 파일에서 주요 변수 파싱
TARGET_MONGO_URI=$(grep -E '^MONGODB_URI=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
TARGET_DB_NAME=$(grep -E '^MONGODB_DB_NAME=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
TARGET_NODE_ENV=$(grep -E '^NODE_ENV=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
SEED_ADMIN_EMAIL=$(grep -E '^SEED_ADMIN_EMAIL=' "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)

if [ -n "$OVERRIDE_URI" ]; then
  TARGET_MONGO_URI="$OVERRIDE_URI"
  echo -e "${YELLOW}▶ 사용자 오버라이드 URI 적용${NC}"
fi

if [ -z "$TARGET_MONGO_URI" ]; then
  TARGET_MONGO_URI="mongodb://admin:admin123@external_project_db_mongo:27017/soohyung?authSource=admin"
fi

if [ -z "$TARGET_DB_NAME" ]; then
  TARGET_DB_NAME="soohyung"
fi

MASKED_URI=$(echo "$TARGET_MONGO_URI" | sed -E 's/(mongodb:\/\/[^:]+:)[^@]+(@)/\1****\2/')

echo -e "${CYAN}▶ 실행 환경 (NODE_ENV) :${NC} ${BOLD}${TARGET_NODE_ENV:-production}${NC}"
echo -e "${CYAN}▶ 대상 데이터베이스    :${NC} ${BOLD}${TARGET_DB_NAME}${NC}"
echo -e "${CYAN}▶ 관리자 계정 ID        :${NC} ${BOLD}${SEED_ADMIN_EMAIL:-admin@soohyung.kr}${NC}"
echo -e "${CYAN}▶ MongoDB 대상 URI     :${NC} ${GREEN}${MASKED_URI}${NC}"
echo "----------------------------------------------------------------------"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}[DRY-RUN] 설정 검증 완료: 실제 데이터베이스 초기화는 수행되지 않았습니다.${NC}"
  echo -e "   초기화 실행 시 명령어: ${BOLD}$0 --force${NC}"
  exit 0
fi

# 백엔드 컴파일 상태 점검 및 자동 빌드 (안전한 tsc 탐색)
SEED_JS="${BACKEND_DIR}/dist/seed/seedRunner.js"
if [ ! -f "$SEED_JS" ]; then
  echo -e "${CYAN}🔨 백엔드 컴파일 산출물이 없어 사전 컴파일을 진행합니다...${NC}"
  if [ -x "${PROJECT_ROOT}/compile.sh" ]; then
    "${PROJECT_ROOT}/compile.sh" 30020
  elif [ -x "${PROJECT_ROOT}/node_modules/.bin/tsc" ]; then
    (cd "$BACKEND_DIR" && "${PROJECT_ROOT}/node_modules/.bin/tsc")
  elif command -v tsc >/dev/null 2>&1; then
    (cd "$BACKEND_DIR" && tsc)
  else
    (cd "$BACKEND_DIR" && npm run build)
  fi
fi

# MongoDB 연결성 사전 프로브 (네트워크 호스트 추출)
PROBE_HOST=$(echo "$TARGET_MONGO_URI" | sed -E 's/mongodb:\/\/([^:]+:[^@]+@)?([^:\/]+).*/\2/')
PROBE_PORT=$(echo "$TARGET_MONGO_URI" | sed -E 's/mongodb:\/\/([^:]+:[^@]+@)?[^:\/]+:?([0-9]*).*/\2/')
PROBE_PORT="${PROBE_PORT:-27017}"

echo -e "${CYAN}📡 대상 MongoDB (${PROBE_HOST}:${PROBE_PORT}) 연결 확인 중...${NC}"
CAN_CONNECT=false

if command -v python3 >/dev/null 2>&1; then
  if python3 -c "import socket; s=socket.socket(); s.settimeout(2.0); exit(0 if s.connect_ex(('${PROBE_HOST}', ${PROBE_PORT}))==0 else 1)" 2>/dev/null; then
    CAN_CONNECT=true
  fi
fi

if [ "$CAN_CONNECT" = false ] && command -v timeout >/dev/null 2>&1; then
  if timeout 2 bash -c "(: > /dev/tcp/${PROBE_HOST}/${PROBE_PORT}) >/dev/null 2>&1" 2>/dev/null; then
    CAN_CONNECT=true
  fi
fi

if [ "$CAN_CONNECT" = false ]; then
  echo -e "${YELLOW}⚠️  [네트워크 안내] 현재 환경에서 '${PROBE_HOST}:${PROBE_PORT}'로 직접 소켓 연결이 되지 않습니다.${NC}"
  echo -e "   • 원인: 본 스크립트 실행 위치가 Docker 외부이거나 대상 호스트가 아직 기동되지 않았을 수 있습니다."
  echo -e "   • 운영 서버 Docker 컨테이너 내부 또는 Compose 네트워크 환경에서 실행해야 할 수 있습니다."
  echo -e "   • 계속 연결 시도를 진행합니다 (타임아웃 5초)..."
fi

# 시드 러너 실행
echo -e "\n${CYAN}🚀 운영 데이터베이스 초기값 설정(Seeding) 시작...${NC}"
cd "$BACKEND_DIR"

export MONGODB_URI="$TARGET_MONGO_URI"
export NODE_ENV="${TARGET_NODE_ENV:-production}"

RUN_SUCCESS=false
if [ -f "dist/seed/seedRunner.js" ]; then
  if node dist/seed/seedRunner.js; then
    RUN_SUCCESS=true
  fi
fi

if [ "$RUN_SUCCESS" = false ]; then
  echo -e "${YELLOW}⚠️ node dist 실행 실패, ts-node를 통해 재시도합니다...${NC}"
  if [ -x "${PROJECT_ROOT}/node_modules/.bin/ts-node" ]; then
    "${PROJECT_ROOT}/node_modules/.bin/ts-node" src/seed/seedRunner.ts && RUN_SUCCESS=true || true
  elif command -v ts-node >/dev/null 2>&1; then
    ts-node src/seed/seedRunner.ts && RUN_SUCCESS=true || true
  fi
fi

cd "$PROJECT_ROOT"

if [ "$RUN_SUCCESS" = true ]; then
  echo "----------------------------------------------------------------------"
  echo -e "${GREEN}${BOLD}✨ 운영 데이터베이스 초기값 설정이 성공적으로 완료되었습니다!${NC}"
  echo -e "   • 수종 도감     : 8종 표준 수종 도감 적재 완료"
  echo -e "   • 기본 계정     : 관리자(admin@soohyung.kr) 및 조경 명인/회원 데이터 생성"
  echo -e "   • 기본 비밀번호 : admin123"
  echo -e "   • 시뮬레이션    : 소나무/단풍나무 전지 및 생장 예측 샘플 탑재"
  echo -e "   • 서비스 재시작 : ${CYAN}./run_port.sh restart all${NC}"
  echo "======================================================================"
  exit 0
else
  echo -e "${RED}[오류] 데이터베이스 초기값 설정 중 오류가 발생했습니다.${NC}"
  echo -e "   MongoDB 연결 정보(${MASKED_URI})와 네트워크 접근 상태를 확인해 주세요."
  exit 1
fi
