repo_api = 'https://api.github.com/repos/'

$ = jQuery

$.support.cors = true

petal =
  repo: 'user/repo'
  issue_id: 1
  init: (repo,issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = repo_api + repo + '/issues/' + issue_id + '/comments'
    $('.petal').append('
      <div class="comments">
        <ul></ul>
      </div>
      <div class="reply">
        <p class="note">
          *Require Github account
          <a id="issue-src" href="https://github.com/' + repo + '/issues/' + issue_id + '">' + repo+'/issues/' + issue_id + '</a>
        </p>
        <p class="err"></p>
        <textarea id="petal-textarea"></textarea>
        <p class="note" >
          <a href="javascript:void(0);">Ctrl+Enter</a> to post comment.
          (Comments are parsed with <a href="http://github.github.com/github-flavored-markdown">GitHub Flavored Markdown</a>)
        </p>
      </div>
      <div class="footer">By <a href="https://github.com/hit9/petal/">petal</a></div>
    ')
    load()

$.petal = petal

# client_id from github
client_id = "2ae54488ab61bc732407"
# without forward slash
proxy_url = "http://petal.ap01.aws.af.cm"

# markdown parser
marked = require "marked"
# users commented on this issue
users = []


render_comment_body = (comment_body)->
  com = marked(
    comment_body.replace(/\*Comment from http[s]?:\/\/(.*)\*$/, "")
  )
  return com.replace(
    /\B@([\w-]+)/gm,
    '<a href="https://github.com/$1" target="_blank">@$1</a>'
  )


append_comment(comment)->
  $('.petal .comments ul').append('
    <li id="petal-comment-"' + comment.id + '">
      <div class="user">
        <img src="https://secure.gravatar.com/avatar/' + comment.user.gravatar_id + '?s=50" />
        <a class="username" href="https://github.com/' + comment.user.login + '" >' + comment.user.login + '</a>
      </div>
      <div class="content">
        <div class="body" id="petal-md" >' + render_comment_body(comment.body) + '</div>
        <p class="date">' + comment.updated_at.slice(0,10) + '</p>
      </div>
    </li>
  ')
  users.push comment.user.login
  users = $.unique(users)


load = ->
  $.getJSON(
    petal.api_url + '?callback=?',
    (response)->
      comments = response.data

      # load comments
      for comment in comments
        append_comment(comment)

      # if token in url, set to localStorage
      token = url('?petaltoken')
      if token
        # remove "/"
        token = token.replace(/^\/|\/$/g, '')
        storage = window.localStorage
        storage.setItem('petaltoken', token)
        # remove the token parameter in url without reload
        window.history.pushState(
          '',
          document.title,
          # remove "/" or "?" end of url
          removeParameter(unescape(url()).replace(/\/$/, ''),'petaltoken').replace(/\?$/,'')
        )

    # if un_reply in localStorage, post it
    comment = window.localStorage.getItem('petal_un_reply')
    if comment
      window.location.hash='#petal-textarea'
      post_comment(comment)

    # listen to Ctrl+Enter
    $('#petal-textarea').keydown(
      (e)->
        if e.keyCode == 10 || e.keyCode == 13 && e.ctrlKey
          comment = $('#petal-textarea').val()
          # if not empty
          if comment
            post_comment(comment)
          else
            err('Comment field was blank')
    )
    # listen to @
    $('#petal-textarea').atwho('@', {data: users})
  )
