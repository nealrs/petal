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
    $(".petal").append("<div class=\"comments\"></div><div class=\"reply\" ></div><div class=\"footer\"></div>")
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
    <p class=\"note\">Require Github account.(Comments are parsed with <a href=\"http://github.github.com/github-flavored-markdown/\">GitHub Flavored Markdown</a>)</p>
    <textarea></textarea>
  ")
