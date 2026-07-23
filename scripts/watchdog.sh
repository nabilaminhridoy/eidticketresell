#!/bin/bash
# Server Watchdog - Auto-restarts Next.js dev server if it crashes
# Runs indefinitely, checking every 10 seconds

LOG_FILE="/home/z/my-project/dev.log"
PID_FILE="/home/z/my-project/scripts/server.pid"
MAX_OLD_SPACE=1024
PORT=3000
MAX_CRASHES=5
crash_count=0

echo "[Watchdog] Starting server monitor..."

# Kill any existing server processes
pkill -f "next dev" 2>/dev/null
pkill -f "bun run dev" 2>/dev/null
sleep 2

# Function to start the server
start_server() {
    echo "[Watchdog] Starting Next.js dev server..."
    # Clear old log
    > "$LOG_FILE"
    
    # Start server in background with memory limit
    cd /home/z/my-project
    (NODE_OPTIONS="--max-old-space-size=$MAX_OLD_SPACE" bun run dev >> "$LOG_FILE" 2>&1 &)
    
    # Wait for server to be ready
    local wait_count=0
    local max_wait=60
    
    while [ $wait_count -lt $max_wait ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null | grep -qE "200|307|301"; then
            echo "[Watchdog] Server is UP and responding! (took ~${wait_count}s)"
            # Record PID
            pgrep -f "next-server" > "$PID_FILE" 2>/dev/null
            return 0
        fi
        sleep 2
        wait_count=$((wait_count + 2))
    done
    
    echo "[Watchdog] Server failed to start within $max_wait seconds"
    return 1
}

# Function to check if server is alive
check_server() {
    # Check if process exists
    if ! pgrep -f "next-server" > /dev/null 2>&1; then
        echo "[Watchdog] Server process not found!"
        return 1
    fi
    
    # Check if server responds (with timeout)
    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$PORT 2>/dev/null)
    
    if [ -z "$response" ] || [ "$response" = "000" ]; then
        echo "[Watchdog] Server not responding (connection failed)"
        return 1
    fi
    
    if [ "$response" != "200" ] && [ "$response" != "307" ] && [ "$response" != "301" ]; then
        echo "[Watchdog] Server responding with unexpected status: $response"
        return 1
    fi
    
    return 0
}

# Function to clean up before restart
cleanup() {
    echo "[Watchdog] Cleaning up..."
    pkill -f "next dev" 2>/dev/null
    pkill -f "bun run dev" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    pkill -f "postcss" 2>/dev/null
    pkill -f "jest-worker" 2>/dev/null
    sleep 3
    echo "[Watchdog] Cleanup done"
}

# Initial start
if ! start_server; then
    echo "[Watchdog] Initial start failed, retrying after cleanup..."
    cleanup
    start_server
fi

# Main monitoring loop
while true; do
    sleep 10
    
    if ! check_server; then
        crash_count=$((crash_count + 1))
        echo "[Watchdog] Server DOWN! (crash #$crash_count)"
        
        if [ $crash_count -gt $MAX_CRASHES ]; then
            echo "[Watchdog] Too many crashes ($crash_count). Waiting 60s before retry..."
            sleep 60
            crash_count=0
        fi
        
        cleanup
        
        if start_server; then
            echo "[Watchdog] Server restarted successfully!"
            crash_count=0
        else
            echo "[Watchdog] Restart failed. Will retry in next cycle..."
        fi
    else
        # Reset crash count on successful check
        if [ $crash_count -gt 0 ]; then
            crash_count=0
        fi
        
        # Check memory usage and warn if high
        local mem_used
        mem_used=$(free -m | awk '/Mem:/ {print $3}')
        if [ "$mem_used" -gt 3200 ]; then
            echo "[Watchdog] WARNING: Memory usage high (${mem_used}MB). Consider restarting."
        fi
    fi
done
