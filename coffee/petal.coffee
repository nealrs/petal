$ = jQuery
$.support.cors = true
api_base = "https://api.github.com/repos/"

marked = require "marked"

petal =
  repo: "user/repo"
  issue_id: 1
  init: (repo, issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = api_base + this.repo + "/issues/" + this.issue_id + "/comments"
    load_comments()
    load_textarea()

$.petal = petal

load_comments = -> $.getJSON(petal.api_url+"?callback=?",
  (response)->
    comments = response.data
    $(".petal").append("<ul></ul>")
    for com in comments
      $(".petal ul").append("
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

load_textarea = ->
  $(".petal").append("
  <div class=\"textarea\">
    <textarea
  </div>
  ")
