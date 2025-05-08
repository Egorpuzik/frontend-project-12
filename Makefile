install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	npm run start
	npm run backend
