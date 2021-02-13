serve:
	npx parcel serve index.html --out-dir dist-serve --no-autoinstall --port 5200 --hmr-port 5201 --open

build:
	npx parcel build index.html --out-dir dist-build --no-autoinstall --no-cache --no-source-maps


.PHONY: serve build
