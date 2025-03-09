#!/bin/zsh

# Exit on error
set -e

echo "🚀 Starting the deployment process..."

# Check if Kind is installed
if ! command -v kind &> /dev/null; then
    echo "❌ Kind is not installed. Please install it first."
    echo "   brew install kind"
    exit 1
fi

# Create Kind cluster if it doesn't exist
if ! kind get clusters | grep -q "ipcam-cluster"; then
    echo "🔧 Creating Kind cluster..."
    kind create cluster --name ipcam-cluster --config config/kind-cluster.yml
else
    echo "✅ Kind cluster already exists."
fi

# Switch kubectl context to the kind cluster
kubectl config use-context kind-ipcam-cluster

# Build and load the FastAPI image
echo "🔨 Building FastAPI image..."
docker build -t ipcam-fastapi:latest ../api

echo "📦 Loading FastAPI image into Kind..."
kind load docker-image ipcam-fastapi:latest --name ipcam-cluster

# # Build and load the Frontend image (optional)
# echo "🔨 Building Frontend image..."
# cd ../frontend
# docker build -t ipcam-frontend:latest .
# cd ../deployment

# echo "📦 Loading Frontend image into Kind..."
# kind load docker-image ipcam-frontend:latest --name ipcam-cluster


# Apply Kubernetes manifests
echo "🚀 Applying Kubernetes manifests..."
kubectl apply -f pvc.yml
kubectl apply -f configmaps.yml
kubectl apply -f deployments.yml
kubectl apply -f services.yml
kubectl apply -f ingress.yml
kubectl apply -f scaling.yml
kubectl apply -f ingress-controller.yml
# kubectl apply -f frontend-deployment.yml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/minio
kubectl wait --for=condition=available --timeout=300s deployment/fastapi
kubectl wait --for=condition=available --timeout=300s deployment/ingress-nginx-controller -n ingress-nginx
# kubectl wait --for=condition=available --timeout=300s deployment/frontend

echo "✅ Deployment completed successfully!"
echo ""
echo "🔍 Access your application:"
echo "   - API: http://localhost:30080"
# echo "   - Frontend: http://localhost:30000"
echo "   - MinIO Console: http://localhost:$(kubectl get -o jsonpath="{.spec.ports[?(@.name=='console')].nodePort}" services minio)"
echo ""
echo "📊 To see running pods:"
echo "   kubectl get pods"
echo ""
echo "🔎 To check deployment status:"
echo "   kubectl get deployments"
echo ""
echo "📜 To see logs from FastAPI container:"
echo "   kubectl logs -f deployment/fastapi"