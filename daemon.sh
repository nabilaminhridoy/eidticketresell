#!/bin/bash
cd /home/z/my-project
exec >> /home/z/my-project/dev.log 2>&1
echo "[$(date)] Daemon starting..."
npx next dev -p 3000
