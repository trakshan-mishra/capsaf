# PulseFi AI Fintech Dashboard

A phone-first fintech dashboard prototype with working frontend interactions:

- AI insights + AI summary panel
- AI expense tracker charts (auto-refresh)
- AI finance chat (free/open model guidance only)
- Bill scanner status flow (demo)
- Paytm JSON/CSV import (parses and appends transactions)
- Manual expense add form (updates metrics, charts, summary)
- **Logout** action (demo)
- **Biometric support check** via WebAuthn detection
- **Phone notifications** support via Web Notifications API
- **GST + invoice center** for 5/12/18/28% invoice tax computation
- Mobile bottom quick-nav for Home/Charts/Chat/GST

## Run locally

```bash
cd /workspace/capsaf
python3 -m http.server 4173
```

Open: `http://localhost:4173`

Alternative:

```bash
cd /workspace/capsaf
npx serve -l 4173
```

## Quick test after launch

1. Click **Verify Biometrics**.
2. Click **Enable Notifications**.
3. Add an expense and see metrics + charts update.
4. Add a GST invoice and verify GST totals.
5. Ask chat: `which free model should i use?`
6. Click **Logout**.

## Open-source model plan (no Anthropic)

- **LLM:** Llama 3.1 / Mistral / Qwen via Ollama
- **OCR:** Tesseract OCR + PaddleOCR
- **Embeddings:** nomic-embed-text

> Frontend-only prototype; backend auth, push notifications and OCR extraction endpoints can be plugged in next.
