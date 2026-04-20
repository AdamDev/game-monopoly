#!/usr/bin/env bash
# Deploy Monopoly app: build Docker image → push → update Terraform SHA → apply
set -euo pipefail

IMAGE="adamva/monopoly:latest"
TF_FILE="$(dirname "$0")/../terraform/cloud_run.tf"

echo "==> Building Docker image (linux/amd64)..."
docker buildx build --platform linux/amd64 -t "$IMAGE" --push .

echo "==> Fetching image digest..."
DIGEST=$(docker buildx imagetools inspect "$IMAGE" --format "{{.Manifest.Digest}}" | grep -o 'sha256:[a-f0-9]*')
echo "    Digest: $DIGEST"

echo "==> Updating SHA in $TF_FILE..."
perl -i -pe "s|(docker\.io/adamva/monopoly)\@sha256:[a-f0-9]+|\1\@$DIGEST|" "$TF_FILE"

echo "==> Applying Terraform..."
cd "$(dirname "$0")/../terraform"
terraform apply -auto-approve

echo ""
echo "Monopoly app deployed successfully."
terraform output cloud_run_url
