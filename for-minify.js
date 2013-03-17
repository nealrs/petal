var compressor = require('node-minify');
new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'build/petal.js',
  fileOut: 'build/petal.min.js', 
  callback: function(err){
    if(err){
      console.log(err);
    }
  }
});
