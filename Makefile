install:
	npm ci
	cd frontend && npm ci

build:
	cd frontend && npm run build

start:
	cd frontend && npm run start
