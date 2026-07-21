#!/bin/bash
# Robust server watchdog - restarts Next.js if it dies
LOG="/home/z/my-project/dev.log"
while true; do
  echo "[$(date)] Starting Next.js dev server..." >> "$LOG"
  cd /home/z/my-project
  npx next dev -p 3000 >> "$LOG" 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..." >> "$LOG"
  sleep 3
done
