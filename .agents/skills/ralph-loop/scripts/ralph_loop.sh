#!/usr/bin/env bash
# ==============================================================================
# Ralph Loop Runner — Bash Loop Engine (Fresh Context Architecture)
# Inspired by Geoffrey Huntley's Ralph Wiggum technique.
# Usage: ./scripts/ralph_loop.sh "Task Description" [MAX_ITERATIONS] [PROMISE]
# ==============================================================================

# source 또는 . 으로 실행 시 터미널 세션 닫힘(exit) 방지 -> 서브쉘 위임
if [ -n "${BASH_SOURCE[0]:-}" ] && [ "$0" != "${BASH_SOURCE[0]}" ]; then
  bash "${BASH_SOURCE[0]}" "$@"
  return $? 2>/dev/null || true
fi

set -euo pipefail

TASK="${1:-"수형(SOOHYUNG) 조경·수목 전지 AI 시뮬레이션 및 정원주-조경사 매칭 플랫폼(30018/30019/30020) 구현 및 검증"}"
MAX_ITERATIONS="${2:-10}"
PROMISE="${3:-"PROMISE_MET: COMPLETED"}"

LOOP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/../../loop"
mkdir -p "$LOOP_DIR"
STATE_FILE="$LOOP_DIR/state.json"
TASK_FILE="$LOOP_DIR/task.md"

echo "=========================================================="
echo " Starting Ralph Loop (Bash Engine) — SOOHYUNG / GajiTalk"
echo " Task: $TASK"
echo " Max Iterations: $MAX_ITERATIONS"
echo " Completion Promise: $PROMISE"
echo " State Directory: $LOOP_DIR"
echo "=========================================================="

# Initialize state.json
cat <<EOF > "$STATE_FILE"
{
  "enabled": true,
  "status": "running",
  "task_description": "$TASK",
  "current_iteration": 0,
  "max_iterations": $MAX_ITERATIONS,
  "completion_promise": "$PROMISE",
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

# Initialize task.md if not exists
if [ ! -f "$TASK_FILE" ]; then
  cat <<EOF > "$TASK_FILE"
# Ralph Loop Task Checklist (SOOHYUNG / GajiTalk)
- [ ] $TASK
EOF
fi

ITERATION=1
while [ "$ITERATION" -le "$MAX_ITERATIONS" ]; do
  echo ""
  echo ">>> [Ralph Loop Turn $ITERATION / $MAX_ITERATIONS] Executing..."
  
  # Update state
  python3 -c "
import json
with open('$STATE_FILE', 'r') as f: s = json.load(f)
s['current_iteration'] = $ITERATION
with open('$STATE_FILE', 'w') as f: json.dump(s, f, indent=2)
"

  # Check if task file has pending tasks
  REMAINING_TASKS=$(grep -c '^- \[ \]' "$TASK_FILE" || true)
  if [ "$REMAINING_TASKS" -eq 0 ]; then
    echo ">>> All tasks marked complete in $TASK_FILE!"
    echo ">>> Completion Promise Satisfied: $PROMISE"
    python3 -c "
import json
with open('$STATE_FILE', 'r') as f: s = json.load(f)
s['enabled'] = False
s['status'] = 'success'
with open('$STATE_FILE', 'w') as f: json.dump(s, f, indent=2)
"
    echo "=========================================================="
    echo " Ralph Loop Successfully Terminated."
    echo "=========================================================="
    exit 0
  fi

  echo ">>> Remaining tasks: $REMAINING_TASKS. Next step in progress..."
  sleep 1
  
  ITERATION=$((ITERATION + 1))
done

echo ">>> [Warning] Max iterations ($MAX_ITERATIONS) reached without meeting completion promise."
python3 -c "
import json
with open('$STATE_FILE', 'r') as f: s = json.load(f)
s['enabled'] = False
s['status'] = 'max_iterations_reached'
with open('$STATE_FILE', 'w') as f: json.dump(s, f, indent=2)
"
exit 1
