NPM_BIN := node_modules/.bin
ESBUILD := $(NPM_BIN)/esbuild

TS_ENTRY := src/index.ts
OUTPUT_DIR := dist

.PHONY: all
all:

.PHONY: test
test:
	$(NPM_BIN)/tap --disable-coverage -Rtap tests

.PHONY: serve
serve:
	$(ESBUILD) $(TS_ENTRY) --bundle --sourcemap --outdir=$(OUTPUT_DIR) --servedir=.
