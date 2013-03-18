petal
-----

Github issues powered system. Inspired by [sirbrad/comcom](https://github.com/sirbrad/comcom)

How to use
----------

```html
<!-- petal begin -->
<link rel="stylesheet" href="http://hit9.org/petal/css/petal.min.css" type="text/css" />
<script src="http://hit9.org/petal/build/petal.min.js" type="text/javascript" charset="utf-8"></script>
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
    sudo npm install node-minify

And then update submodule

    git submodule --init update

To build:

    make

Where the proxy script(which post to github for access_token) is ?

    http://aqueous-refuge-6537.herokuapp.com/

And the script:

```python
from flask  import Flask, redirect, request
import requests

app = Flask(__name__)


@app.route("/")
def index():
    code = request.args.get("code")
    callback = request.args.get("callback", "http://hit9.org/petal")

    client_id = "2ae54488ab61bc732407"
    client_secret = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret
    }
    headers = {'Accept': 'application/json'}
    token_url = "https://github.com/login/oauth/access_token"
    re = requests.post(token_url, data=data, headers=headers)
    token = re.json()['access_token']
    return redirect(callback+"?petaltoken="+token)
```
