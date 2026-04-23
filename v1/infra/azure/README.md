# Azure CLI Deployment

This folder contains a simple Azure CLI deployment path for the current ChefVision repo.

## What it deploys

- Azure Container Registry
- Azure Container Apps environment
- `chefvision-normalizer` Container App
- `chefvision-api` Container App
- Azure Database for PostgreSQL Flexible Server
- Azure Cache for Redis

The deployment now assumes the production normalizer path:

- `onnx-community/all-MiniLM-L6-v2-ONNX`
- pgvector `vector(384)`
- automatic normalizer warmup on boot
- automatic backfill of missing canonical embeddings

## Important limitation

The current codebase does not yet include an Azure Blob Storage adapter. The deployment script therefore sets:

- `STORAGE_MODE=local`
- `LOCAL_UPLOAD_DIR=/tmp/chefvision-uploads`

That works for demos, but invoice uploads are stored on the container filesystem. Because of that, keep the Container Apps replica count at `1` unless storage is upgraded.

## Prerequisites

- Azure CLI installed
- `az login` completed
- permission to create Azure resources in the target subscription
- Docker is not required because the script uses `az acr build`
- outbound internet access from the Container App environment so the normalizer can download the MiniLM model on first boot

## Run it

From the repo root:

```bash
chmod +x infra/azure/deploy-container-apps.sh
AZURE_LOCATION=eastus \
AZURE_RESOURCE_GROUP=chefvision-rg \
AZURE_ENV_NAME=chefvision-env \
AZURE_ACR_NAME=chefvisionacr12345 \
AZURE_POSTGRES_SERVER=chefvisionpg12345 \
AZURE_REDIS_NAME=chefvisionredis12345 \
infra/azure/deploy-container-apps.sh
```

What the script now does before app creation:

- creates the PostgreSQL server and database
- allowlists the required PostgreSQL extensions (`vector` and `pgcrypto`)
- applies [sql/001_init.sql](/Users/girithchoudhary/Desktop/295/sql/001_init.sql) using `az postgres flexible-server execute`
- verifies the seeded canonical catalog exists
- only then creates the normalizer and API apps

That ordering matters because the normalizer prewarms on startup and expects the schema to exist already.

## Useful overrides

```bash
AZURE_LOCATION=eastus
AZURE_RESOURCE_GROUP=chefvision-rg
AZURE_ENV_NAME=chefvision-env
AZURE_ACR_NAME=chefvisionacr12345
AZURE_POSTGRES_SERVER=chefvisionpg12345
AZURE_POSTGRES_DB=chefvision
AZURE_POSTGRES_ADMIN=chefvisionadmin
AZURE_POSTGRES_PASSWORD='StrongPassword123!'
AZURE_REDIS_NAME=chefvisionredis12345
AZURE_API_APP=chefvision-api
AZURE_NORMALIZER_APP=chefvision-normalizer
IMAGE_TAG=demo1
JWT_SECRET=replace-me
MIN_REPLICAS=1
MAX_REPLICAS=1
NORMALIZER_EMBEDDING_PROVIDER=minilm
NORMALIZER_EMBEDDING_MODEL_ID=onnx-community/all-MiniLM-L6-v2-ONNX
NORMALIZER_EMBEDDING_DTYPE=fp32
NORMALIZER_EMBEDDING_DIMENSIONS=384
NORMALIZER_EMBEDDING_CACHE_DIR=/tmp/chefvision-model-cache
NORMALIZER_ALLOW_REMOTE_MODELS=true
NORMALIZER_AUTO_BACKFILL_EMBEDDINGS=true
NORMALIZER_MODEL_VERSION=azure-normalizer-v2-minilm
```

## After deployment

1. Wait for the normalizer’s first boot to finish downloading and warming the MiniLM model.
2. Open the API URL printed by the script.
3. Test `GET /health`, `GET /inventory`, and invoice upload flows.

If you want to inspect the normalizer revision while it is warming:

```bash
az containerapp logs show \
  --name chefvision-normalizer \
  --resource-group chefvision-rg \
  --follow
```

## Next improvement

For a more production-like Azure setup, the next step is to add Azure Blob Storage support to [apps/api/src/storage.ts](/Users/girithchoudhary/Desktop/295/apps/api/src/storage.ts) and then update the deployment script to provision a storage account and pass Blob configuration instead of `STORAGE_MODE=local`.
