$ = jQuery
$.support.cors = true
api_base = "https://api.github.com/repos/"

root = exports ? this

root.petal =
  repo: "user/repo"
  issue_id: 1
  init: (repo, issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = api_base + this.repo + "/issues/" + this.issue_id + "/comments"
    load_comments()

load_comments = -> $.getJSON(petal.api_url+"?callback=?",
  (response)->
    data = response.data
    for com in data
      alert com.body
  )

