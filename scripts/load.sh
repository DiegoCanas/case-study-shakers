#!/usr/bin/env bash
# Simple load generator for projects-api. Helps populate your dashboards
# with real data. Adjust TARGET to wherever your service is reachable.
#
# Usage:
#   TARGET=http://localhost:3000 DURATION=120 ./scripts/load.sh
#
# Requires: curl. (Feel free to replace this with k6/ab if you prefer.)

set -euo pipefail

TARGET="${TARGET:-http://localhost:3000}"
DURATION="${DURATION:-60}"   # seconds
CONCURRENCY="${CONCURRENCY:-5}"

echo "Sending load to ${TARGET} for ${DURATION}s with concurrency ${CONCURRENCY}"

end=$(( $(date +%s) + DURATION ))

worker() {
  while [ "$(date +%s)" -lt "$end" ]; do
    # Mix of reads and writes.
    curl -s -o /dev/null "${TARGET}/projects" || true
    curl -s -o /dev/null -X POST "${TARGET}/projects" \
      -H 'Content-Type: application/json' \
      -d "{\"name\":\"project-$RANDOM\"}" || true
    curl -s -o /dev/null "${TARGET}/healthz" || true
    sleep 0.$(( RANDOM % 5 ))
  done
}

pids=()
for _ in $(seq 1 "$CONCURRENCY"); do
  worker &
  pids+=($!)
done

wait "${pids[@]}"
echo "Load test finished."
