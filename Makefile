test:
	make test-local

test-watch:
	make test-local-watch

test-local:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=false && ./node_modules/.bin/mocha ./test/index.js)

test-local-watch:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=false && ./node_modules/.bin/mocha ./test/index.js --watch)

test-remote:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=true && ./node_modules/.bin/mocha ./test/index.js)

test-ci:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=false && ./node_modules/.bin/mocha ./test/index.js --reporter dot --ignore-leaks)

.PHONY: test