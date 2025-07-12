install:
	npm ci
	cd frontend && npm ci

build:
	rm -rf frontend/dist
	cd frontend && npm run build

start-frontend:
	cd frontend && npm run dev

start-backend:
	npx @hexlet/chat-server

start:
	make start-backend & make start-frontend

lint:
	cd frontend && npx eslint .

test:
	npm test

test-e2e:
	npx playwright test
