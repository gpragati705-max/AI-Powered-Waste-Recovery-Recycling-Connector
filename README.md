# ♻️ AI-Powered Waste Recovery & Recycling Connector

 *Don't just throw it away. Find where it belongs.*

Built for the **1M1B × IBM SkillsBuild AI for Sustainability Internship**. Primary SDG: **12**.

## The Problem
People often don't know what to do with different kinds of waste or where to take it, so recoverable material ends up in general disposal.

## What It Does
Describe your waste in plain language (e.g. *"5 kg newspapers, old clothes and a broken charger"*) and the app:

1. Categorizes each item (Paper, Plastic, Textile, E-waste, etc.)
2. Suggests a recovery path: recycle, reuse, upcycle, donate or specialized handling
3. Lets you correct any category, pathway or quantity
4. Warns you about e-waste and batteries
5. Matches you to Jaipur organizations and explains why
6. Tracks your recovery history

## How AI Is Used
- LLM prompt engineering with structured JSON output for classification
- Provider-agnostic adapter for any OpenAI-compatible API, set via environment variables
- Local keyword classifier fallback if no API key is set or the output is malformed
- Organization matching is rule-based; the AI never generates organizations or contact details

## Tech Stack
React, Vite, TypeScript, Tailwind CSS, localStorage. Built with Google Antigravity.

## Run Locally
```bash
git clone <your-repo-url>
cd <repo-folder>
cp .env.example .env.local
npm install
npm run dev
```
Optional: `VITE_AI_BASE_URL`, `VITE_AI_MODEL`, `VITE_AI_API_KEY`. Without a key, the app uses the local classifier.

## Responsible AI
- **Transparency:** confidence levels and match reasons are shown
- **Human control:** all AI outputs are editable
- **Privacy:** no login or personal data
- **Honesty:** no invented organizations or CO₂ claims

## Limitations
- Organization data is placeholder and marked unverified
- `VITE_` variables are visible in the client bundle; production should proxy AI calls via a backend
- Jaipur only

## Roadmap
Verified organization database, map integration, RAG assistant, more cities.

## Author
[Your Name], [Your College]
