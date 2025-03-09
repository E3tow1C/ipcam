#!/bin/zsh

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

# Wait for pods to be ready
echo "⏳ Waiting for pods to be ready..."
kubectl get pods -w