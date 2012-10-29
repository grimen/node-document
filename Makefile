test:
	(echo test/*_spec.js && ./node_modules/.bin/mocha ./test/*_spec.js) && (echo test/storage/*_spec.js && ./node_modules/.bin/mocha ./test/storage/*_spec.js)

.PHONY: test