test:
	(echo test/*_spec.js && ./node_modules/.bin/mocha ./test/*_spec.js) \
	&& \
	(echo test/storage/memory_spec.js && ./node_modules/.bin/mocha ./test/storage/memory_spec.js) \
	&& \
	(echo test/storage/memcache_spec.js && ./node_modules/.bin/mocha ./test/storage/memcache_spec.js) \
	&& \
	(echo test/storage/redis_spec.js && ./node_modules/.bin/mocha ./test/storage/redis_spec.js) \
	&& \
	(echo test/storage/mongodb_spec.js && ./node_modules/.bin/mocha ./test/storage/mongodb_spec.js) \
	&& \
	(echo test/storage/elasticsearch_spec.js && ./node_modules/.bin/mocha ./test/storage/elasticsearch_spec.js) \


.PHONY: test