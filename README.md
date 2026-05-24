# Heart Disease Predictor

This repository contains a full-stack heart disease prediction application with:
- `backend/`: FastAPI backend, ML model training, user authentication, chat service
- `frontend/`: React + TypeScript UI for health forms, results, comparison, chat, and profile management

## Render Deployment

This project includes `render.yaml` to deploy both services on Render:
- `heart-disease-backend` (Python web service)
- `heart-disease-frontend` (Static site)

### Setup Steps

1. Push this repository to GitHub.
2. In Render, connect the GitHub repository.
3. Add the following services from `render.yaml`:
   - `heart-disease-backend`
   - `heart-disease-frontend`
4. Set environment variables for the backend service:
   - `OPENAI_API_KEY` (optional, only if you want chatbot AI integration)
   - `OPENAI_MODEL` (optional, default is `gpt-4o-mini`)
5. After the backend service is deployed, copy its public URL.
6. Set `REACT_APP_API_URL` for the frontend service to the backend URL.
7. Redeploy the frontend service.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Notes

- Backend CORS is configured for deployment.
- API requests in the frontend use `REACT_APP_API_URL` when available.
- Do not commit secret keys. Use Render environment variables instead.
