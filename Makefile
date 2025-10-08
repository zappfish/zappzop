NPM_BIN := node_modules/.bin
VITE := $(NPM_BIN)/vite

TS_ENTRY := src/index.ts

.PHONY: all
all:

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)

.PHONY: test
test:
	$(NPM_BIN)/vitest run

.PHONY: lint
lint:
	-$(NPM_BIN)/eslint src tests
	-$(NPM_BIN)/prettier -c src tests

.PHONY: format
format:
	$(NPM_BIN)/prettier -w src tests

.PHONY: build
build:
	$(VITE)

.PHONY: serve
serve:
	$(ESBUILD) serve
