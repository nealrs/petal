var compressor = require('node-minify');

// concatenate ,for js
new compressor.minify({
  type: 'no-compress',
  fileIn: ['vendors/marked/lib/marked.js', 'vendors/js-url/js-url.js', 'vendors/removeParameter.js', 'vendors/atwho.js/dist/js/jquery.atwho.js', 'trash/petal.js'],
  fileOut: 'trash/petal.uncompressed.js', 
  callback: function(err){
    if(err){
      console.log(err);
    }
  }
});
// minify js
new compressor.minify({
  type: 'yui-js',
  fileIn: 'trash/petal.uncompressed.js',
  fileOut: 'build/petal.min.js',
  callback: function(err){
    console.log('minify js files to build/petal.min.js')
    if(err){
      console.log(err);
    }
  }
});

// for CSS
new compressor.minify({
  type: 'yui-css',
  fileIn: ['trash/petal.uncompressed.css', 'vendors/atwho.js/dist/css/jquery.atwho.css'],
  fileOut: 'css/petal.min.css',
  callback: function(err){
    console.log('Concat css files to css/petal.min.css');
    if(err){
      console.log(err);
    }
  }
});
