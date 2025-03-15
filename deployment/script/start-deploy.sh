# Detect OS and set appropriate shell
if [ "$(uname)" = "Darwin" ]; then
  # macOS detected
  SHELL_TO_USE="zsh"
elif [ -f "/etc/os-release" ] && grep -q "Ubuntu" /etc/os-release; then
  # Ubuntu detected
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

# Add this section right after the OS detection
# if [ "$SHELL_TO_USE" = "bash" ]; then
#   # Ubuntu setup
#   if ! command -v mkcert &> /dev/null; then
#     echo "📦 Installing mkcert..."
#     sudo apt update
#     sudo apt install -y libnss3-tools wget
#     wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
#     chmod +x mkcert
#     sudo mv mkcert /usr/local/bin/
#   fi
  
#   # Create certificates directory
#   mkdir -p ~/cloudapp/ipcam/certs
#   cd ~/cloudapp/ipcam/certs
  
#   # Install local CA if not already installed
#   if [ ! -f "$(mkcert -CAROOT)/rootCA.pem" ]; then
#     echo "🔒 Installing local CA..."
#     mkcert -install
#   fi
  
#   # Generate certificates if they don't exist
#   if [ ! -f "_wildcard.localhost+3.pem" ]; then
#     echo "🔑 Generating certificates..."
#     mkcert "*.localhost" localhost 127.0.0.1 ::1
#   fi
  
#   # Return to the deployment directory
#   cd ~/cloudapp/ipcam/deployment
# fi

# Exit on error
set -e

# Check if current directory is deployment
if [ ! -f "config/kind-cluster.yml" ]; then
    echo "❌ Please run this script from the deployment directory."
    echo "   make sure your're at 'deployment' directory"
    exit 1
fi

echo "🚀 Starting the deployment process..."

# Check if Kind is installed
if ! command -v kind &> /dev/null; then
    echo "❌ Kind is not installed. Please install it first."
    echo "   brew install kind"
    exit 1
fi

# Use envsubst to replace variables in the Kubernetes manifests
echo "🔧 Updating Kubernetes manifests..."
envsubst < config/kind-cluster.yml > config/kind-cluster-generated.yml

# Create Kind cluster if it doesn't exist
if ! kind get clusters | grep -q "ipcam-cluster"; then
    echo "🔧 Creating Kind cluster..."
    kind create cluster --name ipcam-cluster --config config/kind-cluster-generated.yml
else
    echo "✅ Kind cluster already exists."
fi

# Switch kubectl context to the kind cluster
kubectl config use-context kind-ipcam-cluster

# Clean up the generated Kubernetes manifest
echo "🧹 Cleaning up generated manifests files..."
git clean -f config/kind-cluster-generated.yml || { echo "❌ Failed to clean up generated files"; exit 1; }
echo "✅ Clean up completed successfully"

# Build and load the FastAPI image
# echo "🔨 Building FastAPI image..."
# docker build -t ipcam-fastapi:latest ../api

# echo "📦 Loading FastAPI image into Kind..."
# kind load docker-image e3tow1c/ipcam-fastapi:latest --name ipcam-cluster

# # Build and load the Frontend image (optional)
# echo "🔨 Building Frontend image..."
# cd ../frontend
# docker build -t ipcam-frontend:latest .
# cd ../deployment

# echo "📦 Loading Frontend image into Kind..."
# kind load docker-image ipcam-frontend:latest --name ipcam-cluster

DATA_DIR="${HOME}/kubes-data"
echo "📁 Using data directory: ${DATA_DIR}"
echo

# Check if the kubes-data directory exists
if [ -d "$DATA_DIR" ]; then
    echo "=========================================="
    echo "✅ Data directories already exist. Skipping directory creation and permission setting."
    echo
else
    # Create directories for persistent storage
    echo "=========================================="
    echo "📁 Creating data directories..."
    mkdir -p "${DATA_DIR}/mongodb/db" || { echo "❌ Failed to create MongoDB data directory"; exit 1; }
    mkdir -p "${DATA_DIR}/mongodb/configdb" || { echo "❌ Failed to create MongoDB config directory"; exit 1; }
    mkdir -p "${DATA_DIR}/minio" || { echo "❌ Failed to create MinIO directory"; exit 1; }
    echo "✅ Data directories created successfully"
    echo

    # Set ownership to match the user ID of the container process
    echo "=========================================="
    echo "🔑 Setting ownership to match mongodb UID and GID"
    sudo chown -R 999:999 ${DATA_DIR}/mongodb || { echo "❌ Failed to set ownership for MongoDB"; exit 1; }
    echo "✅ mongodb Ownership set successfully"
    echo
    echo "=========================================="
    echo "🔑 Setting ownership to match minio UID and GID"
    sudo chown -R 1000:1000 ${DATA_DIR}/minio || { echo "❌ Failed to set ownership for MinIO"; exit 1; }
    echo "✅ minio Ownership set successfully"
    echo

    # Set more restrictive permissions for kubs-data directory
    echo "=========================================="
    echo "🔒 Setting permissions for kubes-data directory"
    sudo chmod -R 777 "${DATA_DIR}" || { echo "❌ Failed to set permissions for kubes-data"; exit 1; }
    echo "✅ Permissions set success: kubes-data directory"
    echo
fi

# Apply Kubernetes manifests
echo "=========================================="
echo "🚀 Applying Kubernetes manifests..."
kubectl apply -f pvc.yml
kubectl apply -f configmaps.yml
kubectl apply -f deployments.yml
kubectl apply -f services.yml
# kubectl apply -f ingress.yml
kubectl apply -f components.yaml
kubectl apply -f scaling.yml
# kubectl apply -f ingress-controller.yml
echo "✅ Kubernetes manifests applied successfully"
echo

# Create a certificate secret for localhost
# echo "creating certificate secret for localhost"
# cd ~/cloudapp/ipcam/certs
# kubectl create secret tls localhost-tls --cert=_wildcard.localhost+3.pem --key=_wildcard.localhost+3-key.pem
# echo "✅ Certificate secret created successfully"
# echo
# Wait for deployments to be ready
echo "=========================================="
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/metrics-server -n kube-system
# kubectl wait --for=condition=available --timeout=300s deployment/ingress-nginx-controller -n ingress-nginx
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/minio
kubectl wait --for=condition=available --timeout=300s deployment/frontend
kubectl wait --for=condition=available --timeout=300s deployment/fastapi

# Forward ports to access the services
# echo "=========================================="
# echo "🔗 Forwarding ports to access the services..."
# kubectl port-forward service/minio 9001:9001 
# kubectl port-forward service/frontend 3000:3000 
# kubectl port-forward service/fastapi 8080:8000 
# echo "✅ Ports forwarded successfully"

echo
echo "✅ Deployment completed successfully!"
echo ""
echo "🔍 Access your application:"
echo "   - API: https://api.localhost"
echo "   - Frontend: https://frontend.localhost" 
echo "   - MinIO Console: https://minio.localhost"
echo ""
echo "📊 To see running pods:"
echo "   kubectl get pods"
echo ""
echo "🔎 To check deployment status:"
echo "   kubectl get deployments"
echo ""
echo "📜 To see logs from FastAPI deployment:"
echo "   kubectl logs -f deployment/fastapi"
echo ""
echo "🛑 To stop the deployment run stop-deploy.sh in ./script directory:"
echo "   ./stop-deploy.sh"
echo ""
echo "🎉 Happy coding!"