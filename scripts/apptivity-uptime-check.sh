#!/usr/bin/env bash
# Local replacement for sites GitHub Actions uptime cron (no Actions minutes).
set -euo pipefail

BASE="${APPTIVITY_UPTIME_BASE:-https://www.apptivity.online}"
FAIL=0

for route in / /privacy /terms /sms-opt-in; do
  if ! curl --fail --silent --show-error \
    --max-time 20 --retry 2 --retry-delay 2 \
    "${BASE}${route}" >/dev/null; then
    echo "FAIL ${BASE}${route}" >&2
    FAIL=1
  else
    echo "OK   ${BASE}${route}"
  fi
done

redirect_headers="$(curl --silent --show-error --head --max-time 20 https://apptivity.online/ || true)"
if ! grep -qE '^HTTP/[^ ]+ 308' <<<"$redirect_headers"; then
  echo "FAIL apex redirect status (expected 308)" >&2
  FAIL=1
fi
if ! grep -qiE '^location: https://www\.apptivity\.online/' <<<"$redirect_headers"; then
  echo "FAIL apex Location header" >&2
  FAIL=1
fi

if [[ "$FAIL" -ne 0 ]]; then
  echo "apptivity uptime check failed at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >&2
  exit 1
fi

echo "apptivity uptime OK at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
