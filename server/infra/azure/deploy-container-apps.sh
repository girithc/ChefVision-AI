#!/usr/bin/env bash

set -euo pipefail

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require az
require openssl

: "${AZURE_LOCATION:=eastus}"
: "${AZURE_RESOURCE_GROUP:=chefvision-rg}"
: "${AZURE_ENV_NAME:=chefvision-env}"
: "${AZURE_ACR_NAME:=chefvisionacr$RANDOM}"
: "${AZURE_POSTGRES_SERVER:=chefvisionpg$RANDOM}"
: "${AZURE_POSTGRES_DB:=chefvision}"
: "${AZURE_POSTGRES_ADMIN:=chefvisionadmin}"
: "${AZURE_POSTGRES_PASSWORD:=}"
: "${AZURE_REDIS_NAME:=chefvisionredis$RANDOM}"
: "${AZURE_API_APP:=chefvision-api}"
: "${AZURE_NORMALIZER_APP:=chefvision-normalizer}"
: "${IMAGE_TAG:=$(date +%Y%m%d%H%M%S)}"
: "${JWT_SECRET:=$(openssl rand -hex 24)}"
: "${MIN_REPLICAS:=1}"
: "${MAX_REPLICAS:=1}"
: "${NORMALIZER_EMBEDDING_PROVIDER:=minilm}"
: "${NORMALIZER_EMBEDDING_MODEL_ID:=onnx-community/all-MiniLM-L6-v2-ONNX}"
: "${NORMALIZER_EMBEDDING_DTYPE:=fp32}"
: "${NORMALIZER_EMBEDDING_DIMENSIONS:=384}"
: "${NORMALIZER_EMBEDDING_CACHE_DIR:=/tmp/chefvision-model-cache}"
: "${NORMALIZER_AUTO_BACKFILL_EMBEDDINGS:=true}"
: "${NORMALIZER_ALLOW_REMOTE_MODELS:=true}"
: "${NORMALIZER_MODEL_VERSION:=azure-normalizer-v2-minilm}"

if [[ -z "${AZURE_POSTGRES_PASSWORD}" ]]; then
  AZURE_POSTGRES_PASSWORD="$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-24)Aa1!"
fi

echo "Using resource group: ${AZURE_RESOURCE_GROUP}"
echo "Using location: ${AZURE_LOCATION}"
echo "Using image tag: ${IMAGE_TAG}"

az extension add --name containerapp --upgrade --only-show-errors >/dev/null
az provider register --namespace Microsoft.App --wait --only-show-errors >/dev/null
az provider register --namespace Microsoft.OperationalInsights --wait --only-show-errors >/dev/null
az provider register --namespace Microsoft.ContainerRegistry --wait --only-show-errors >/dev/null
az provider register --namespace Microsoft.DBforPostgreSQL --wait --only-show-errors >/dev/null
az provider register --namespace Microsoft.Cache --wait --only-show-errors >/dev/null

az group create \
  --name "${AZURE_RESOURCE_GROUP}" \
  --location "${AZURE_LOCATION}" \
  --output none

az acr create \
  --name "${AZURE_ACR_NAME}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --location "${AZURE_LOCATION}" \
  --sku Basic \
  --admin-enabled true \
  --output none

ACR_LOGIN_SERVER="$(
  az acr show \
    --name "${AZURE_ACR_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query loginServer \
    --output tsv
)"

ACR_USERNAME="$(
  az acr credential show \
    --name "${AZURE_ACR_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query username \
    --output tsv
)"

ACR_PASSWORD="$(
  az acr credential show \
    --name "${AZURE_ACR_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query passwords[0].value \
    --output tsv
)"

az acr build \
  --registry "${AZURE_ACR_NAME}" \
  --image "chefvision/api:${IMAGE_TAG}" \
  --file apps/api/Dockerfile \
  . \
  --output none

az acr build \
  --registry "${AZURE_ACR_NAME}" \
  --image "chefvision/normalizer:${IMAGE_TAG}" \
  --file apps/normalizer/Dockerfile \
  . \
  --output none

az containerapp env create \
  --name "${AZURE_ENV_NAME}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --location "${AZURE_LOCATION}" \
  --output none

az postgres flexible-server create \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --name "${AZURE_POSTGRES_SERVER}" \
  --location "${AZURE_LOCATION}" \
  --admin-user "${AZURE_POSTGRES_ADMIN}" \
  --admin-password "${AZURE_POSTGRES_PASSWORD}" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --output none

az postgres flexible-server db create \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --server-name "${AZURE_POSTGRES_SERVER}" \
  --database-name "${AZURE_POSTGRES_DB}" \
  --output none

az postgres flexible-server parameter set \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --server-name "${AZURE_POSTGRES_SERVER}" \
  --name azure.extensions \
  --value vector,pgcrypto \
  --output none

POSTGRES_HOST="$(
  az postgres flexible-server show \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --name "${AZURE_POSTGRES_SERVER}" \
    --query fullyQualifiedDomainName \
    --output tsv
)"

DATABASE_URL="postgres://${AZURE_POSTGRES_ADMIN}:${AZURE_POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${AZURE_POSTGRES_DB}"

az postgres flexible-server execute \
  --name "${AZURE_POSTGRES_SERVER}" \
  --admin-user "${AZURE_POSTGRES_ADMIN}" \
  --admin-password "${AZURE_POSTGRES_PASSWORD}" \
  --database-name "${AZURE_POSTGRES_DB}" \
  --file-path sql/001_init.sql \
  --output none

