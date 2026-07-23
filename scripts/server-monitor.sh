#!/bin/bash
# Background server monitor - restarts server if it crashes
# Runs indefinitely in background, checking every 30 seconds

LOG="/home/z/my-project/scripts/health.log"
HEALTH_SCRIPT="/home/z/my-project/scripts/health-check.sh"

echo "[Monitor] Starting background server monitor at $(date)" >> "$LOG"

while true; do
    bash "$HEALTH_SCRIPT" >/dev/null 2>&1
    sleep 30
done
