install:
	npm ci
	cd frontend && npm ci

build:
	rm -rf frontend/dist
	cd frontend && npm run build

start-dev:
	make start-backend & make start-frontend

start-frontend:
	cd frontend && npm run dev

start-backend:
	npx @hexlet/chat-server

start:
	npm run build
	npm start

lint:
	cd frontend && npx eslint .

test:
	npm test

test-e2e:
	npx playwright test
