#!/usr/bin/env bash
set -e

PORT=${PORT:-8080}
SANDBOX_PORT=6865
JSON_API_PORT=7575

echo "=== slinky — starting Canton sandbox ==="
daml sandbox --port $SANDBOX_PORT slinky.dar &
SANDBOX_PID=$!

# Wait for sandbox gRPC to be ready
echo "Waiting for Canton sandbox on port $SANDBOX_PORT..."
for i in $(seq 1 60); do
    if curl -sf http://127.0.0.1:$SANDBOX_PORT/health 2>/dev/null || \
       bash -c "echo > /dev/tcp/127.0.0.1/$SANDBOX_PORT" 2>/dev/null; then
        echo "Canton sandbox is ready."
        break
    fi
    if [ $i -eq 60 ]; then
        echo "ERROR: Canton sandbox did not start within 60s"
        exit 1
    fi
    sleep 1
done

# Give it a couple extra seconds to fully initialize
sleep 3

echo "=== Starting JSON API on port $JSON_API_PORT ==="
daml json-api \
    --ledger-host 127.0.0.1 \
    --ledger-port $SANDBOX_PORT \
    --http-port $JSON_API_PORT \
    --allow-insecure-tokens &
JSON_API_PID=$!

# Wait for JSON API to be ready
echo "Waiting for JSON API on port $JSON_API_PORT..."
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:$JSON_API_PORT/readyz 2>/dev/null || \
       bash -c "echo > /dev/tcp/127.0.0.1/$JSON_API_PORT" 2>/dev/null; then
        echo "JSON API is ready."
        break
    fi
    if [ $i -eq 30 ]; then
        echo "WARNING: JSON API health check timed out, continuing anyway..."
    fi
    sleep 1
done

sleep 2

echo "=== Starting nginx on port $PORT ==="
export PORT
envsubst '$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx &
NGINX_PID=$!

echo ""
echo "================================================"
echo "  slinky is live on port $PORT"
echo "  Canton sandbox  :  $SANDBOX_PORT (gRPC)"
echo "  JSON API        :  $JSON_API_PORT (HTTP)"
echo "  Frontend+Proxy  :  $PORT (nginx)"
echo "================================================"
echo ""

# Keep the container alive — wait for any child to exit
wait -n $SANDBOX_PID $JSON_API_PID $NGINX_PID
