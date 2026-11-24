# Electrolux Video Studio

A React + TypeScript prototype for discovering product-specific video opportunities and creating market-localized scripts and storyboards. Product catalogue values, market availability, recommendations, and generated content are simulated demo data; they are not verified Electrolux product claims.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The development command starts both the React app and the mock Node/Express catalogue API. No database or AI credentials are needed.

To create a production frontend bundle, run `npm run build`. Then `npm start` serves both the built app and API on port 3001 by default; Cloud Run supplies its own `PORT`.

## Demo PNCs

| PNC | Demo product |
| --- | --- |
| `914550123` | PureWash 800 Front Load Washer |
| `925060789` | Cooling 700 French Door Refrigerator |
| `911740456` | CleanPro 600 Built-in Dishwasher |

All three demo products are available across nine simulated European markets: Italy (Italian), Germany (German), the United Kingdom (English), Hungary (Hungarian), France (French), Spain (Spanish), Poland (Polish), Sweden (Swedish), and Norway (Norwegian). Search the washer PNC, choose Italy and Germany, and generate localized variations; the language selector follows the selected market.

## Prototype capabilities

- Play local preview videos from Electrolux Bynder for the demo washer, refrigerator, and dishwasher products. The files under `public/videos/` are mapped one-to-one to those categories. The final **Publish to Bynder** action is shown but disabled until Bynder API access and product-link metadata are configured.
- Search the mock catalogue by PNC through `GET /api/products?pnc=...`; retrieve product markets through `GET /api/products/:pnc/markets`.
- Browse the demo product catalogue by appliance category or use the PNC search and optional market/category filters.
- Select markets and filter deterministic opportunity recommendations. Recommendations are grounded in the local demo product record.
- Configure video category, market, language, audience, tone, voiceover, format, duration, subtitles, and channel.
- Generate localized scripts and scene-by-scene storyboards without external credentials. Installation and troubleshooting content is flagged for human review rather than inventing instructions.
- Preview a simulated storyboard, navigate scenes, edit narration, regenerate scene visuals, download script/subtitles, or use the browser print dialog to save a storyboard as PDF.
- Save generated variations and mark them approved or pending review in the in-memory project library.

The mock catalogue API, deterministic recommendation service, and deterministic content-generation service are separate modules so they can be replaced with approved Electrolux systems later. Video rendering and publishing integrations are not connected in this prototype.

## Deploy to Google Cloud Run

The GitHub Actions workflow in `.github/workflows/deploy-cloud-run.yml` runs the production build on pull requests. A push to `main` or a manual workflow run builds and deploys the container to Cloud Run in project `tohero-elx-lens-c7b2`, region `europe-north1`. The service is deployed as **private**; Cloud Run invocation requires IAM permission.

One-time Google Cloud setup:

1. Enable the required APIs and create the Docker repository:

   ```bash
   PROJECT_ID=tohero-elx-lens-c7b2
   gcloud services enable run.googleapis.com artifactregistry.googleapis.com iam.googleapis.com iamcredentials.googleapis.com \
     --project=tohero-elx-lens-c7b2
   gcloud artifacts repositories create electrolux-video-studio \
     --repository-format=docker --location=europe-north1 \
     --project=tohero-elx-lens-c7b2
   ```

2. Create dedicated deploy and runtime service accounts, then grant the deploy account only the permissions the workflow needs:

   ```bash
   PROJECT_ID=tohero-elx-lens-c7b2
   PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
   DEPLOY_SA="github-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
   RUNTIME_SA="video-studio-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
   POOL_ID=github-actions
   PROVIDER_ID=team-lens

   gcloud iam service-accounts create github-deployer --project="$PROJECT_ID"
   gcloud iam service-accounts create video-studio-runtime --project="$PROJECT_ID"
   gcloud projects add-iam-policy-binding "$PROJECT_ID" \
     --member="serviceAccount:${DEPLOY_SA}" --role=roles/artifactregistry.writer
   gcloud projects add-iam-policy-binding "$PROJECT_ID" \
     --member="serviceAccount:${DEPLOY_SA}" --role=roles/run.admin
   gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
     --project="$PROJECT_ID" --member="serviceAccount:${DEPLOY_SA}" \
     --role=roles/iam.serviceAccountUser
   ```

3. Configure Workload Identity Federation for GitHub repository `2hero-electrolux/team-lens`, restricted to the `main` branch. Do not use a downloadable service-account key.

   ```bash
   gcloud iam workload-identity-pools create "$POOL_ID" \
     --location=global --project="$PROJECT_ID" --display-name="GitHub Actions"
   gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
     --location=global --project="$PROJECT_ID" --workload-identity-pool="$POOL_ID" \
     --display-name="Team Lens GitHub" \
     --issuer-uri="https://token.actions.githubusercontent.com" \
     --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
     --attribute-condition="assertion.repository == '2hero-electrolux/team-lens' && assertion.ref == 'refs/heads/main'"
   gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" \
     --project="$PROJECT_ID" --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/2hero-electrolux/team-lens"
   ```

4. In the GitHub repository’s **Settings → Secrets and variables → Actions → Variables**, add:
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/team-lens` (replace `PROJECT_NUMBER` with the value above).
   - `GCP_SERVICE_ACCOUNT`: `github-deployer@tohero-elx-lens-c7b2.iam.gserviceaccount.com`.

The workflow prints the Cloud Run service URL after deployment. To allow a user or group to open the private service, grant that identity `roles/run.invoker` on the Cloud Run service in the Google Cloud console or with `gcloud run services add-iam-policy-binding`.

The container serves both the built React app and `/api` endpoints on the Cloud Run-provided `PORT`. Build it locally with `docker build -t electrolux-video-studio .`.
