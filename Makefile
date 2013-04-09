# vim:set noet:
all:
	lessc less/petal.less trash/petal.uncompressed.css --compress
	browserify -t . -c 'coffee -sc' coffee/petal.coffee > trash/petal.without.vendors.js
	node for-minify.js
