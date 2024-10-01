#!/bin/bash

# Thông tin VPS
VPS_USER="root"
VPS_HOST="14.225.220.10"
VPS_PATH="~/hsnr-ban-vang-backend"

npm run build

# Bước 1: Chạy file predeploy
echo "Running predeploy.sh on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && sh ./pre-deploy.sh"

# Bước 2: Đồng bộ file dist lên VPS
echo "Syncing dist directory to VPS..."
rsync -azP dist/** ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/dist

# Bước 3: Chạy file deploy.sh trên VPS
echo "Running deploy.sh on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && sh ./deploy.sh"

echo "Deployment completed successfully!"
