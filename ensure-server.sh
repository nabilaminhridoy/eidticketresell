#!/bin/bash
# Ensure Next.js dev server is running
# Call this at the start of any operation

PROJECT_DIR="/home/z/my-project"
PID_FILE="$PROJECT_DIR/.next-dev.pid"
LOG_FILE="$PROJECT_DIR/dev.log"
PORT=3000

cd "$PROJECT_DIR"

# Check if server is already running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    # Check if it's actually responding
    if curl -s -m 5 http://localhost:$PORT > /dev/null 2>&1; then
      return 0 2>/dev/null || exit 0
    fi
  fi
fi

# Kill any existing processes on port 3000
pkill -f "next dev" 2>/dev/null
sleep 1

# Start the server
NODE_OPTIONS="--max-old-space-size=1536" node node_modules/.bin/next dev -p $PORT >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# Wait for server to be ready
for i in $(seq 1 30); do
  sleep 1
  if curl -s -m 5 http://localhost:$PORT > /dev/null 2>&1; then
    echo "Server ready (PID: $SERVER_PID)"
    return 0 2>/dev/null || exit 0
  fi
  # Check if process died
  if ! ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo "Server died during startup, retrying..."
    NODE_OPTIONS="--max-old-space-size=1536" node node_modules/.bin/next dev -p $PORT >> "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > "$PID_FILE"
  fi
done

echo "Server failed to start"
return 1 2>/dev/null || exit 1
