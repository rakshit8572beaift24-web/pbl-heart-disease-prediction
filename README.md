# Heart Disease Predictor

This repository contains a full-stack heart disease prediction application with:
- `backend/`: FastAPI backend, ML model training, user authentication, chat service
- `frontend/`: React + TypeScript UI for health forms, results, comparison, chat, and profile management

## Render Deployment

This project includes `render.yaml` for a single Docker-based Render service:
- `heart-disease-app` (Docker web service hosting both the React frontend and FastAPI backend)

### Setup Steps

1. Push this repository to GitHub.
2. In Render, connect the GitHub repository.
3. Create a new Web Service and choose `Docker` deployment.
4. Point it at the repository branch `main`.
5. Render will use `render.yaml` and the root `Dockerfile`.
6. Set environment variables:
   - `OPENAI_API_KEY` (optional, only if you want chatbot AI integration)
   - `OPENAI_MODEL` (optional, default is `gpt-4o-mini`)
7. Deploy the service.

### Notes

- The backend serves the React build from `frontend/build`.
- API calls are relative by default, so the frontend will work from the same origin.
- No separate `REACT_APP_API_URL` is required for production deployment in the same service.

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
