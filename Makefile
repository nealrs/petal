# vim:set noet:
all:
	mkdir -p trash
	sass sass/petal.sass:trash/petal.uncompressed.css
	browserify -t ./ -c 'coffee -sc' coffee/petal.coffee > trash/petal.without.vendors.js
	node for-minify.js
clean:
	rm trash -rf
