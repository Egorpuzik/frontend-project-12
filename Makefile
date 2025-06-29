install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	start-server -s ./frontend/dist
