# vim:set noet:
all:
	lessc less/petal.less css/petal.css --compress
	browserify -t . -c 'coffee -sc' coffee/petal.coffee > build/petal.without.vendors.js
	node for-minify.js
