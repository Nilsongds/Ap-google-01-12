# Deployment Guide

This guide describes how to deploy the **Gestor de Dívidas** application.

Based on your request, we cover two primary methods:
1.  **Google Cloud Run** (Containerized)
2.  **Vercel** (via GitHub) — *Assuming "verbal" referred to Vercel.*

## Prerequisite: Project Standardization

The current version of the application allows for rapid prototyping using browser-native ES modules. To deploy to production platforms like Cloud Run or Vercel, you should standardize the project using a build tool like **Vite**.

### 1. Initialize `package.json`
Run the following commands in your project root to create a package file and install dependencies:

```bash
npm init -y
npm install react react-dom lucide-react
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom autoprefixer postcss tailwindcss
```

### 2. Configure `vite.config.ts`
Create a file named `vite.config.ts` in the root directory:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 3. Update `index.html`
Modify your `index.html` to work with Vite:
1.  Remove the `<script type="importmap">` block.
2.  Update the script tag to point to your entry file: `<script type="module" src="/index.tsx"></script>`.

---

## Method 1: Google Cloud Run

Google Cloud Run is ideal for containerized applications. We will use Docker to build the app and Nginx to serve the static files.

### 1. Create `Dockerfile`
Create a file named `Dockerfile` in the root directory:

```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Default Nginx config usually works, but for SPA routing you might need a custom conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Deploy using gcloud CLI
Run the following commands in your terminal:

```bash
# Replace YOUR_PROJECT_ID with your actual Google Cloud Project ID

# 1. Build the container image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/debt-tracker

# 2. Deploy to Cloud Run
gcloud run deploy debt-tracker \
  --image gcr.io/YOUR_PROJECT_ID/debt-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Method 2: Vercel (via GitHub)

Vercel is the most common way to deploy React applications linked to GitHub.

### 1. Push to GitHub
Ensure your code (including the new `package.json` and `vite.config.ts`) is committed and pushed to a repository on GitHub.

### 2. Connect Vercel
1.  Go to [vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository (e.g., `debt-tracker`).

### 3. Configure Build Settings
Vercel should automatically detect that you are using Vite. Verify these settings:
*   **Framework Preset:** Vite
*   **Root Directory:** `./`
*   **Build Command:** `npm run build` (or `vite build`)
*   **Output Directory:** `dist`

### 4. Deploy
Click **Deploy**. Vercel will build your application and provide you with a live URL (e.g., `https://debt-tracker.vercel.app`).

**Note:** Whenever you push changes to your `main` branch on GitHub, Vercel will automatically rebuild and redeploy your application.