az postgres flexible-server execute \
  --name "${AZURE_POSTGRES_SERVER}" \
  --admin-user "${AZURE_POSTGRES_ADMIN}" \
  --admin-password "${AZURE_POSTGRES_PASSWORD}" \
  --database-name "${AZURE_POSTGRES_DB}" \
  --file-path sql/003_invoice_file_storage.sql \
  --output none

az postgres flexible-server execute \
  --name "${AZURE_POSTGRES_SERVER}" \
  --admin-user "${AZURE_POSTGRES_ADMIN}" \
  --admin-password "${AZURE_POSTGRES_PASSWORD}" \
  --database-name "${AZURE_POSTGRES_DB}" \
  --querytext "select count(*) as canonical_count from ingredient_canonical;" \
  --output table

az redis create \
  --name "${AZURE_REDIS_NAME}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --location "${AZURE_LOCATION}" \
  --sku Basic \
  --vm-size c0 \
  --minimum-tls-version 1.2 \
  --output none

REDIS_HOST="$(
  az redis show \
    --name "${AZURE_REDIS_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query hostName \
    --output tsv
)"

REDIS_KEY="$(
  az redis list-keys \
    --name "${AZURE_REDIS_NAME}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query primaryKey \
    --output tsv
)"

REDIS_URL="rediss://:${REDIS_KEY}@${REDIS_HOST}:6380"

az containerapp create \
  --name "${AZURE_NORMALIZER_APP}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --environment "${AZURE_ENV_NAME}" \
  --image "${ACR_LOGIN_SERVER}/chefvision/normalizer:${IMAGE_TAG}" \
  --registry-server "${ACR_LOGIN_SERVER}" \
  --registry-username "${ACR_USERNAME}" \
  --registry-password "${ACR_PASSWORD}" \
  --ingress internal \
  --target-port 4001 \
  --min-replicas "${MIN_REPLICAS}" \
  --max-replicas "${MAX_REPLICAS}" \
  --cpu 1.0 \
  --memory 2.0Gi \
  --secrets normalizer-db-url="${DATABASE_URL}" \
  --env-vars \
    PORT=4001 \
    DATABASE_URL=secretref:normalizer-db-url \
    DATABASE_SSL=require \
    HIGH_CONF_THRESHOLD=0.88 \
    LOW_CONF_THRESHOLD=0.55 \
    EMBEDDING_PROVIDER="${NORMALIZER_EMBEDDING_PROVIDER}" \
    EMBEDDING_MODEL_ID="${NORMALIZER_EMBEDDING_MODEL_ID}" \
    EMBEDDING_DTYPE="${NORMALIZER_EMBEDDING_DTYPE}" \
    EMBEDDING_DIMENSIONS="${NORMALIZER_EMBEDDING_DIMENSIONS}" \
    EMBEDDING_CACHE_DIR="${NORMALIZER_EMBEDDING_CACHE_DIR}" \
    EMBEDDING_ALLOW_REMOTE_MODELS="${NORMALIZER_ALLOW_REMOTE_MODELS}" \
    TOP_K_CANDIDATES=10 \
    RETURN_TOP_N=3 \
    SEMANTIC_WEIGHT=0.6 \
    STRING_WEIGHT=0.25 \
    TOKEN_WEIGHT=0.15 \
    AUTO_BACKFILL_EMBEDDINGS="${NORMALIZER_AUTO_BACKFILL_EMBEDDINGS}" \
    MODEL_VERSION="${NORMALIZER_MODEL_VERSION}" \
  --output none

az containerapp create \
  --name "${AZURE_API_APP}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --environment "${AZURE_ENV_NAME}" \
  --image "${ACR_LOGIN_SERVER}/chefvision/api:${IMAGE_TAG}" \
  --registry-server "${ACR_LOGIN_SERVER}" \
  --registry-username "${ACR_USERNAME}" \
  --registry-password "${ACR_PASSWORD}" \
  --ingress external \
  --target-port 4000 \
  --min-replicas "${MIN_REPLICAS}" \
  --max-replicas "${MAX_REPLICAS}" \
  --cpu 0.75 \
  --memory 1.5Gi \
  --secrets \
    api-db-url="${DATABASE_URL}" \
    api-redis-url="${REDIS_URL}" \
    api-jwt-secret="${JWT_SECRET}" \
  --env-vars \
    PORT=4000 \
    DATABASE_URL=secretref:api-db-url \
    DATABASE_SSL=require \
    REDIS_URL=secretref:api-redis-url \
    JWT_SECRET=secretref:api-jwt-secret \
    NORMALIZER_URL="http://${AZURE_NORMALIZER_APP}" \
    STORAGE_MODE=local \
    LOCAL_UPLOAD_DIR=/tmp/chefvision-uploads \
  --output none

API_URL="$(
  az containerapp show \
    --name "${AZURE_API_APP}" \
    --resource-group "${AZURE_RESOURCE_GROUP}" \
    --query properties.configuration.ingress.fqdn \
    --output tsv
)"

cat <<EOF

Deployment complete.

API URL:
  https://${API_URL}

Frontend URL:
  https://${API_URL}/ui

Health URL:
  https://${API_URL}/health

Demo login:
  owner@chefvision.test / secret
  admin@chefvision.test / secret

Database server:
  ${AZURE_POSTGRES_SERVER}

Schema and seed data from sql/001_init.sql were already applied with Azure CLI before the apps were created.

Important:
  This script deploys the current codebase with STORAGE_MODE=local inside Container Apps.
  That is fine for a demo, but uploaded invoice files live on the app filesystem.
  Keep replicas at 1 unless you add a real Azure Blob Storage adapter to the codebase.
  The normalizer now starts with MiniLM embeddings and will prewarm on boot.
  First start can take longer because the model is downloaded from Hugging Face and cached at ${NORMALIZER_EMBEDDING_CACHE_DIR}.

EOF
