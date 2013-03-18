# vim:set noet:
all:
	coffee -c  -o lib coffee/petal.coffee
	lessc less/petal.less css/petal.css --compress
	browserify lib/petal.js > build/petal.without.vendors.js
	node for-minify.js
