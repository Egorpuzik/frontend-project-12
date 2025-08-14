install:
	npm ci
	cd frontend && npm ci

build:
	if exist frontend\dist (powershell -Command "Remove-Item -Recurse -Force frontend\dist")
	cd frontend && npm run build

start-dev:
	start /MIN cmd /C "make start-backend"
	start /MIN cmd /C "make start-frontend"

start-frontend:
	cd frontend && npm run dev

start-backend:
	npx @hexlet/chat-server

start:
	make build
	npm run start

lint:
	cd frontend && npx eslint .

test:
	@echo "No tests to run"
