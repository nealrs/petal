$ = jQuery

$.support.cors = true

api_base = "https://api.github.com/repos/"

# client_id from github app register
client_id = "2ae54488ab61bc732407"
# the callback from github app register, without /
proxy_url = "http://petal.ap01.aws.af.cm"

marked = require "marked"

# for @ at.js
users = []

petal =
  repo: "user/repo"
  issue_id: 1
  init: (repo, issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = api_base + this.repo + "/issues/" + this.issue_id + "/comments"
    # sperate the petal div
    $(".petal").append('<div class="comments"></div><div class="reply" ></div><div class="footer"></div>')

    load()

$.petal = petal

# render markdown body to html
render_body = (com_body)->
  # replace the "comment from url" with ""
  str = com_body.replace(/Comment from http[s]?:\/\/(.*)/, "")
  # markdown it!
  str = marked(str)
  # replace the @ and return
  return str.replace(/\B@([\w-]+)/gm, '<a href="https://github.com/$1" target="_blank">@$1</a>')

# append comment object to ul
append_com = (com)->
  $(".petal .comments ul").append('
      <li>
        <div class="user">
          <img src="https://secure.gravatar.com/avatar/' + com.user.gravatar_id + '?s=50" />
          <a class="username" href="https://github.com/' + com.user.login + '" >' + com.user.login + '</a>
        </div>
        <div class="content">
          <div class="body" >' + render_body(com.body) + '</div>
          <p class="date">' + com.updated_at.slice(0,10) + '</p>
        </div>
      </li>
  ')
  # append to users array
  users.push com.user.login
  users = $.unique(users)

load = -> $.getJSON(petal.api_url+"?callback=?",
  (response)->
    # load comments
    comments = response.data
    $(".petal .comments").append("<ul></ul>")
    for com in comments
      append_com(com)
    # load the reply textarea div
    load_reply()
  )

load_reply = -> 
  $(".petal .reply").append('
    <p class="note">*Require Github account<a id="gfm-help" href="http://github.github.com/github-flavored-markdown">GitHub Flavored Markdown</a></p>
    <p class="err"></p>
    <textarea id="petal-textarea"></textarea>
    <p class="note" >Press Ctrl+Enter to post your comment.</p>
  ')
  # load footer copyright
  $(".petal .footer").html('By <a href="https://github.com/hit9/petal">petal</a>')
  # check if callback! get petalcode parameter from url and set token
  test_token()
  # check if un reply content exists.must after load reply
  test_un_reply()
  # listen to Ctrl+Enter
  $("#petal-textarea").keydown((e)->
    if e.keyCode == 10 || e.keyCode == 13 && e.ctrlKey
      content = $("#petal-textarea").val()
      if content
        post_reply(content)
      else
        err("Comment field was blank")
  )
  # listen to @
  $("#petal-textarea").atwho("@", {data: users})

post_reply = (content) ->

  # test token and store the un reply content
  storage = window.localStorage
  token = storage.getItem("petaltoken")
  if token == null
    # store user's unreply comment content
    storage.setItem("petal_un_reply", content)
    return authorize()

  # add comment from url
  content += "\n Comment from "+url()

  # post comment content to github
  $.ajax({
    type: "post",
    url: petal.api_url, 
    dataType: "json",
    data: JSON.stringify({'body': content}), 
    headers:{
      Authorization: "token " + token,
      Accept: 'application/json'
    },
    success: (response, status, jqXHR)->
      # clean un_reply if exists
      un_reply = storage.getItem("petal_un_reply")
      if un_reply
        storage.removeItem("petal_un_reply")
      # append to comments list
      append_com(response)
      # reset textarea
      $("#petal-textarea").val("")
    , 
    error: (jqXHR, error, errorThrown)->
      # the token is out of date or not a right one
      if jqXHR.status&&jqXHR.status==401
        # store user's unreply comment content
        storage.setItem("petal_un_reply", content)
        # go to authorize again
        authorize()
      else
          err("Something wrong.")
  })


authorize = ->
  authorize_url = "https://github.com/login/oauth/authorize"
  _url = authorize_url + "?client_id="+client_id+"&scope=public_repo,user&redirect_uri="+proxy_url+"/?callback="+url()
  # redirect to github authorize
  window.location.replace(_url)

# if un_reply exists, init the textarea with that value
test_un_reply = ->
  un_reply = window.localStorage.getItem("petal_un_reply")
  if un_reply
    post_reply(un_reply)

test_token = ->
  token = url("?petaltoken")
  if token  # if there is parameter petaltoken
    token = token.replace(/^\/|\/$/g, '') # replace those "/" with white space
    storage = window.localStorage
    storage.setItem("petaltoken", token)
    # remove the token parameter in url without reload
    window.history.pushState("",document.title ,
      # remove the slah after url and remove the ? after url
      removeParameter(unescape(url()).replace(/\/$/, '').replace(/\?$/,""),"petaltoken")
    )

err = (msg)->
  $(".petal .err").text(msg)
  $(".petal .err").show()
  $(".petal .err").delay(7000).fadeOut(300)
