$ = jQuery

$.support.cors = true

repo_api = 'https://api.github.com/repos/'

# client_id from github
client_id = '2ae54488ab61bc732407'

# without forward slash
proxy_url = 'http://petal.ap01.aws.af.cm'

# users commented on this issue
users = []

# items in localStorage
pu = 'petal_un_reply'
pt = 'petal_token'

# loader

loader = 'http://hit9.org/petal/static/octocat-loader.gif'

petal =
  repo: 'user/repo'
  issue_id: 1
  init: (repo,issue_id)->
    this.repo = repo
    this.issue_id = issue_id
    this.api_url = repo_api + repo + '/issues/' + issue_id + '/comments'
    $('.petal').append('
      <div class="comments">
        <ul><p class="loader"><img src="' + loader + '" /></p></ul>
      </div>
      <div class="reply">
        <p class="note">
          *Log into <a href="https://github.com" target="_blank">GitHub</a> to comment on this <a href="https://github.com/' + repo + '/issues/' + issue_id + '">thread</a>. Powered by <a href="https://github.com/hit9/petal" target="_blank">petal</a>. Supports <a href="http://github.github.com/github-flavored-markdown" target="_blank">GitHub Flavored Markdown</a>.
        </p>
        <p class="err"></p>
        <textarea id="petal-textarea"></textarea>
        <button id="sub_comment" class="btn btn-primary" type="button">Post comment</button>
      </div>
    ')
    load()

$.petal = petal


render_comment_body = (comment_body)->
  com = marked(
    comment_body.replace(/\*Comment from http[s]?:\/\/(.*)\*$/, "")
  )
  return com.replace(
    /\B@([\w-]+)/gm,
    '<a href="https://github.com/$1" target="_blank">@$1</a>'
  )


append_comment = (comment)->
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
      $('.petal .comments ul .loader').hide()
      for comment in comments
        append_comment(comment)

      # if token in url, set to localStorage
      token = url('?petaltoken')
      if token
        # remove "/"
        token = token.replace(/^\/|\/$/g, '')
        storage = window.localStorage
        storage.setItem(pt, token)
        # remove the token parameter in url without reload
        window.history.pushState(
          '',
          document.title,
          # remove "/" or "?" end of url
          removeParameter(unescape(url()).replace(/\/$/, ''),'petaltoken').replace(/\?$/,'')
        )

      # if un_reply in localStorage, post it
      comment = window.localStorage.getItem(pu)
      if comment
        window.location.hash = '#petal-textarea'
        post_comment(comment)

      # listen to post comment button
      $('#sub_comment').click(
        (e)->
          comment = $('#petal-textarea').val()
          # if not empty
          if comment
            post_comment(comment)
          else
            err('Comment field is blank')
      )
      # listen to @
      $('#petal-textarea').atwho('@', {data: users})
  )


post_comment = (comment)->
  # if no token, goto oauth
  storage = window.localStorage
  token = storage.getItem(pt)
  if token == null
    storage.setItem(pu, comment)
    return authorize()

  comment += "\n *Comment from "+ url().replace(/\?$/,"")+"*"

  $.ajax({
    type: 'post',
    url: petal.api_url, 
    dataType: 'json',
    data: JSON.stringify({'body': comment}), 
    headers:{
      Authorization: 'token ' + token,
      Accept: 'application/json'
    },
    success: (response, status, jqXHR)->
      # clear un_reply
      if storage.getItem(pu)
        storage.removeItem(pu)
      # append to comments list
      append_comment(response)
      # reset textarea
      $('#petal-textarea').val('')
    , 
    error: (jqXHR, error, errorThrown)->
      if jqXHR.status && jqXHR.status == 401
        # store user's unreply comment content
        storage.setItem(pu, comment)
        # go to authorize again
        authorize()
      else
          err('Something is wrong')
  })


authorize = ->
  ur = 'https://github.com/login/oauth/authorize'
  ur += '?client_id=' + client_id + '&scope=public_repo,user&redirect_uri=' + proxy_url + '/?callback=' + url()
  window.location.replace(ur)


err = (message) ->
  e = $('.petal .err')
  e.text(message)
  e.show()
  e.delay(7000).fadeOut(300)
