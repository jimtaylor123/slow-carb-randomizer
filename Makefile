.PHONY: install dev build lint typecheck test test-e2e qa mobile mobile-ios mobile-android clean

install:
	npm install

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

test-e2e:
	npm run test:e2e

qa:
	npm run qa

mobile:
	npm run mobile

mobile-ios:
	npm run mobile:ios

mobile-android:
	npm run mobile:android

clean:
	rm -rf .next out
