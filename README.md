<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/66c9c4da-00be-4f26-a933-264e1345719d

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` (copy from `.env.example`) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

A GitHub Action is configured in `.github/workflows/deploy.yml` to automatically build and deploy this app to GitHub Pages on every push to the `main` branch. 

To enable this, ensure that in your repository settings:
- **Pages**: Source is set to **GitHub Actions**.
