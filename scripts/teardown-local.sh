#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PIDS_FILE="$ROOT_DIR/scripts/.deploy_pids"
KIND_CLUSTER_NAME="storepractice-cluster"
K8S_MANIFEST_DIR="$ROOT_DIR/k8s"

# kill port-forward PIDs if present
if [[ -f "$PIDS_FILE" ]]; then
  echo "Killing port-forward PIDs from $PIDS_FILE"
  while IFS= read -r pid; do
    if ps -p "$pid" > /dev/null 2>&1; then
      kill "$pid" || true
    fi
  done < "$PIDS_FILE"
  rm -f "$PIDS_FILE"
fi

# remove k8s resources
if kubectl get namespace storepractice >/dev/null 2>&1; then
  echo "Deleting kubernetes resources in $K8S_MANIFEST_DIR"
  kubectl delete -f "$K8S_MANIFEST_DIR" -R --ignore-not-found
  # delete namespace explicitly (will remove remaining resources)
  kubectl delete namespace storepractice --ignore-not-found
fi

# (optional) delete kind cluster so next deploy starts fresh
if kind get clusters | grep -q "$KIND_CLUSTER_NAME"; then
  echo "Deleting kind cluster $KIND_CLUSTER_NAME"
  kind delete cluster --name "$KIND_CLUSTER_NAME"
fi

echo "Teardown complete."