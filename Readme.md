petal
-----

Aimed to make a comment system powered by github issues.

In process.

Usage
-----

```html
<!-- petal begin -->
<link rel="stylesheet" href="https://github.com/hit9/petal/raw/gh-pages/css/petal.min.css" type="text/css" />
<script src="https://github.com/hit9/petal/raw/gh-pages/build/petal.min.js" type="text/javascript" charset="utf-8"></script>
<script>
    $(document).ready(function(){  // important!
        $.petal.init("hit9/petal", 1) // $.petal.init(repo, issue_id)
    })
</script>
<div class="petal"></div>
<!-- petal end -->
```

Developers
----------

fork and install dependences(coffee, less and browserify):

    sudo npm install -g coffee-script
    sudo npm install -g browserify
    sudo npm install -g less

And then update submodule

    git submodule --init update
