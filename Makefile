install:
	npm ci
	cd frontend && npm ci

build:
	rm -rf frontend/build
	npm run build

start-frontend:
	cd frontend && npm run dev

start-backend:
	npx chat-server

start:
	make start-backend & make start-frontend

lint:
	cd frontend && npx eslint .
