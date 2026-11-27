.PHONY: build

# Static files to upload from dist/ to the hosting document root.
build:
	mkdir -p dist
	cp index.html hero.css hero.js dist/
	cp -R assets dist/
