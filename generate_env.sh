#!/usr/bin/env bash
# ==============================================================================
# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 플랫폼
# 운영 서버 환경 변수(.env) 자동 생성 스크립트 (generate_env.sh)
#
# [용도]
#   운영 환경(Production)에서 3대 서비스(mobile-app, admin-web, backend) 및 루트에
#   필요한 .env 파일들을 일괄 자동 생성하고 백업을 관리합니다.
#
# [기본 접속 정보]
#   • MongoDB URI: mongodb://admin:admin123@external_project_db_mongo:27017/
#   • Database Name: soohyung (authSource=admin)
#   • Port 30018 : ./apps/mobile-app (정원주·조경사 모바일 웹/앱)
#   • Port 30019 : ./apps/admin-web  (통합 관리자 웹 & 첨삭 스튜디오)
#   • Port 30020 : ./apps/backend    (REST API & AI 시뮬레이션/매칭 서버)
#
# [사용법]
#   ./generate_env.sh [옵션] [MONGODB_URI]
#
# [예시]
#   1. 기본 운영 설정으로 즉시 자동 생성 (가장 간편한 방법):
#      ./generate_env.sh
#
#   2. 사용자 지정 MongoDB URI 지정:
#      ./generate_env.sh "mongodb://admin:admin123@external_project_db_mongo:27017/"
#
#   3. 옵션 플래그 사용:
#      ./generate_env.sh --uri "mongodb://admin:admin123@external_project_db_mongo:27017/" --env production
#      ./generate_env.sh --dry-run
# ==============================================================================

_main() {
  set -euo pipefail

  # 터미널 컬러 정의
  local RED='\033[0;31m'
  local GREEN='\033[0;32m'
  local YELLOW='\033[1;33m'
  local BLUE='\033[0;34m'
  local CYAN='\033[0;36m'
  local BOLD='\033[1m'
  local NC='\033[0m'

  local PROJECT_ROOT
  PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  export PATH="${PROJECT_ROOT}/node_modules/.bin:${PATH}"

# 하위 워크스페이스 심볼릭 링크 안전 복원
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

BACKUP_DIR="${PROJECT_ROOT}/.env_backups"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
GEN_DATE="$(date +'%Y-%m-%d %H:%M:%S')"

# 기본 설정값
DEFAULT_MONGO_URI="mongodb://admin:admin123@external_project_db_mongo:27017/"
TARGET_NODE_ENV="production"
PORT_MOBILE=30018
PORT_ADMIN=30019
PORT_BACKEND=30020
DO_BACKUP=true
DRY_RUN=false
FORCE=false

print_banner() {
  cat << "EOF"
======================================================================
 🌲 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 운영 서버 .env 자동 생성기
======================================================================
EOF
}

show_help() {
  print_banner
  cat << EOF
사용법: $0 [옵션] [MONGODB_URI]

인수:
  MONGODB_URI              MongoDB 연결 URI (기본값: ${DEFAULT_MONGO_URI})

옵션:
  -u, --uri <URI>          MongoDB URI 지정
  -e, --env <ENV>          실행 환경 모드 (기본값: production, development 가능)
  --no-backup              기존 .env 파일 백업 생성 건너뛰기
  -d, --dry-run            파일을 실제로 쓰지 않고 생성 내용 미리보기
  -f, --force              덮어쓰기 확인 없이 즉시 진행
  -h, --help               도움말 출력

예시:
  $0
  $0 "mongodb://admin:admin123@external_project_db_mongo:27017/"
  $0 --env production --uri "mongodb://admin:admin123@external_project_db_mongo:27017/"
  npm run env:prod
======================================================================
EOF
  return 0
}

# 인자 파싱
RAW_URI=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      return 0
      ;;
    -u|--uri)
      RAW_URI="$2"
      shift 2
      ;;
    -e|--env)
      TARGET_NODE_ENV="$2"
      shift 2
      ;;
    --no-backup)
      DO_BACKUP=false
      shift
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
      if [ -z "$RAW_URI" ]; then
        RAW_URI="$1"
      fi
      shift
      ;;
  esac
done

if [ -z "$RAW_URI" ]; then
  RAW_URI="${MONGODB_URI:-$DEFAULT_MONGO_URI}"
fi

# MongoDB URI 정규화 및 파싱 로직 (Python 기반 스마트 정규화 + Fallback)
parse_and_normalize_uri() {
  local input_uri="$1"
  python3 -c "
import urllib.parse, sys

raw = sys.argv[1]
p = urllib.parse.urlparse(raw)
scheme = p.scheme or 'mongodb'
user = p.username or 'admin'
pwd = p.password or 'admin123'
host = p.hostname or 'external_project_db_mongo'
port = str(p.port or 27017)
path = p.path.strip('/') if p.path else ''
dbname = path if path else 'soohyung'
query = p.query

if not query:
    query = 'authSource=admin'
elif 'authSource' not in query:
    query = query + '&authSource=admin'

netloc = ''
if user:
    netloc += user
    if pwd:
        netloc += ':' + pwd
    netloc += '@'
netloc += host
if port:
    netloc += ':' + port

norm_uri = f'{scheme}://{netloc}/{dbname}?{query}'

print(f'PARSED_HOST={host}')
print(f'PARSED_PORT={port}')
print(f'PARSED_USER={user}')
print(f'PARSED_PASSWORD={pwd}')
print(f'PARSED_DB_NAME={dbname}')
print(f'PARSED_FULL_URI={norm_uri}')
" "$input_uri"
}

