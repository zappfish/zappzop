NPM_BIN := node_modules/.bin
VITE := $(NPM_BIN)/vite

.PHONY: demo
demo:
	$(VITE)

.PHONY: clean
clean:
	rm -rf dist

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


