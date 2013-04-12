# vim:set noet:
all:
	mkdir -p trash
	sass sass/petal.sass:trash/petal.uncompressed.css
	coffee -c -o trash/ coffee/petal.coffee
	node for-minify.js
clean:
	rm trash -rf