# URI 정규화 수행
PARSED_ENV=$(parse_and_normalize_uri "$RAW_URI")
eval "$PARSED_ENV"

# 마스킹된 URI 생성 (로그 출력용)
MASKED_URI=$(echo "$PARSED_FULL_URI" | sed -E 's/(mongodb:\/\/[^:]+:)[^@]+(@)/\1****\2/')

print_banner
echo -e "${CYAN}▶ 실행 환경 (NODE_ENV)   :${NC} ${BOLD}${TARGET_NODE_ENV}${NC}"
echo -e "${CYAN}▶ 대상 MongoDB 호스트   :${NC} ${BOLD}${PARSED_HOST}:${PARSED_PORT}${NC}"
echo -e "${CYAN}▶ MongoDB 데이터베이스   :${NC} ${BOLD}${PARSED_DB_NAME}${NC}"
echo -e "${CYAN}▶ MongoDB 연결 URI      :${NC} ${GREEN}${MASKED_URI}${NC}"
echo -e "${CYAN}▶ 백업 활성화 여부       :${NC} ${DO_BACKUP}"
if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}▶ 모드                   :${NC} ${BOLD}DRY-RUN (파일을 생성하지 않고 미리보기만 수행)${NC}"
fi
echo "----------------------------------------------------------------------"

# 기존 .env 백업 함수
backup_existing_envs() {
  if [ "$DO_BACKUP" = false ] || [ "$DRY_RUN" = true ]; then
    return 0
  fi

  local targets=(
    "${PROJECT_ROOT}/.env"
    "${PROJECT_ROOT}/apps/backend/.env"
    "${PROJECT_ROOT}/apps/mobile-app/.env"
    "${PROJECT_ROOT}/apps/admin-web/.env"
  )

  local backup_sub_dir="${BACKUP_DIR}/${TIMESTAMP}"
  local backed_up=false

  for file in "${targets[@]}"; do
    if [ -f "$file" ]; then
      if [ "$backed_up" = false ]; then
        mkdir -p "$backup_sub_dir"
        backed_up=true
      fi
      local rel_path="${file#$PROJECT_ROOT/}"
      local dest_path="${backup_sub_dir}/${rel_path}"
      mkdir -p "$(dirname "$dest_path")"
      cp -p "$file" "$dest_path"
    fi
  done

  if [ "$backed_up" = true ]; then
    echo -e "${YELLOW}📦 기존 .env 파일 백업 완료:${NC} ${backup_sub_dir}"
  fi
}

# 1. 루트 .env 내용 생성
generate_root_env() {
  cat << EOF
# ==============================================================================
# 수형 (SOOHYUNG) / 가지톡 (GajiTalk) 루트 통합 환경 변수
# 자동 생성 일시: ${GEN_DATE}
# 환경 모드: ${TARGET_NODE_ENV}
# ==============================================================================
NODE_ENV=${TARGET_NODE_ENV}

# MongoDB 연결 설정 (운영 컨테이너 네트워크: external_project_db_mongo)
MONGO_HOST=${PARSED_HOST}
MONGO_PORT=${PARSED_PORT}
MONGO_USER=${PARSED_USER}
MONGO_PASSWORD=${PARSED_PASSWORD}
MONGODB_DB_NAME=${PARSED_DB_NAME}
MONGODB_URI=${PARSED_FULL_URI}
EOF
}

# 2. 백엔드 apps/backend/.env 내용 생성
generate_backend_env() {
  cat << EOF
# ==============================================================================
# [Port ${PORT_BACKEND}] 수형 (SOOHYUNG) 백엔드 REST API & AI/매칭 엔진 (.env)
# 자동 생성 일시: ${GEN_DATE}
# 환경 모드: ${TARGET_NODE_ENV}
# ==============================================================================
NODE_ENV=${TARGET_NODE_ENV}
PORT=${PORT_BACKEND}
API_PREFIX=/api
CORS_ORIGINS=*

# MongoDB 연결 설정 (운영 컨테이너: ${PARSED_HOST})
MONGO_HOST=${PARSED_HOST}
MONGO_PORT=${PARSED_PORT}
MONGO_USER=${PARSED_USER}
MONGO_PASSWORD=${PARSED_PASSWORD}
MONGODB_DB_NAME=${PARSED_DB_NAME}
MONGODB_URI=${PARSED_FULL_URI}

# JWT 인증 및 보안 설정
JWT_SECRET=soohyung_master_secret_key_2026_gajitalk_jwt_security_token_64chars_min
JWT_EXPIRES_IN=7d
BCRYPT_COST=10

# Vision AI & Image Inpainting 파이프라인
AI_API_KEY=__VISION_AND_INPAINTING_AI_API_KEY__
VISION_AI_MODEL=gemini-2.5-pro
INPAINTING_API_URL=https://api.soohyung.ai/v1/inpaint

# 초기 시드 계정 및 샘플 데이터
SEED_ADMIN_EMAIL=admin@soohyung.kr
SEED_ADMIN_PASSWORD=admin123
SEED_DEMO_DATA=true

# 오브젝트 스토리지 (원본 나무 사진 / 시뮬레이션 결과 / 시공 포트폴리오 이미지)
FILE_STORAGE_DRIVER=local
FILE_STORAGE_PATH=./storage
EOF
}

