# vim:set noet:
all:
	coffee -c  -o lib coffee/petal.coffee
	lessc less/petal.less css/petal.min.css --compress
	browserify lib/petal.js > build/petal.js
	node for-minify.js
