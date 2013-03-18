var compressor = require('node-minify');

// concatenate
new compressor.minify({
  type: 'no-compress',
  fileIn: ['build/petal.without.js-url.js', 'vendors/js-url.js'],
  fileOut: 'build/petal.uncompress.js', 
  callback: function(err){
    if(err){
      console.log(err);
    }
  }
});
// minify
new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'build/petal.uncompress.js',
  fileOut: 'build/petal.min.js',
  callback: function(err){
    if(err){
      console.log(err);
    }
  }
});
