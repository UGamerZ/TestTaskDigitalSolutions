# Digital Solutions Test Task

A full-stack demo app combining a TypeScript + React frontend with an Express backend - the test task for the middle fullstack dev position. The app lets users browse a large registry of IDs, select items, reorder selected items via drag-and-drop, and persist the selection state on the server.

## Features

- **Frontend**
  - React + Vite + TypeScript app
  - Two-pane UI for `Available Registry` and `Active Selection`
  - Search by ID inside both lists
  - Infinite scrolling for large result sets
  - Drag-and-drop reorder support for selected items
  - Create/add a new numeric ID to the available registry

- **Backend**
  - Express server with TypeScript
  - CORS enabled for frontend communication
  - REST API for retrieving registry items and selection state
  - Selection persistence via an in-memory store

- **Deployment**
  - Docker Compose for running frontend and backend together
  - Backend on port `4000`
  - Frontend on port `80`

## Repository Structure

- `backend/` — Express + TypeScript server
- `frontend/` — React + Vite + TypeScript application
- `Dockerfile.backend` — multi-stage build for backend
- `Dockerfile.frontend` — multi-stage build for frontend
- `docker-compose.yml` — runs frontend and backend services together

## API Endpoints

The backend exposes the following endpoints:

- `GET /api/elements`
  - Query params: `type`, `search`, `offset`, `limit`
  - Returns paginated items for either available or selected type

- `POST /api/elements`
  - Body: `{ id: number }`
  - Adds a new item by numeric ID

- `GET /api/selection`
  - Returns selected IDs: `{ ids: number[] }`

- `POST /api/selection`
  - Body: `{ ids: number[] }`
  - Updates the current selection order

## Run Locally with Docker

From the repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:80`
- Backend healthcheck: `http://localhost:4000/api/selection`

## Run Locally without Docker

### Backend

```bash
cd backend
npm install
npm run start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If you need to override the backend URL, set `VITE_API_URL` before starting the frontend.

## The deployed website can be accessed at: https://8mgz-4ap0-5u6a.gw-1a.dockhost.net
