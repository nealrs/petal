$ = jQuery
$.support.cors = true
api_base = "https://api.github.com/repos/"

# client_id from github app register
client_id = "2ae54488ab61bc732407"
# the callback from github app register
proxy_url = "http://aqueous-refuge-6537.herokuapp.com/"
marked = require "marked"

petal =
  repo: "user/repo"
  issue_id: 1
  init: (repo, issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = api_base + this.repo + "/issues/" + this.issue_id + "/comments"
 
    $(".petal").append("<div class=\"comments\"></div><div class=\"reply\" ></div><div class=\"footer\"></div>")
    test_token()  # check if callback! get petalcode parameter from url and set token
    load_reply()
    load_footer()
    load_comments()

$.petal = petal

load_footer = -> $(".petal .footer").html("By <a href=\"https://github.com/hit9/petal\">petal</a>")

append_com = (com)->
  $(".petal .comments ul").append("
      <li>
        <div class=\"user\">
          
          <img src=\"https://secure.gravatar.com/avatar/" + com.user.gravatar_id + "?s=50\" />
          <a class=\"username\" href=\"https://github.com/"+com.user.login+"\" >"+com.user.login+"</a>
        </div>
        <div class=\"content\">
          <div class=\"body\"" + marked(com.body) + "</div>
        </div>
      </li>
  ")

load_comments = -> $.getJSON(petal.api_url+"?callback=?",
  (response)->
    comments = response.data
    $(".petal .comments").append("<ul></ul>")
    for com in comments
      append_com(com)
  )


load_reply = -> 
  $(".petal .reply").append("
    <p class=\"note\">Require Github account.</p>
    <p class=\"err\"></p>
    <textarea id=\"petal-textarea\"></textarea>
    <p class=\"note\" >Press Ctrl+Enter to post your comment.</p>
  ")
  # listen to Ctrl+Enter
  $("#petal-textarea").keydown((e)->
    if e.keyCode == 10 || e.keyCode == 13 && e.ctrlKey
      content = $("#petal-textarea").val()
      if content
        post_reply(content)
      else
        err("Comment field was blank")
  )


post_reply = (content) ->
  storage = window.localStorage
  token = storage.getItem("petaltoken")
  if token  == null
    return authorize()
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
      append_com(response)
      # reset textarea
      $("#petal-textarea").val("")
    , 
    error: ()->
      err("Failed to post comment")
  })


authorize = ->
  authorize_url = "https://github.com/login/oauth/authorize"
  _url = authorize_url + "?client_id="+client_id+"&scope=public_repo,user&redirect_uri="+proxy_url+"/?callback="+url()
  # redirect to github authorize
  window.location.replace(_url)

test_token = ->
  token = url("?petaltoken")
  if token  # if there is parameter petaltoken
    token = token.replace(/^\/|\/$/g, '') # replace those "/"
    storage = window.localStorage
    storage.setItem("petaltoken", token) 

err = (msg)->
  $(".petal .err").text(msg)
  $(".petal .err").show()
  $(".petal .err").delay(7000).fadeOut(300)
