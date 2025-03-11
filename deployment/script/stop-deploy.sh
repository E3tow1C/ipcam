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

echo "🗑️ Removing all deployments and related resources..."
kubectl delete -f scaling.yml || true
kubectl delete -f components.yaml || true
kubectl delete -f ingress.yml || true
kubectl delete -f services.yml || true
kubectl delete -f deployments.yml || true
kubectl delete -f configmaps.yml || true
kubectl delete -f pvc.yml || true

echo "⏳ Waiting for all pods to terminate..."
while [ "$(kubectl get pods --no-headers | wc -l)" -ne 0 ]; do
    echo "Still waiting..."
    sleep 5
done
echo "All pods have terminated."


echo "Deleting the Kind cluster..."
kind delete cluster --name ipcam-cluster || true

echo "All deployments removed."