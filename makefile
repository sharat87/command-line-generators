serve:
	npx parcel serve index.html --out-dir dist-serve --no-autoinstall --port 5200 --hmr-port 5201 --open

build: node_modules/sentinel
	npx parcel build index.html --out-dir dist-build --no-autoinstall --no-cache --no-source-maps

node_modules/sentinel: package.json yarn.lock
	yarn install --frozen-lockfile
	touch node_modules/sentinel


.PHONY: serve build
