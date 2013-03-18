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
    token()  # check if callback! get petalcode parameter from url and set token
    load_reply()
    load_footer()
    load_comments()

$.petal = petal

load_footer = -> $(".petal .footer").html("By <a href=\"https://github.com/hit9/petal\">petal</a>")

load_comments = -> $.getJSON(petal.api_url+"?callback=?",
  (response)->
    comments = response.data
    $(".petal .comments").append("<ul></ul>")
    for com in comments
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
  )


load_reply = -> 
  $(".petal .reply").append("
    <p class=\"note\">Require Github account.</p>
    <p class=\"warning\"></p>
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
        warning_show("Comment field was blank")
  )


post_reply = (content) ->
  storage = window.localStorage
  if storage.getItem("petaltoken") == null
    return authorize()


authorize = ->
  authorize_url = "https://github.com/login/oauth/authorize"
  _url = authorize_url + "?client_id="+client_id+"&redirect_uri="+proxy_url+"/?callback="+url()
  # redirect to github authorize
  window.location.replace(_url)

token = ->
  token_str = url("?petaltoken")
  if token_str  # if there is parameter petaltoken
    token_str = token_str.replace(/^\/|\/$/g, '') # replace those "/"
    storage = window.localStorage
    storage.setItem("petaltoken", token_str) 
    alert token_str

warning_show = (msg) ->
  $(".warning").show()
  $(".warning").text(msg)

warning_hide = ->
  $(".warning").hide()
