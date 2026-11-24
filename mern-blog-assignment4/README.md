# InkWell — MERN Blog Application (Assignment 4)

A simple React + Express + MongoDB blog application with create, read and delete operations (the API also supports update). It is prepared for Docker and Docker Compose.

## Requirements
- Node.js 20+ and npm (for running locally)
- Docker Desktop with Docker Compose (recommended)

## Run the full application with Docker Compose
From this project root:

```bash
docker compose up --build -d
docker compose ps
```

Open:
- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health
- Blog API: http://localhost:5000/api/blogs

View logs:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Stop:
```bash
docker compose down
```

Stop and delete database data:
```bash
docker compose down -v
```

## Run backend without Docker
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Ensure MongoDB is running locally and `.env` contains a valid `MONGO_URI`.

## Run frontend without Docker
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
For local Vite development, configure a proxy or set `VITE_API_URL` to your backend API base URL. The provided Nginx proxy is used by the Docker Compose production container.

## API endpoints
- `GET /api/health` — health check
- `GET /api/blogs` — list posts
- `GET /api/blogs/:id` — get one post
- `POST /api/blogs` — create post; JSON body: `{ "title": "...", "content": "...", "author": "..." }`
- `PUT /api/blogs/:id` — update post
- `DELETE /api/blogs/:id` — delete post

## Assignment 4 notes
- Backend image: build with `docker build -t blog-backend ./backend`
- Frontend image: build with `docker build -t blog-frontend ./frontend`
- Compose file starts frontend, backend and MongoDB together.
- For MongoDB Atlas / Cloud Run, configure the backend `MONGO_URI` environment variable with your Atlas connection string. Never commit `.env` or credentials.
- The frontend Nginx proxy currently targets the Compose service `backend`. For a separate Cloud Run frontend service, change the proxy target to your deployed backend URL, rebuild and push the frontend image, then deploy it.
- CI/CD workflows, Docker Hub publishing and Cloud Run deployment still need to be configured as required by your assignment.

## Troubleshooting
- If Docker commands fail, start Docker Desktop and wait until it reports that the engine is running.
- If port 3000, 5000 or 27017 is already in use, stop the conflicting process or change the host-side port mapping in `docker-compose.yml`.
- If the backend cannot connect to MongoDB, run `docker compose logs backend` and `docker compose logs mongodb`.
