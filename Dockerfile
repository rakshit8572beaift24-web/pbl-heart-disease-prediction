# Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* frontend/yarn.lock* ./
COPY frontend/tsconfig.json frontend/postcss.config.js frontend/tailwind.config.js ./
COPY frontend/public ./public
COPY frontend/src ./src
RUN npm install
RUN npm run build

# Build the Python backend and copy frontend build
FROM python:3.12-slim AS backend
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/build ./frontend/build
WORKDIR /app/backend
EXPOSE 8000
ENV PORT=8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
