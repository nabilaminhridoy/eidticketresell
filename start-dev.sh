#!/bin/bash
LOG_FILE="/home/z/my-project/dev.log"
PROJECT_DIR="/home/z/my-project"
cd "$PROJECT_DIR"

while true; do
  echo "$(date): Starting Next.js dev server..." >> "$LOG_FILE"
  NODE_OPTIONS="--max-old-space-size=1536" node node_modules/.bin/next dev -p 3000 >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?
  echo "$(date): Server exited with code $EXIT_CODE. Restarting in 3s..." >> "$LOG_FILE"
  sleep 3
done
