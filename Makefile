install:
	npm ci
	cd frontend && npm ci

build:
	rm -rf frontend/build
	cd frontend && npm run build

start-backend:
	npm run backend

start-frontend:
	cd frontend && npm run dev

start:
	make start-backend & make start-frontend