# 3. 모바일 앱 apps/mobile-app/.env 내용 생성
generate_mobile_env() {
  cat << EOF
# ==============================================================================
# [Port ${PORT_MOBILE}] 수형 (SOOHYUNG) 정원주 & 조경사 모바일 웹/앱 (.env)
# 자동 생성 일시: ${GEN_DATE}
# 환경 모드: ${TARGET_NODE_ENV}
# ==============================================================================
PORT=${PORT_MOBILE}
VITE_PORT=${PORT_MOBILE}
VITE_API_BASE_URL=/api
VITE_ADMIN_WEB_URL=http://localhost:${PORT_ADMIN}
VITE_APP_NAME=수형 (SOOHYUNG) - AI 나무 전지 & 조경사 매칭
VITE_DEFAULT_MAP_LAT=37.4912
VITE_DEFAULT_MAP_LNG=127.4875
EOF
}

# 4. 관리자 웹 apps/admin-web/.env 내용 생성
generate_admin_env() {
  cat << EOF
# ==============================================================================
# [Port ${PORT_ADMIN}] 수형 (SOOHYUNG) 통합 관리자 웹 & AI 첨삭 스튜디오 (.env)
# 자동 생성 일시: ${GEN_DATE}
# 환경 모드: ${TARGET_NODE_ENV}
# ==============================================================================
PORT=${PORT_ADMIN}
VITE_PORT=${PORT_ADMIN}
VITE_API_BASE_URL=/api
VITE_MOBILE_APP_URL=http://localhost:${PORT_MOBILE}
VITE_APP_NAME=수형 (SOOHYUNG) 통합 관리자 & AI 첨삭 스튜디오
EOF
}

# 파일 쓰기 또는 미리보기 헬퍼
write_or_preview_file() {
  local target_path="$1"
  local content="$2"
  local description="$3"

  local rel_target="${target_path#$PROJECT_ROOT/}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "\n${BLUE}══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}[DRY-RUN] ${description} (${rel_target})${NC}"
    echo -e "${BLUE}──────────────────────────────────────────────────────────────────────${NC}"
    echo "$content"
    return 0
  fi

  mkdir -p "$(dirname "$target_path")"
  echo "$content" > "$target_path"
  chmod 600 "$target_path" 2>/dev/null || chmod 644 "$target_path"

  echo -e "  ${GREEN}✓${NC} [생성 완료] ${BOLD}${rel_target}${NC} (${description})"
}

  # 실행 단계
  backup_existing_envs

  echo -e "${CYAN}▶ 환경 변수(.env) 파일 생성 진행 중...${NC}"

  write_or_preview_file "${PROJECT_ROOT}/.env" "$(generate_root_env)" "루트 공통 환경 변수"
  write_or_preview_file "${PROJECT_ROOT}/apps/backend/.env" "$(generate_backend_env)" "백엔드 API 및 MongoDB 설정"
  write_or_preview_file "${PROJECT_ROOT}/apps/mobile-app/.env" "$(generate_mobile_env)" "모바일 웹/앱 (정원주·조경사)"
  write_or_preview_file "${PROJECT_ROOT}/apps/admin-web/.env" "$(generate_admin_env)" "통합 관리자 웹 & 첨삭 스튜디오"

  if [ "$DRY_RUN" = false ]; then
    echo "----------------------------------------------------------------------"
    echo -e "${GREEN}${BOLD}✨ 모든 운영 환경 변수(.env) 생성이 성공적으로 완료되었습니다!${NC}"
    echo -e "   • 서비스 재시작 명령: ${CYAN}./run_port.sh restart all${NC}"
    echo -e "   • 상태 확인 명령   : ${CYAN}./run_port.sh status${NC}"
    echo "======================================================================"
  fi
  return 0
}

# source / . 실행 시 서브쉘 위임 및 터미널 닫힘 완벽 방어
if [ -n "${BASH_SOURCE[0]:-}" ] && [ "$0" != "${BASH_SOURCE[0]}" ]; then
  bash "${BASH_SOURCE[0]}" "$@"
  return $? 2>/dev/null || true
else
  _main "$@"
  exit $?
fi
