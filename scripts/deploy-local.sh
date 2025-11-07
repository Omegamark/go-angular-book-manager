#!/usr/bin/env bash
# TODO: This script is causing a race where pods are trying to be set
# before the namespace has been created. Make adjustments, possibly try
# to remove "kind". Maybe it's OK, but there must be an easier way.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

# image names
BACKEND_IMAGE="storepractice-backend:latest"
FRONTEND_IMAGE="storepractice-frontend:latest"
KIND_CLUSTER_NAME="storepractice-cluster"
K8S_MANIFEST_DIR="$ROOT_DIR/k8s"

# build contexts (adjust if your Angular app is in a different folder)
BACKEND_BUILD_CONTEXT="$ROOT_DIR/backend"
FRONTEND_BUILD_CONTEXT="$ROOT_DIR/frontend/book-management"

echo "Building backend image..."
docker build -t "$BACKEND_IMAGE" -f "$BACKEND_BUILD_CONTEXT/Dockerfile" "$BACKEND_BUILD_CONTEXT"

echo "Building frontend image..."
docker build -t "$FRONTEND_IMAGE" -f "$FRONTEND_BUILD_CONTEXT/Dockerfile" "$FRONTEND_BUILD_CONTEXT"

# create kind cluster if not present
if ! kind get clusters | grep -q "$KIND_CLUSTER_NAME"; then
  echo "Creating kind cluster $KIND_CLUSTER_NAME..."
  kind create cluster --name "$KIND_CLUSTER_NAME"
else
  echo "Kind cluster $KIND_CLUSTER_NAME already exists."
fi

echo "Loading images into kind..."
kind load docker-image "$BACKEND_IMAGE" --name "$KIND_CLUSTER_NAME"
kind load docker-image "$FRONTEND_IMAGE" --name "$KIND_CLUSTER_NAME"

echo "Applying kubernetes manifests..."
kubectl apply -f "$K8S_MANIFEST_DIR" -R

echo "Waiting for deployments to become available..."
kubectl -n storepractice wait --for=condition=available --timeout=120s deployment/backend || true
kubectl -n storepractice wait --for=condition=available --timeout=120s deployment/frontend || true
kubectl -n storepractice wait --for=condition=available --timeout=120s deployment/postgres || true

# TODO: I hate this migration, figure out a simpler way.
# --- NEW: run DB migration using psql inside the postgres pod ---
echo "Running DB migration..."

# find the postgres pod name
POSTGRES_POD=""
for i in {1..30}; do
  POSTGRES_POD=$(kubectl -n storepractice get pods -l app=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)
  if [[ -n "$POSTGRES_POD" ]]; then
    echo "Found postgres pod: $POSTGRES_POD"
    break
  fi
  echo "Waiting for postgres pod..."
  sleep 1
done

if [[ -z "$POSTGRES_POD" ]]; then
  echo "ERROR: postgres pod not found in namespace storepractice"
  exit 1
fi

# wait until psql responds
for i in {1..60}; do
  if kubectl -n storepractice exec "$POSTGRES_POD" -- pg_isready -U postgres -d storepractice >/dev/null 2>&1; then
    echo "Postgres is ready"
    break
  fi
  echo "Waiting for postgres to accept connections..."
  sleep 1
done

# run migration SQL (replace with your full migration if needed)
MIGRATION_SQL=$(
cat <<'SQL'
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL
);
SQL
)

# execute migration
kubectl -n storepractice exec -i "$POSTGRES_POD" -- psql -U postgres -d storepractice -v ON_ERROR_STOP=1 -c "$MIGRATION_SQL"

echo "DB migration complete."

# port-forward frontend and backend and save PIDs for teardown
PIDS_FILE="$ROOT_DIR/scripts/.deploy_pids"
: > "$PIDS_FILE"

kubectl -n storepractice port-forward svc/frontend 4200:4200 > /dev/null 2>&1 &
echo $! >> "$PIDS_FILE"

kubectl -n storepractice port-forward svc/backend 8080:8080 > /dev/null 2>&1 &
echo $! >> "$PIDS_FILE"

echo "Deployment complete."
echo "Frontend: http://localhost:4200"
echo "Backend:  http://localhost:8080"
echo "Port-forward PIDs saved to $PIDS_FILE"