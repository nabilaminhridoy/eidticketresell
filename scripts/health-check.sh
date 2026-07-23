#!/bin/bash
# Server Health Check & Auto-Recovery Script
# Only restarts if server is actually DOWN. Won't create duplicate processes.

LOG="/home/z/my-project/scripts/health.log"
SERVER_LOG="/home/z/my-project/dev.log"
MAX_OLD_SPACE=1024
PORT=3000

# Check if server is responding
response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT 2>/dev/null)

if [ -z "$response" ] || [ "$response" = "000" ]; then
    echo "[HealthCheck] Server DOWN at $(date). Restarting..." >> "$LOG"
    
    # Kill any existing processes cleanly
    pkill -f "next dev" 2>/dev/null
    pkill -f "bun run dev" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    pkill -f "postcss" 2>/dev/null
    pkill -f "jest-worker" 2>/dev/null
    
    # Wait for processes to fully die
    sleep 5
    
    # Check memory is available
    mem_avail=$(free -m | awk '/Mem:/ {print $7}')
    if [ "$mem_avail" -lt 500 ]; then
        echo "[HealthCheck] Low memory (${mem_avail}MB). Waiting 30s..." >> "$LOG"
        sleep 30
    fi
    
    # Start server fresh
    cd /home/z/my-project
    > "$SERVER_LOG"
    NODE_OPTIONS="--max-old-space-size=$MAX_OLD_SPACE" nohup bun run dev >> "$SERVER_LOG" 2>&1 &
    
    # Wait for server to respond (up to 60s)
    wait=0
    while [ $wait -lt 60 ]; do
        check=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:$PORT 2>/dev/null)
        if [ "$check" = "200" ] || [ "$check" = "307" ] || [ "$check" = "301" ]; then
            echo "[HealthCheck] Server UP after ${wait}s at $(date)" >> "$LOG"
            exit 0
        fi
        sleep 3
        wait=$((wait + 3))
    done
    
    echo "[HealthCheck] Server FAILED to start at $(date)" >> "$LOG"
    exit 1
else
    # Server is healthy - just log it quietly
    echo "[HealthCheck] Server OK (HTTP $response) at $(date)" >> "$LOG"
    exit 0
fi
