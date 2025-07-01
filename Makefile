install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	npx start-server -s ./frontend/dist -p 5001
