#!/bin/bash
# Robust server watchdog - restarts Next.js if it dies
LOG="/home/z/my-project/dev.log"
export NODE_OPTIONS="--max-old-space-size=2048"
while true; do
  echo "[$(date)] Starting Next.js dev server..." >> "$LOG"
  cd /home/z/my-project
  node node_modules/.bin/next dev -p 3000 >> "$LOG" 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 5s..." >> "$LOG"
  sleep 5
done
