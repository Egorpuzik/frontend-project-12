install:
	npm ci
	cd frontend && npm ci

build:
	if exist frontend\dist rmdir /s /q frontend\dist
	cd frontend && npm run build

start-dev:
	start "" /b make start-backend
	start "" /b make start-frontend

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
	npm test

test-e2e:
	npx playwright test
