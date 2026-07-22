#!/bin/bash
### BEGIN INIT INFO
# Provides:          nextjs-dev
# Required-Start:    $network
# Required-Stop:     $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Next.js Dev Server for Eid Ticket Resell
# Description:       Auto-restarting Next.js development server
### END INIT INFO

PROJECT_DIR="/home/z/my-project"
LOG_FILE="$PROJECT_DIR/dev.log"
PID_FILE="$PROJECT_DIR/.next-dev.pid"
PORT=3000
NODE_CMD="node"
NODE_OPTS="--max-old-space-size=1536"
NEXT_BIN="$PROJECT_DIR/node_modules/.bin/next"

start() {
  # Check if already running
  if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      echo "Server already running (PID: $OLD_PID)"
      return 0
    fi
  fi

  echo "Starting Next.js dev server..."
  cd "$PROJECT_DIR"
  
  # Use start-stop-daemon for proper backgrounding
  start-stop-daemon --start --background --make-pidfile --pidfile "$PID_FILE" \
    --chdir "$PROJECT_DIR" \
    --env "NODE_OPTIONS=$NODE_OPTS" \
    --exec /bin/bash -- -c "while true; do node $NEXT_BIN dev -p $PORT >> $LOG_FILE 2>&1; echo \"\$(date): Restarting...\" >> $LOG_FILE; sleep 3; done"
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    sleep 1
    if curl -s -m 5 http://localhost:$PORT > /dev/null 2>&1; then
      echo "Server ready on port $PORT"
      return 0
    fi
  done
  
  echo "Warning: Server may still be starting up"
  return 0
}

stop() {
  echo "Stopping Next.js dev server..."
  start-stop-daemon --stop --pidfile "$PID_FILE" --retry 5 2>/dev/null
  pkill -f "next dev" 2>/dev/null
  rm -f "$PID_FILE"
  echo "Stopped"
}

status() {
  if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      if curl -s -m 5 http://localhost:$PORT > /dev/null 2>&1; then
        echo "Server running (PID: $OLD_PID, Port: $PORT)"
        return 0
      else
        echo "Server process exists but not responding (PID: $OLD_PID)"
        return 1
      fi
    fi
  fi
  echo "Server not running"
  return 1
}

case "$1" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; sleep 2; start ;;
  status)  status ;;
  *)       echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac
