# vim:set noet:
all:
	coffee -c  -o lib coffee/petal.coffee
	lessc less/petal.less css/petal.css
	browserify lib/petal.js > build/petal.js
