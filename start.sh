#!/usr/bin/env bash
set -e

PORT=${PORT:-8080}
SANDBOX_PORT=6865
JSON_API_PORT=7575

# JAVA_TOOL_OPTIONS is set in Dockerfile and respected by all JVM processes

# Package ID is baked into the JS bundle by Vite from .env at build time
echo "=== slinky starting ==="

# Start nginx FIRST so Railway healthcheck passes immediately
echo "=== Starting nginx on port $PORT ==="
export PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;' &
NGINX_PID=$!
echo "nginx started on port $PORT (PID $NGINX_PID)"

# Now start Canton sandbox (this takes a while)
echo "=== Starting Canton sandbox ==="
daml sandbox --port $SANDBOX_PORT --dar slinky.dar &
SANDBOX_PID=$!

echo "Waiting for Canton sandbox on port $SANDBOX_PORT..."
for i in $(seq 1 120); do
    if bash -c "echo > /dev/tcp/127.0.0.1/$SANDBOX_PORT" 2>/dev/null; then
        echo "Canton sandbox is ready (took ${i}s)."
        break
    fi
    if [ $i -eq 120 ]; then
        echo "ERROR: Canton sandbox did not start within 120s"
        kill -0 $SANDBOX_PID 2>/dev/null && echo "Process still running" || echo "Process died"
        exit 1
    fi
    sleep 1
done

sleep 5

echo "=== Starting JSON API on port $JSON_API_PORT ==="
daml json-api \
    --ledger-host 127.0.0.1 \
    --ledger-port $SANDBOX_PORT \
    --http-port $JSON_API_PORT \
    --allow-insecure-tokens &
JSON_API_PID=$!

echo "Waiting for JSON API on port $JSON_API_PORT..."
for i in $(seq 1 60); do
    if bash -c "echo > /dev/tcp/127.0.0.1/$JSON_API_PORT" 2>/dev/null; then
        echo "JSON API is ready (took ${i}s)."
        break
    fi
    if [ $i -eq 60 ]; then
        echo "WARNING: JSON API health check timed out, continuing..."
    fi
    sleep 1
done

echo ""
echo "================================================"
echo "  slinky is live on port $PORT"
echo "  Canton sandbox  :  $SANDBOX_PORT (gRPC)"
echo "  JSON API        :  $JSON_API_PORT (HTTP)"
echo "  Frontend+Proxy  :  $PORT (nginx)"
echo "================================================"
echo ""

# Keep the container alive
wait -n $SANDBOX_PID $JSON_API_PID $NGINX_PID
