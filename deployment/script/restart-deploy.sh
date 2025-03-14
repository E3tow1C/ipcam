# Detect OS and set appropriate shell
if [ "$(uname)" = "Darwin" ]; then
  SHELL_TO_USE="zsh"
elif [ -f "/etc/os-release" ] && grep -q "Ubuntu" /etc/os-release; then
  SHELL_TO_USE="bash"
else
  SHELL_TO_USE="bash"
fi

echo "📌 Detected OS: $(uname), using $SHELL_TO_USE..."

# Re-execute the script with the appropriate shell if needed
if [ "$(basename "$SHELL")" != "$SHELL_TO_USE" ]; then
  exec "$SHELL_TO_USE" "$0" "$@"
  echo "using $SHELL_TO_USE"
fi

# Exit on error
set -e

echo "🔄 Restarting deployments..."

# Delete existing deployments
kubectl delete deployment mongodb minio fastapi --ignore-not-found=true

# Wait for pods to terminate
echo "⏳ Waiting for pods to terminate..."

# Function to check if any pods for a deployment still exist
check_pods_terminated() {
  local deployment=$1
  local pods=$(kubectl get pods -l app=$deployment --no-headers 2>/dev/null | wc -l | xargs)
  return $pods  # Return 0 when no pods exist (success)
}

# Wait for each deployment's pods to terminate
for deployment in mongodb minio fastapi; do
  echo "  Waiting for $deployment pods to terminate..."
  
  # Timeout after 60 seconds
  timeout=60
  elapsed=0
  
  while ! check_pods_terminated $deployment && [ $elapsed -lt $timeout ]; do
    sleep 2
    elapsed=$((elapsed+2))
    echo "    Still waiting for $deployment pods to terminate... (${elapsed}s/${timeout}s)"
  done
  
  if [ $elapsed -ge $timeout ]; then
    echo "⚠️  Warning: Timed out waiting for $deployment pods to terminate"
  else
    echo "  ✅ $deployment pods terminated"
  fi
done

echo "✅ All deployment pods terminated"

# Apply the updated manifests
kubectl apply -f pvc.yml
kubectl apply -f configmaps.yml
kubectl apply -f deployments.yml
kubectl apply -f services.yml
kubectl apply -f ingress.yml
kubectl apply -f components.yaml
kubectl apply -f scaling.yml
kubectl apply -f ingress-controller.yml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/metrics-server -n kube-system
kubectl wait --for=condition=available --timeout=300s deployment/ingress-nginx-controller -n ingress-nginx
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/minio
kubectl wait --for=condition=available --timeout=300s deployment/frontend
kubectl wait --for=condition=available --timeout=300s deployment/fastapi