test:
	make test-local

test-local:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=false && ./node_modules/.bin/mocha ./test/index.js)

test-remote:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=true && ./node_modules/.bin/mocha ./test/index.js)

test-ci:
	(. ./.env && NODE_DOCUMENT_TEST_AUTH=false && ./node_modules/.bin/mocha ./test/index.js --reporter dot --ignore-leaks)

.PHONY: test