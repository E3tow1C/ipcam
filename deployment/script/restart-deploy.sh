#!/usr/bin/env sh

# Detect OS and set appropriate shell
if [ "$(uname)" = "Darwin" ]; then
  # macOS detected
  SHELL_TO_USE="zsh"
elif [ -f "/etc/os-release" ] && grep -q "Ubuntu" /etc/os-release; then
  # Ubuntu detected
  SHELL_TO_USE="sh"
else
  # Default to bash for other systems
  SHELL_TO_USE="bash"
fi

echo "📌 Detected OS: $(uname), using $SHELL_TO_USE..."

# Re-execute the script with the appropriate shell if needed
if [ "$(basename "$SHELL")" != "$SHELL_TO_USE" ]; then
  exec "$SHELL_TO_USE" "$0" "$@"
fi

# Exit on error
set -e

echo "🔄 Restarting deployments..."

# Delete existing deployments
kubectl delete deployment mongodb minio fastapi --ignore-not-found=true

# Wait for pods to terminate
echo "⏳ Waiting for pods to terminate..."
sleep 5


# Apply the updated manifests
kubectl apply -f pvc.yml
kubectl apply -f configmaps.yml
kubectl apply -f deployments.yml
kubectl apply -f services.yml
kubectl apply -f ingress.yml
kubectl apply -f scaling.yml
kubectl apply -f ingress-controller.yml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/minio
kubectl wait --for=condition=available --timeout=300s deployment/fastapi
kubectl wait --for=condition=available --timeout=300s deployment/ingress-nginx-controller -n ingress-nginx
# kubectl wait --for=condition=available --timeout=300s deployment/frontend