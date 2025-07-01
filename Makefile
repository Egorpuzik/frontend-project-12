install:
	npm ci
	cd frontend && npm ci

build:
	rm -rf frontend/dist
	cd frontend && npm run build

start:
	rm -rf frontend/dist
	cd frontend && npm run build
	npx start-server -s ./frontend/dist -p 5001
