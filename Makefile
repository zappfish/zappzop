NPM_BIN := node_modules/.bin
ESBUILD := $(NPM_BIN)/esbuild

TS_ENTRY := src/index.ts
OUTPUT_DIR := dist

ESBUILD_OPTIONS := $(TS_ENTRY) --bundle --outdir=$(OUTPUT_DIR) --jsx=automatic --jsx-dev

.PHONY: all
all:

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)

.PHONY: test
test:
	$(NPM_BIN)/tap --disable-coverage tests

.PHONY: lint
lint:
	-$(NPM_BIN)/eslint src tests
	-$(NPM_BIN)/prettier -c src tests

.PHONY: format
format:
	$(NPM_BIN)/prettier -w src tests

.PHONY: build
build:
	$(ESBUILD) $(ESBUILD_OPTIONS)

.PHONY: serve
serve:
	$(ESBUILD) $(ESBUILD_OPTIONS) --sourcemap --servedir=.
