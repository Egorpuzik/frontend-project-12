install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	npx start-server --static ./frontend/dist
